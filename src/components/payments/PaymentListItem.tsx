import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PaymentRecord } from '../../types/app';
import { Avatar } from '../common/Avatar';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentListItemProps {
  record: PaymentRecord;
}

export function PaymentListItem({ record }: PaymentListItemProps) {
  const name = record.user?.display_name ?? 'Unknown';
  return (
    <View style={ss.row}>
      <Avatar name={name} url={record.user?.avatar_url} size={36} />
      <Text style={ss.name}>{name}</Text>
      <Text style={ss.amount}>£{record.amount.toFixed(2)}</Text>
      <PaymentStatusBadge status={record.status} />
    </View>
  );
}

const ss = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  name: { flex: 1, fontSize: 15, color: '#111827' },
  amount: { fontSize: 14, fontWeight: '600', color: '#374151', marginRight: 4 },
});
