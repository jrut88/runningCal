import { supabase } from '../../lib/supabase';
import type { IPaymentService, InitiatePaymentParams, PaymentIntent } from './IPaymentService';

function generateMockRef(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class MockPaymentService implements IPaymentService {
  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentIntent> {
    const providerRef = generateMockRef();

    await supabase
      .from('payment_records')
      .update({
        status: 'paid',
        provider_ref: providerRef,
        paid_at: new Date().toISOString(),
      })
      .eq('id', params.paymentRecordId);

    return {
      id: providerRef,
      amount: params.amount,
      currency: params.currency,
      status: 'paid',
    };
  }

  async refundPayment(providerRef: string): Promise<void> {
    await supabase
      .from('payment_records')
      .update({ status: 'refunded' })
      .eq('provider_ref', providerRef);
  }

  async getPaymentStatus(providerRef: string): Promise<PaymentIntent['status']> {
    const { data } = await supabase
      .from('payment_records')
      .select('status')
      .eq('provider_ref', providerRef)
      .single();
    return (data?.status ?? 'pending') as PaymentIntent['status'];
  }
}
