import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PaymentListItem } from '../../components/payments/PaymentListItem';
import { usePaymentRecords } from '../../hooks/usePayments';
import { queryClient } from '../../lib/queryClient';
import { supabase } from '../../lib/supabase';
import type { GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'PaymentStatus'>;

export default function PaymentStatusScreen({ route }: Props) {
  const { paymentRequestId, eventTitle } = route.params;
  const { data: records, isLoading, refetch, isRefetching } = usePaymentRecords(paymentRequestId);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`payment_records:${paymentRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_records',
          filter: `payment_request_id=eq.${paymentRequestId}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ['paymentRecords', paymentRequestId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [paymentRequestId]);

  if (isLoading) return <LoadingSpinner />;

  const paidCount = records?.filter((r) => r.status === 'paid').length ?? 0;
  const totalCount = records?.length ?? 0;

  return (
    <View style={ss.container}>
      {/* Summary bar */}
      <View style={ss.summary}>
        <Text style={ss.summaryText}>{paidCount} / {totalCount} paid</Text>
        <View style={ss.progressBar}>
          <View style={[ss.progressFill, { width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }]} />
        </View>
      </View>

      <FlatList
        data={records ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PaymentListItem record={item} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={ss.list}
        ListEmptyComponent={
          <View style={ss.empty}>
            <Text style={ss.emptyText}>No payment records yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  summary: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  summaryText: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 4 },
  list: { padding: 16 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#6b7280', fontSize: 14 },
});
