import { FastifyRequest, FastifyReply } from 'fastify';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './events.model';
import { successResponse, errorResponse, paginatedResponse } from '../../shared/response';

/**
 * Events Controller
 * Handles HTTP requests for events
 */
export class EventsController {
  private service: EventsService;

  constructor() {
    this.service = new EventsService();
  }

  /**
   * Create a new event
   * POST /events
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as CreateEventDto;

      const event = await this.service.createEvent(data);

      return reply.status(201).send(
        successResponse('Event created successfully', event)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Get all events
   * GET /events
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10 } = request.query as {
        page?: number;
        limit?: number;
      };

      const result = await this.service.getAllEvents(page, limit);

      return reply.status(200).send(
        paginatedResponse('Events retrieved successfully', result.data, page, limit, result.total)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Get event by ID
   * GET /events/:eventId
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventId } = request.params as { eventId: string };

      const event = await this.service.getEventById(eventId);

      return reply.status(200).send(
        successResponse('Event retrieved successfully', event)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event';
      return reply
        .status(errorMessage === 'Event not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }

  /**
   * Get events created by a user
   * GET /events/creator/:userId
   */
  async getByCreator(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };

      const events = await this.service.getEventsByCreator(userId);

      return reply.status(200).send(
        successResponse('User events retrieved successfully', events)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user events';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Update an event
   * PUT /events/:eventId
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventId } = request.params as { eventId: string };
      const data = request.body as UpdateEventDto;

      const event = await this.service.updateEvent(eventId, data);

      return reply.status(200).send(
        successResponse('Event updated successfully', event)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      return reply
        .status(errorMessage === 'Event not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }

  /**
   * Delete an event
   * DELETE /events/:eventId
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventId } = request.params as { eventId: string };

      await this.service.deleteEvent(eventId);

      return reply.status(200).send(
        successResponse('Event deleted successfully')
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      return reply
        .status(errorMessage === 'Event not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }
}
