import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RsvpToggle } from '../../components/events/RsvpToggle';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PaymentStatusBadge } from '../../components/payments/PaymentStatusBadge';
import { useEventDetail } from '../../hooks/useEvents';
import { useEventRsvps, useUpsertRsvp } from '../../hooks/useRsvp';
import { usePaymentRequest, useMyPaymentRecord, usePayNow } from '../../hooks/usePayments';
import { useGroupMembers } from '../../hooks/useGroups';
import { useAuth } from '../../hooks/useAuth';
import type { GroupStackParamList } from '../../navigation/types';
import type { RsvpStatus } from '../../types/app';

type Props = NativeStackScreenProps<GroupStackParamList, 'EventDetail'>;

export default function EventDetailScreen({ route, navigation }: Props) {
  const { eventId, groupId } = route.params;
  const { user } = useAuth();

  const { data: event, isLoading: eventLoading } = useEventDetail(eventId);
  const { data: rsvps, isLoading: rsvpsLoading } = useEventRsvps(eventId);
  const { data: members } = useGroupMembers(groupId);
  const { data: paymentRequest } = usePaymentRequest(eventId);
  const { data: myPaymentRecord } = useMyPaymentRecord(
    paymentRequest?.id ?? '',
    user?.id ?? ''
  );

  const upsertRsvp = useUpsertRsvp(eventId);
  const payNow = usePayNow();

  if (eventLoading || rsvpsLoading) return <LoadingSpinner />;
  if (!event) return null;

  const myRsvp = rsvps?.find((r) => r.user_id === user?.id);
  const inCount = rsvps?.filter((r) => r.status === 'in').length ?? 0;
  const outCount = rsvps?.filter((r) => r.status === 'out').length ?? 0;
  const maybeCount = rsvps?.filter((r) => r.status === 'maybe').length ?? 0;

  const myMembership = members?.find((m) => m.user_id === user?.id);
  const isOrganiser = myMembership?.role === 'organiser';

  const handleRsvp = (status: RsvpStatus) => {
    if (!user) return;
    upsertRsvp.mutate({ userId: user.id, status });
  };

  const handlePayNow = async () => {
    if (!myPaymentRecord) return;
    try {
      await payNow.mutateAsync({
        paymentRecordId: myPaymentRecord.id,
        paymentRequestId: paymentRequest!.id,
        amount: myPaymentRecord.amount,
        currency: myPaymentRecord.currency,
        description: `Payment for ${event.title}`,
      });
      Alert.alert('Payment confirmed!', 'Your payment has been recorded.');
    } catch (e: any) {
      Alert.alert('Payment failed', e.message);
    }
  };

  return (
    <ScrollView style={ss.scroll}>
      {/* Event header */}
      <View style={ss.header}>
        <Text style={ss.title}>{event.title}</Text>
        <Text style={ss.date}>{format(new Date(event.starts_at), 'EEEE d MMMM yyyy · HH:mm')}</Text>
        {event.ends_at && (
          <Text style={ss.date}>until {format(new Date(event.ends_at), 'HH:mm')}</Text>
        )}
        {event.location ? <Text style={ss.location}>📍 {event.location}</Text> : null}
        {event.description ? <Text style={ss.description}>{event.description}</Text> : null}
        {event.max_players ? (
          <Text style={ss.meta}>Max players: {event.max_players}</Text>
        ) : null}
      </View>

      {/* RSVP summary */}
      <View style={ss.section}>
        <Text style={ss.sectionTitle}>Who's coming?</Text>
        <View style={ss.rsvpSummary}>
          <View style={ss.rsvpStat}><Text style={ss.rsvpNum}>{inCount}</Text><Text style={ss.rsvpLabel}>In</Text></View>
          <View style={ss.rsvpStat}><Text style={ss.rsvpNum}>{maybeCount}</Text><Text style={ss.rsvpLabel}>Maybe</Text></View>
          <View style={ss.rsvpStat}><Text style={ss.rsvpNum}>{outCount}</Text><Text style={ss.rsvpLabel}>Out</Text></View>
        </View>

        <Text style={ss.subLabel}>Your response</Text>
        <RsvpToggle
          value={myRsvp?.status ?? null}
          onChange={handleRsvp}
          disabled={upsertRsvp.isPending}
        />

        <TouchableOpacity
          style={ss.viewAllLink}
          onPress={() => navigation.navigate('RsvpScreen', { eventId })}
        >
          <Text style={ss.viewAllText}>View all responses →</Text>
        </TouchableOpacity>
      </View>

      {/* Payment section */}
      {event.cost_per_head > 0 && (
        <View style={ss.section}>
          <Text style={ss.sectionTitle}>Payment</Text>
          <Text style={ss.costText}>£{event.cost_per_head.toFixed(2)} per person</Text>

          {paymentRequest ? (
            myPaymentRecord ? (
              <View style={ss.payRow}>
                <Text style={ss.payLabel}>Your payment</Text>
                <PaymentStatusBadge status={myPaymentRecord.status} />
                {myPaymentRecord.status === 'pending' && (
                  <TouchableOpacity
                    style={ss.payBtn}
                    onPress={handlePayNow}
                    disabled={payNow.isPending}
                  >
                    <Text style={ss.payBtnText}>
                      {payNow.isPending ? 'Processing…' : `Pay £${myPaymentRecord.amount.toFixed(2)}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Text style={ss.notIncluded}>You're not in the payment request (RSVP 'In' to be included).</Text>
            )
          ) : isOrganiser ? (
            <TouchableOpacity
              style={ss.payBtn}
              onPress={() => navigation.navigate('PaymentRequest', { eventId, groupId })}
            >
              <Text style={ss.payBtnText}>Request payment from members</Text>
            </TouchableOpacity>
          ) : (
            <Text style={ss.notIncluded}>Payment hasn't been requested yet.</Text>
          )}

          {isOrganiser && paymentRequest && (
            <TouchableOpacity
              style={ss.viewAllLink}
              onPress={() => navigation.navigate('PaymentStatus', { paymentRequestId: paymentRequest.id, eventTitle: event.title })}
            >
              <Text style={ss.viewAllText}>View payment status →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  date: { fontSize: 14, color: '#16a34a', fontWeight: '500', marginBottom: 2 },
  location: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  description: { fontSize: 14, color: '#374151', marginTop: 8, lineHeight: 20 },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  section: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  subLabel: { fontSize: 13, color: '#6b7280', marginBottom: 8, marginTop: 12 },
  rsvpSummary: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  rsvpStat: { flex: 1, alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10 },
  rsvpNum: { fontSize: 22, fontWeight: '700', color: '#16a34a' },
  rsvpLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  viewAllLink: { marginTop: 12, alignSelf: 'flex-end' },
  viewAllText: { fontSize: 13, color: '#16a34a', fontWeight: '500' },
  costText: { fontSize: 15, color: '#374151', marginBottom: 12 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  payLabel: { fontSize: 14, color: '#374151', flex: 1 },
  payBtn: { backgroundColor: '#16a34a', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginTop: 8 },
  payBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  notIncluded: { fontSize: 13, color: '#6b7280', fontStyle: 'italic' },
});
