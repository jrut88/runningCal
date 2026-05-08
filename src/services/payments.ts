import { supabase } from '../lib/supabase';
import type { PaymentRecord, PaymentRequest } from '../types/app';

export async function fetchPaymentRequest(eventId: string): Promise<PaymentRequest | null> {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  return data as PaymentRequest | null;
}

export async function fetchPaymentRecords(paymentRequestId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payment_records')
    .select('*, user:profiles(*)')
    .eq('payment_request_id', paymentRequestId);
  if (error) throw error;
  return (data ?? []) as unknown as PaymentRecord[];
}

export async function fetchMyPaymentRecord(
  paymentRequestId: string,
  userId: string
): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .eq('payment_request_id', paymentRequestId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as PaymentRecord | null;
}

export async function createPaymentRequest(payload: {
  event_id: string;
  created_by: string;
  amount: number;
  currency: string;
  description?: string | null;
}): Promise<PaymentRequest> {
  const { data, error } = await supabase
    .from('payment_requests')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentRequest;
}

export async function seedPaymentRecords(
  paymentRequestId: string,
  memberIds: string[],
  amount: number,
  currency: string
): Promise<void> {
  const records = memberIds.map((userId) => ({
    payment_request_id: paymentRequestId,
    user_id: userId,
    amount,
    currency,
    status: 'pending' as const,
  }));
  const { error } = await supabase.from('payment_records').insert(records);
  if (error) throw error;
}
