import { FastifyRequest, FastifyReply } from 'fastify';
import { TicketsService } from './tickets.service';
import { successResponse, errorResponse } from '../../shared/response';

/**
 * Tickets Controller
 * Handles HTTP requests for tickets
 */
export class TicketsController {
  private service: TicketsService;

  constructor() {
    this.service = new TicketsService();
  }

  /**
   * Get ticket by ID
   * GET /tickets/:ticketId
   */
  async getTicketById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { ticketId } = request.params as { ticketId: string };

      const ticket = await this.service.getTicketById(ticketId);

      return reply.status(200).send(
        successResponse('Ticket retrieved successfully', ticket)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ticket';
      return reply
        .status(errorMessage === 'Ticket not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }

  /**
   * Get user tickets
   * GET /tickets/user/:userId
   */
  async getUserTickets(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };

      const tickets = await this.service.getUserTickets(userId);

      return reply.status(200).send(
        successResponse('User tickets retrieved successfully', tickets)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user tickets';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Get event tickets
   * GET /tickets/event/:eventId
   */
  async getEventTickets(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventId } = request.params as { eventId: string };

      const tickets = await this.service.getEventTickets(eventId);

      return reply.status(200).send(
        successResponse('Event tickets retrieved successfully', tickets)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event tickets';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Mark ticket as used
   * POST /tickets/:ticketId/use
   */
  async useTicket(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { ticketId } = request.params as { ticketId: string };

      const ticket = await this.service.useTicket(ticketId);

      return reply.status(200).send(
        successResponse('Ticket marked as used', ticket)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to use ticket';
      return reply
        .status(errorMessage === 'Ticket not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }
}
