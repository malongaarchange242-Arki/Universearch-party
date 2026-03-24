import { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './payments.model';
import { successResponse, errorResponse } from '../../shared/response';

/**
 * Payments Controller
 * Handles HTTP requests for payments
 */
export class PaymentsController {
  private service: PaymentsService;

  constructor() {
    this.service = new PaymentsService();
  }

  /**
   * Request payment (initiate MoMo payment)
   * POST /payments
   */
  async requestPayment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as CreatePaymentDto;

      // Validate required fields
      if (!data.name || !data.phone || !data.quantity || !data.amount) {
        return reply.status(400).send(
          errorResponse('Missing required fields: name, phone, quantity, amount')
        );
      }

      const payment = await this.service.requestPayment(data);

      return reply.status(201).send(
        successResponse('Payment initiated successfully', {
          ...payment,
          message: 'Please complete the payment on your phone',
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request payment';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Check payment status
   * GET /payments/status/:reference
   */
  async checkPaymentStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { reference } = request.params as { reference: string };

      const payment = await this.service.checkPaymentStatus(reference);

      const message =
        payment.status === 'SUCCESSFUL'
          ? 'Payment successful! Ticket has been generated.'
          : `Payment status: ${payment.status}`;

      return reply.status(200).send(
        successResponse(message, {
          ...payment,
          status: payment.status,
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check payment status';
      return reply
        .status(errorMessage === 'Payment not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }

  /**
   * Get payment by ID
   * GET /payments/:paymentId
   */
  async getPaymentById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { paymentId } = request.params as { paymentId: string };

      const payment = await this.service.getPaymentById(paymentId);

      return reply.status(200).send(
        successResponse('Payment retrieved successfully', payment)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment';
      return reply
        .status(errorMessage === 'Payment not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }

  /**
   * Get all payments (admin)
   * GET /payments
   */
  async getAllPayments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const payments = await this.service.getAllPayments();

      return reply.status(200).send(
        successResponse('All payments retrieved successfully', payments)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payments';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Scan and decrypt QR code (admin)
   * POST /payments/scan-qr
   * Body: { encryptedQRData: string }
   */
  async scanQRCode(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { encryptedQRData } = request.body as { encryptedQRData: string };

      if (!encryptedQRData) {
        return reply.status(400).send(
          errorResponse('Missing encryptedQRData field')
        );
      }

      const decryptedData = await this.service.decryptAndVerifyQR(encryptedQRData);

      return reply.status(200).send(
        successResponse('QR code decrypted successfully', decryptedData)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decrypt QR code';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Validate payment (admin)
   * PATCH /payments/:paymentId/validate
   */
  async validatePayment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { paymentId } = request.params as { paymentId: string };

      const payment = await this.service.validatePayment(paymentId);

      return reply.status(200).send(
        successResponse('Payment validated successfully', payment)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate payment';
      return reply
        .status(errorMessage === 'Payment not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }

  /**
   * Reject payment (admin)
   * PATCH /payments/:paymentId/reject
   */
  async rejectPayment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { paymentId } = request.params as { paymentId: string };

      const payment = await this.service.rejectPayment(paymentId);

      return reply.status(200).send(
        successResponse('Payment rejected successfully', payment)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject payment';
      return reply
        .status(errorMessage === 'Payment not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }

  /**
   * Get user payments
   * GET /payments/user/:userId
   */
  async getUserPayments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };

      const payments = await this.service.getUserPayments(userId);

      return reply.status(200).send(
        successResponse('User payments retrieved successfully', payments)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user payments';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }
}

