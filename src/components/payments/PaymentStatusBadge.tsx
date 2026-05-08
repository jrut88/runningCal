import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PaymentStatus } from '../../types/app';

const CONFIG: Record<PaymentStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pending', bg: '#fef9c3', color: '#854d0e' },
  paid: { label: 'Paid', bg: '#dcfce7', color: '#15803d' },
  failed: { label: 'Failed', bg: '#fee2e2', color: '#dc2626' },
  refunded: { label: 'Refunded', bg: '#f3f4f6', color: '#6b7280' },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, bg, color } = CONFIG[status];
  return (
    <View style={[ss.badge, { backgroundColor: bg }]}>
      <Text style={[ss.text, { color }]}>{label}</Text>
    </View>
  );
}

const ss = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
