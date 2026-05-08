export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  metadata?: Record<string, string>;
}

export interface InitiatePaymentParams {
  paymentRecordId: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface IPaymentService {
  /**
   * Initiates a payment for a member.
   * Mock: instantly resolves as paid.
   * Stripe (future): opens Stripe Payment Sheet.
   */
  initiatePayment(params: InitiatePaymentParams): Promise<PaymentIntent>;

  /**
   * Refunds a previously completed payment.
   */
  refundPayment(providerRef: string): Promise<void>;

  /**
   * Retrieves the current status of a payment by its provider reference.
   */
  getPaymentStatus(providerRef: string): Promise<PaymentIntent['status']>;
}
