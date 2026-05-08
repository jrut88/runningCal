import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentRequest,
  fetchMyPaymentRecord,
  fetchPaymentRecords,
  fetchPaymentRequest,
  seedPaymentRecords,
} from '../services/payments';
import { paymentService } from '../services/payment';

export function usePaymentRequest(eventId: string) {
  return useQuery({
    queryKey: ['paymentRequest', eventId],
    queryFn: () => fetchPaymentRequest(eventId),
    enabled: !!eventId,
  });
}

export function usePaymentRecords(paymentRequestId: string) {
  return useQuery({
    queryKey: ['paymentRecords', paymentRequestId],
    queryFn: () => fetchPaymentRecords(paymentRequestId),
    enabled: !!paymentRequestId,
  });
}

export function useMyPaymentRecord(paymentRequestId: string, userId: string) {
  return useQuery({
    queryKey: ['paymentRecord', paymentRequestId, userId],
    queryFn: () => fetchMyPaymentRecord(paymentRequestId, userId),
    enabled: !!(paymentRequestId && userId),
  });
}

export function useCreatePaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      createdBy,
      amount,
      currency,
      description,
      memberIds,
    }: {
      eventId: string;
      createdBy: string;
      amount: number;
      currency: string;
      description?: string | null;
      memberIds: string[];
    }) => {
      const request = await createPaymentRequest({
        event_id: eventId,
        created_by: createdBy,
        amount,
        currency,
        description,
      });
      await seedPaymentRecords(request.id, memberIds, amount, currency);
      return request;
    },
    onSuccess: (_data, { eventId }) => {
      qc.invalidateQueries({ queryKey: ['paymentRequest', eventId] });
    },
  });
}

export function usePayNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      paymentRecordId,
      paymentRequestId,
      amount,
      currency,
      description,
    }: {
      paymentRecordId: string;
      paymentRequestId: string;
      amount: number;
      currency: string;
      description: string;
    }) => {
      return paymentService.initiatePayment({
        paymentRecordId,
        amount,
        currency,
        description,
      });
    },
    onSuccess: (_data, { paymentRequestId }) => {
      qc.invalidateQueries({ queryKey: ['paymentRecords', paymentRequestId] });
      qc.invalidateQueries({ queryKey: ['paymentRecord'] });
    },
  });
}
