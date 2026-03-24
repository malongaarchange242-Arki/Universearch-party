import { PaymentsRepository } from './payments.repository';
import { CreatePaymentDto, PaymentResponse } from './payments.model';
import { TicketsService } from '../tickets/tickets.service';
import { MoMoPayment } from '../../integrations/momo/momo.payment';
import { MoMoStatus } from '../../integrations/momo/momo.status';
import { generateMoMoReference } from '../../shared/utils';
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

    console.log('✅ Payment saved with PENDING status:', { 
      momoReference, 
      customerName: data.name,
      amount: data.amount,
      status: 'PENDING'
    });

    return payment;
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

    return payment;
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
    return result.data;
  }

  /**
   * Validate payment (admin)
   */
  async validatePayment(id: string): Promise<PaymentResponse> {
    const payment = await this.getPaymentById(id);
    
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

    return updatedPayment;
  }

  /**
   * Reject payment (admin)
   */
  async rejectPayment(id: string): Promise<PaymentResponse> {
    const payment = await this.getPaymentById(id);
    
    if (payment.status === 'FAILED') {
      throw new Error('Payment already rejected');
    }

    return await this.repository.updateStatus(id, 'FAILED');
  }
}
