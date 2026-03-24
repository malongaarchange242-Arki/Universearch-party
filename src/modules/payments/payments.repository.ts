import { supabase } from '../../config/supabase';
import { CreatePaymentDto, PaymentResponse, PaymentStatusDto } from './payments.model';

/**
 * Payments Repository
 * Handles all database operations for payments using Supabase
 */
export class PaymentsRepository {
  private mapPaymentRow(raw: any): PaymentResponse {
    return {
      id: raw.id,
      userId: raw.user_id || raw.userId,
      eventId: raw.event_id || raw.eventId,
      amount: raw.amount,
      status: raw.status,
      momoReference: raw.momo_reference || raw.momoReference,
      externalId: raw.external_id || raw.externalId || null,
      customerName: raw.customer_name || raw.customerName,
      phoneNumber: raw.phone_number || raw.phoneNumber,
      operator: raw.operator || 'MTN',
      quantity: raw.quantity,
      transactionId: raw.transaction_id || raw.transactionId,
      createdAt: raw.created_at || raw.createdAt,
      updatedAt: raw.updated_at || raw.updatedAt,
    } as PaymentResponse;
  }

  /**
   * Create a new payment record
   */
  async create(data: CreatePaymentDto & { momoReference: string; customerName: string; transactionId: string; paymentMethod?: string }): Promise<PaymentResponse> {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: data.userId,
          event_id: data.eventId,
          amount: data.amount,
          status: 'PENDING',
          momo_reference: data.momoReference,
          external_id: data.momoReference,
          customer_name: data.customerName,
          phone_number: data.phone,
          operator: data.paymentMethod ? data.paymentMethod.toUpperCase() : 'MTN',
          quantity: data.quantity,
          transaction_id: data.transactionId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    return this.mapPaymentRow(payment);
  }

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<PaymentResponse | null> {
    const { data: payment, error } = await supabase
      .from('payments')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find payment: ${error.message}`);
    }

    return payment ? this.mapPaymentRow(payment) : null;
  }

  /**
   * Find payment by MoMo reference
   */
  async findByMoMoReference(momoReference: string): Promise<PaymentResponse | null> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select()
      .eq('momo_reference', momoReference)
      .limit(1);

    if (error) {
      throw new Error(`Failed to find payment: ${error.message}`);
    }

    return payments && payments.length > 0 ? this.mapPaymentRow(payments[0]) : null;
  }

  /**
   * Get payments by user ID
   */
  async findByUserId(userId: string): Promise<PaymentResponse[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return payments ? payments.map((p: any) => this.mapPaymentRow(p)) : [];
  }

  /**
   * Update payment status
   */
  async updateStatus(id: string, status: string): Promise<PaymentResponse> {
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    return this.mapPaymentRow(payment);
  }

  /**
   * Update payment with external ID
   */
  async updateWithExternalId(
    id: string,
    externalId: string,
    status?: string
  ): Promise<PaymentResponse> {
    const updateData: any = { external_id: externalId };
    if (status) updateData.status = status;

    const { data: payment, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    return this.mapPaymentRow(payment);
  }

  /**
   * Get all payments (for admin)
   */
  async getAll(skip: number = 0, take: number = 10): Promise<{
    data: PaymentResponse[];
    total: number;
  }> {
    // Get total count
    const { count, error: countError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Failed to count payments: ${countError.message}`);
    }

    // Get paginated data
    const { data: payments, error } = await supabase
      .from('payments')
      .select()
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return {
      data: payments ? payments.map((p: any) => this.mapPaymentRow(p)) : [],
      total: count || 0,
    };
  }
}
