/**
 * Payments Model Types
 */

export interface CreatePaymentDto {
  name: string; // Customer name
  phone: string; // Customer phone number for MoMo
  quantity: number; // Number of tickets
  amount: number; // Amount in XAF (not cents)
  transaction_id?: string; // MoMo transaction ID from user (optional)
  paymentMethod?: string; // Payment method: MTN or AIRTEL
  userId?: string; // Optional user ID for authenticated users
  eventId?: string; // Optional event ID
}

export interface PaymentResponse {
  id: string;
  userId: string;
  eventId: string;
  amount: number;
  status: string;
  momoReference: string;
  externalId?: string | null;
  customerName: string;
  phoneNumber: string;
  operator?: string; // MTN or AIRTEL
  quantity: number;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentStatusDto {
  momoReference: string;
  status: string;
}
