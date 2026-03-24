/**
 * Events Model Types
 */

export interface CreateEventDto {
  title: string;
  description?: string;
  price: number; // in cents
  date: string; // ISO date
  location: string;
  createdBy: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  price?: number;
  date?: string;
  location?: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  date: Date;
  location: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
