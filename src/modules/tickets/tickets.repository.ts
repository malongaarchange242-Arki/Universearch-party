import { supabase } from '../../config/supabase';
import { CreateTicketDto, TicketResponse } from './tickets.model';

/**
 * Tickets Repository
 * Handles all database operations for tickets using Supabase
 */
export class TicketsRepository {
  /**
   * Create a new ticket
   */
  async create(data: CreateTicketDto & { qrCode: string }): Promise<TicketResponse> {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([
        {
          userId: data.userId,
          eventId: data.eventId,
          paymentId: data.paymentId,
          qrCode: data.qrCode,
          status: 'ACTIVE',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }

    return ticket as TicketResponse;
  }

  /**
   * Find ticket by ID
   */
  async findById(id: string): Promise<TicketResponse | null> {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find ticket: ${error.message}`);
    }

    return ticket as TicketResponse | null;
  }

  /**
   * Find tickets by user ID
   */
  async findByUserId(userId: string): Promise<TicketResponse[]> {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select()
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }

    return tickets as TicketResponse[];
  }

  /**
   * Find tickets by event ID
   */
  async findByEventId(eventId: string): Promise<TicketResponse[]> {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select()
      .eq('eventId', eventId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }

    return tickets as TicketResponse[];
  }

  /**
   * Find ticket by payment ID
   */
  async findByPaymentId(paymentId: string): Promise<TicketResponse | null> {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select()
      .eq('paymentId', paymentId)
      .limit(1);

    if (error) {
      throw new Error(`Failed to find ticket: ${error.message}`);
    }

    return tickets && tickets.length > 0 ? (tickets[0] as TicketResponse) : null;
  }

  /**
   * Update ticket status
   */
  async updateStatus(id: string, status: string): Promise<TicketResponse> {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ticket: ${error.message}`);
    }

    return ticket as TicketResponse;
  }

  /**
   * Mark ticket as used
   */
  async markAsUsed(id: string): Promise<TicketResponse> {
    return await this.updateStatus(id, 'USED');
  }
}
