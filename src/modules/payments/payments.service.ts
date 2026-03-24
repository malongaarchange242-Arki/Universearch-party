import { PaymentsRepository } from './payments.repository';
import { CreatePaymentDto, PaymentResponse } from './payments.model';
import { TicketsService } from '../tickets/tickets.service';
import { MoMoPayment } from '../../integrations/momo/momo.payment';
import { MoMoStatus } from '../../integrations/momo/momo.status';
import { generateMoMoReference, generateQRCode, decryptQRData } from '../../shared/utils';
import { EventsService } from '../events/events.service';
import { AuthService } from '../auth/auth.service';
import { config } from '../../config/env';

/**
 * Payments Service
 * Contains business logic for payments and MoMo integration
 */
export class PaymentsService {
  private repository: PaymentsRepository;
  private ticketsService: TicketsService;
  private momoPayment: MoMoPayment;
  private momoStatus: MoMoStatus;
  private eventsService: EventsService;
  private authService: AuthService;

  constructor() {
    this.repository = new PaymentsRepository();
    this.ticketsService = new TicketsService();
    this.momoPayment = new MoMoPayment();
    this.momoStatus = new MoMoStatus();
    this.eventsService = new EventsService();
    this.authService = new AuthService();
  }

  /**
   * Request payment (save payment with PENDING status for manual validation)
   */
  async requestPayment(data: CreatePaymentDto): Promise<PaymentResponse> {
    // Normalize and validate phone number format
    let phone = data.phone.trim();
    
    // If local format (9 digits starting with 6), convert to international
    if (/^6\d{8}$/.test(phone)) {
      phone = '+242' + phone;
    }
    
    // Validate international format (+242 followed by 9 digits)
    if (!phone.match(/^\+242\d{9}$/)) {
      throw new Error('Numéro MTN MoMo invalide. Format: +242XXXXXXXXX');
    }
    
    // Update data with normalized phone
    data.phone = phone;

    // Optional: Validate user if userId is provided
    if (data.userId) {
      const user = await this.authService.getUserProfile(data.userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
    }

    // Optional: Validate event if eventId is provided
    if (data.eventId) {
      const event = await this.eventsService.getEventById(data.eventId);
      if (!event) {
        throw new Error('Événement non trouvé');
      }
    }

    // Generate MoMo reference
    const momoReference = generateMoMoReference();

    // If no transaction ID is provided (manuel), use momoReference as transaction identifier
    const transactionId = data.transaction_id && data.transaction_id.trim().length >= 5
      ? data.transaction_id.trim()
      : momoReference;

    // Create payment record in DB with PENDING status (no automatic MoMo API call)
    const payment = await this.repository.create({
      name: data.name,
      phone: data.phone,
      quantity: data.quantity,
      amount: data.amount * 100, // Store in cents
      transaction_id: transactionId,
      paymentMethod: data.paymentMethod || 'MTN',
      userId: data.userId || 'anonymous',
      eventId: data.eventId || '',
      momoReference,
      customerName: data.name,
      transactionId: transactionId,
    });

    // Generate QR code with format: UP|momo_reference|nom|status|QTY:X
    const qrCodeData = `UP|${momoReference}|${data.name}|PENDING|QTY:${data.quantity}`;
    const qrCode = await generateQRCode(qrCodeData);

    console.log('✅ Payment saved with PENDING status:', { 
      momoReference, 
      customerName: data.name,
      amount: data.amount,
      status: 'PENDING'
    });

    // Return payment with QR code
    return {
      ...payment,
      qrCode
    };
  }

  /**
   * Check payment status and create ticket if successful
   */
  async checkPaymentStatus(momoReference: string): Promise<PaymentResponse> {
    // Find payment
    const payment = await this.repository.findByMoMoReference(momoReference);
    if (!payment) {
      throw new Error('Payment not found');
    }

    try {
      // Check status with MoMo
      console.log('🔍 Checking payment status for:', momoReference);
      const momoStatusResponse = await this.momoStatus.getPaymentStatus(momoReference);

      console.log('📋 MoMo Response:', {
        status: momoStatusResponse.status,
        amount: momoStatusResponse.amount,
        currency: momoStatusResponse.currency,
      });

      // Update payment status
      const updatedPayment = await this.repository.updateStatus(
        payment.id,
        momoStatusResponse.status
      );

      console.log('💾 Payment updated:', {
        paymentId: payment.id,
        status: momoStatusResponse.status,
      });

      // If payment is successful, create ticket
      if (momoStatusResponse.status === 'SUCCESSFUL') {
        try {
          await this.ticketsService.createTicket({
            userId: payment.userId,
            eventId: payment.eventId,
            paymentId: payment.id,
          });

          console.log('🎫 Ticket created for payment:', momoReference);
        } catch (ticketError) {
          console.error('❌ Error creating ticket:', ticketError);
          // Don't throw error here, payment was successful
        }
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Return current payment state
      return payment;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<PaymentResponse> {
    const payment = await this.repository.findById(id);

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Generate QR code with current status
    const qrCodeData = `UP|${payment.momoReference}|${payment.customerName}|${payment.status}|QTY:${payment.quantity}`;
    const qrCode = await generateQRCode(qrCodeData);

    return {
      ...payment,
      qrCode
    };
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId: string): Promise<PaymentResponse[]> {
    return await this.repository.findByUserId(userId);
  }

  /**
   * Get all payments (admin)
   */
  async getAllPayments(): Promise<PaymentResponse[]> {
    const result = await this.repository.getAll(0, 1000);
    
    // Generate QR codes for all payments
    const paymentsWithQR = await Promise.all(
      result.data.map(async (payment) => {
        const qrCodeData = `UP|${payment.momoReference}|${payment.customerName}|${payment.status}|QTY:${payment.quantity}`;
        const qrCode = await generateQRCode(qrCodeData);
        return {
          ...payment,
          qrCode
        };
      })
    );
    
    return paymentsWithQR;
  }

  /**
   * Validate payment (admin)
   */
  async validatePayment(id: string): Promise<PaymentResponse> {
    const payment = await this.repository.findById(id);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status === 'SUCCESSFUL') {
      throw new Error('Payment already validated');
    }

    const updatedPayment = await this.repository.updateStatus(id, 'SUCCESSFUL');

    // Create ticket if payment is now successful
    try {
      await this.ticketsService.createTicket({
        userId: updatedPayment.userId,
        eventId: updatedPayment.eventId,
        paymentId: id,
      });
      console.log('🎫 Ticket created after admin validation:', id);
    } catch (ticketError) {
      console.error('Warning: Could not create ticket:', ticketError);
    }

    // Generate QR code with updated status
    const qrCodeData = `UP|${updatedPayment.momoReference}|${updatedPayment.customerName}|SUCCESSFUL|QTY:${updatedPayment.quantity}`;
    const qrCode = await generateQRCode(qrCodeData);

    return {
      ...updatedPayment,
      qrCode
    };
  }

  /**
   * Decrypt and verify QR code (admin scanner)
   * Returns payment details from encrypted QR data
   */
  async decryptAndVerifyQR(encryptedQRData: string): Promise<any> {
    try {
      // Decrypt the QR code data
      const decryptedData = decryptQRData(encryptedQRData);
      
      // Parse the decrypted data: UP|momoReference|customerName|status|QTY:X
      const parts = decryptedData.split('|');
      if (parts.length < 5 || parts[0] !== 'UP') {
        throw new Error('Invalid QR code format');
      }

      const [, momoReference, customerName, status, qtyPart] = parts;
      const quantity = parseInt(qtyPart.split(':')[1], 10);

      // Find payment in database
      const payment = await this.repository.findByMoMoReference(momoReference);
      
      if (!payment) {
        throw new Error(`Payment not found for reference: ${momoReference}`);
      }

      // Verify the data matches
      if (payment.customerName !== customerName) {
        throw new Error('Customer name mismatch - QR may be forged');
      }

      if (payment.quantity !== quantity) {
        throw new Error('Quantity mismatch - QR may be forged');
      }

      console.log('✅ QR code verified successfully:', { momoReference, customerName, status });

      return {
        success: true,
        payment: {
          id: payment.id,
          momoReference: payment.momoReference,
          customerName: payment.customerName,
          amount: payment.amount / 100, // Convert from cents
          quantity: payment.quantity,
          status: payment.status,
          operator: payment.operator,
          phone: payment.phoneNumber,
          createdAt: payment.createdAt,
          qrStatus: status // Status from QR (encrypted)
        },
        message: `Ticket valide - ${payment.customerName} (${status})`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decrypt QR code';
      throw new Error(errorMessage);
    }
  }

  /**
   * Reject payment (admin)
   */
  async rejectPayment(id: string): Promise<PaymentResponse> {
    const payment = await this.repository.findById(id);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status === 'FAILED') {
      throw new Error('Payment already rejected');
    }

    const updatedPayment = await this.repository.updateStatus(id, 'FAILED');

    // Generate QR code with updated status
    const qrCodeData = `UP|${updatedPayment.momoReference}|${updatedPayment.customerName}|FAILED|QTY:${updatedPayment.quantity}`;
    const qrCode = await generateQRCode(qrCodeData);

    return {
      ...updatedPayment,
      qrCode
    };
  }
}
