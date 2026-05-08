import { MockPaymentService } from './MockPaymentService';
// Swap this import for StripePaymentService when integrating Stripe
export const paymentService = new MockPaymentService();
