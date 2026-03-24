import { EventsRepository } from './events.repository';
import { CreateEventDto, UpdateEventDto, EventResponse } from './events.model';

/**
 * Events Service
 * Contains business logic for events
 */
export class EventsService {
  private repository: EventsRepository;

  constructor() {
    this.repository = new EventsRepository();
  }

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventDto): Promise<EventResponse> {
    // Validate input
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Event title is required');
    }

    if (data.price < 0) {
      throw new Error('Price cannot be negative');
    }

    const eventDate = new Date(data.date);
    if (eventDate < new Date()) {
      throw new Error('Event date cannot be in the past');
    }

    if (!data.location || data.location.trim().length === 0) {
      throw new Error('Location is required');
    }

    return await this.repository.create(data);
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<EventResponse> {
    const event = await this.repository.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  /**
   * Get all events
   */
  async getAllEvents(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: EventResponse[]; total: number; page: number }> {
    const skip = (page - 1) * limit;

    const result = await this.repository.findAll(skip, limit);

    return {
      data: result.data,
      total: result.total,
      page,
    };
  }

  /**
   * Get events created by a specific user
   */
  async getEventsByCreator(userId: string): Promise<EventResponse[]> {
    return await this.repository.findByCreator(userId);
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, data: UpdateEventDto): Promise<EventResponse> {
    const event = await this.repository.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    if (data.price !== undefined && data.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (data.date && new Date(data.date) < new Date()) {
      throw new Error('Event date cannot be in the past');
    }

    return await this.repository.update(id, data);
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    const event = await this.repository.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new Error('Failed to delete event');
    }
  }
}
