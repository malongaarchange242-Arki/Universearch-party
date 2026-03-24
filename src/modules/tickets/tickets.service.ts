import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto, TicketResponse } from './tickets.model';
import { generateQRCode } from '../../shared/utils';

/**
 * Tickets Service
 * Contains business logic for tickets
 */
export class TicketsService {
  private repository: TicketsRepository;

  constructor() {
    this.repository = new TicketsRepository();
  }

  /**
   * Create a new ticket
   */
  async createTicket(data: CreateTicketDto): Promise<TicketResponse> {
    // Check if ticket already exists for this payment
    const existingTicket = await this.repository.findByPaymentId(data.paymentId);
    if (existingTicket) {
      throw new Error('Ticket already exists for this payment');
    }

    // Generate QR code data (contains ticket ID and event info)
    const qrCodeData = JSON.stringify({
      ticketId: data.paymentId, // Use paymentId as unique identifier
      userId: data.userId,
      eventId: data.eventId,
      timestamp: new Date().toISOString(),
    });

    // Generate QR code
    const qrCode = await generateQRCode(qrCodeData);

    // Create ticket
    const ticket = await this.repository.create({
      ...data,
      qrCode,
    });

    console.log('✅ Ticket created:', {
      ticketId: ticket.id,
      userId: data.userId,
      eventId: data.eventId,
    });

    return ticket;
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(id: string): Promise<TicketResponse> {
    const ticket = await this.repository.findById(id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  /**
   * Get user tickets
   */
  async getUserTickets(userId: string): Promise<TicketResponse[]> {
    return await this.repository.findByUserId(userId);
  }

  /**
   * Get event tickets
   */
  async getEventTickets(eventId: string): Promise<TicketResponse[]> {
    return await this.repository.findByEventId(eventId);
  }

  /**
   * Validate and mark ticket as used
   */
  async useTicket(ticketId: string): Promise<TicketResponse> {
    const ticket = await this.repository.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'ACTIVE') {
      throw new Error(`Ticket is ${ticket.status.toLowerCase()}, cannot be used`);
    }

    return await this.repository.markAsUsed(ticketId);
  }
}
