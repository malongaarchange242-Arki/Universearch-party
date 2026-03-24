/**
 * Tickets Model Types
 */

export interface CreateTicketDto {
  userId: string;
  eventId: string;
  paymentId: string;
}

export interface TicketResponse {
  id: string;
  userId: string;
  eventId: string;
  paymentId: string;
  qrCode: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
