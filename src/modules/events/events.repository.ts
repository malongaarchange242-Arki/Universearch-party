import { supabase } from '../../config/supabase';
import { CreateEventDto, UpdateEventDto, EventResponse } from './events.model';

/**
 * Events Repository
 * Handles all database operations for events using Supabase
 */
export class EventsRepository {
  /**
   * Create a new event
   */
  async create(data: CreateEventDto): Promise<EventResponse> {
    const { data: event, error } = await supabase
      .from('events')
      .insert([
        {
          title: data.title,
          description: data.description,
          price: data.price,
          date: new Date(data.date).toISOString(),
          location: data.location,
          createdBy: data.createdBy,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return event as EventResponse;
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<EventResponse | null> {
    const { data: event, error } = await supabase
      .from('events')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find event: ${error.message}`);
    }

    return event as EventResponse | null;
  }

  /**
   * Get all events
   */
  async findAll(skip: number = 0, take: number = 10): Promise<{
    data: EventResponse[];
    total: number;
  }> {
    // Get total count
    const { count, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Failed to count events: ${countError.message}`);
    }

    // Get paginated data
    const { data: events, error } = await supabase
      .from('events')
      .select()
      .order('date', { ascending: true })
      .range(skip, skip + take - 1);

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return {
      data: events as EventResponse[],
      total: count || 0,
    };
  }

  /**
   * Get events by creator
   */
  async findByCreator(createdBy: string): Promise<EventResponse[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select()
      .eq('createdBy', createdBy)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch events by creator: ${error.message}`);
    }

    return events as EventResponse[];
  }

  /**
   * Update an event
   */
  async update(id: string, data: UpdateEventDto): Promise<EventResponse> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.date !== undefined) updateData.date = new Date(data.date).toISOString();
    if (data.location !== undefined) updateData.location = data.location;

    const { data: event, error } = await supabase
      .from('Event')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return event as EventResponse;
  }

  /**
   * Delete an event
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}
