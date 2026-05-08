import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useEventDetail } from '../../hooks/useEvents';
import { useEventRsvps } from '../../hooks/useRsvp';
import { useCreatePaymentRequest } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';
import type { GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'PaymentRequest'>;

const schema = z.object({
  amount: z.string().refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function PaymentRequestScreen({ route, navigation }: Props) {
  const { eventId, groupId } = route.params;
  const { user } = useAuth();
  const { data: event } = useEventDetail(eventId);
  const { data: rsvps } = useEventRsvps(eventId);
  const createRequest = useCreatePaymentRequest();

  const inRsvps = rsvps?.filter((r) => r.status === 'in') ?? [];

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: event?.cost_per_head?.toFixed(2) ?? '0.00' },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    if (inRsvps.length === 0) {
      Alert.alert('No members to charge', 'No members have RSVP\'d "In" yet.');
      return;
    }

    try {
      const request = await createRequest.mutateAsync({
        eventId,
        createdBy: user.id,
        amount: parseFloat(data.amount),
        currency: 'GBP',
        description: data.description ?? null,
        memberIds: inRsvps.map((r) => r.user_id),
      });
      navigation.replace('PaymentStatus', {
        paymentRequestId: request.id,
        eventTitle: event?.title ?? 'Event',
      });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create payment request');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={ss.flex}>
      <ScrollView contentContainerStyle={ss.container} keyboardShouldPersistTaps="handled">
        {event && (
          <View style={ss.info}>
            <Text style={ss.eventTitle}>{event.title}</Text>
            <Text style={ss.inCount}>
              {inRsvps.length} member{inRsvps.length !== 1 ? 's' : ''} have RSVP'd In — they'll receive a payment request.
            </Text>
          </View>
        )}

        <Controller control={control} name="amount" render={({ field: { onChange, value } }) => (
          <Input
            label="Amount per person (£)"
            placeholder="5.00"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChange}
            error={errors.amount?.message}
          />
        )} />

        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <Input
            label="Note (optional)"
            placeholder="Pitch hire + bibs"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={2}
          />
        )} />

        <Button
          title={`Request payment from ${inRsvps.length} member${inRsvps.length !== 1 ? 's' : ''}`}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ss = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20 },
  info: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 14, marginBottom: 16 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  inCount: { fontSize: 13, color: '#16a34a' },
});
