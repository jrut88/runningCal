import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useCreateEvent } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import type { GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'CreateEvent'>;

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  location: z.string().optional(),
  starts_at: z.string().min(1, 'Start date/time is required'),
  ends_at: z.string().optional(),
  max_players: z.string().optional(),
  cost_per_head: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateEventScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { user } = useAuth();
  const createEvent = useCreateEvent(groupId);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cost_per_head: '0' },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      const event = await createEvent.mutateAsync({
        group_id: groupId,
        title: data.title,
        location: data.location ?? null,
        starts_at: new Date(data.starts_at).toISOString(),
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
        max_players: data.max_players ? parseInt(data.max_players, 10) : null,
        cost_per_head: data.cost_per_head ? parseFloat(data.cost_per_head) : 0,
        currency: 'GBP',
        description: data.description ?? null,
        created_by: user.id,
      });
      navigation.replace('EventDetail', { eventId: event.id, groupId });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create event');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={ss.flex}>
      <ScrollView contentContainerStyle={ss.container} keyboardShouldPersistTaps="handled">
        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <Input label="Event title" placeholder="Sunday 5-a-side" value={value} onChangeText={onChange} error={errors.title?.message} />
        )} />

        <Controller control={control} name="location" render={({ field: { onChange, value } }) => (
          <Input label="Location (optional)" placeholder="Powerleague, Manchester" value={value} onChangeText={onChange} />
        )} />

        <Controller control={control} name="starts_at" render={({ field: { onChange, value } }) => (
          <Input
            label="Start date & time"
            placeholder="2025-06-15 10:00"
            value={value}
            onChangeText={onChange}
            error={errors.starts_at?.message}
          />
        )} />

        <Controller control={control} name="ends_at" render={({ field: { onChange, value } }) => (
          <Input label="End time (optional)" placeholder="2025-06-15 11:00" value={value} onChangeText={onChange} />
        )} />

        <View style={ss.row}>
          <View style={ss.half}>
            <Controller control={control} name="max_players" render={({ field: { onChange, value } }) => (
              <Input label="Max players" placeholder="10" keyboardType="number-pad" value={value} onChangeText={onChange} />
            )} />
          </View>
          <View style={ss.half}>
            <Controller control={control} name="cost_per_head" render={({ field: { onChange, value } }) => (
              <Input label="Cost per head (£)" placeholder="5.00" keyboardType="decimal-pad" value={value} onChangeText={onChange} />
            )} />
          </View>
        </View>

        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <Input label="Notes (optional)" placeholder="Bring bibs, meet at 9:50…" value={value} onChangeText={onChange} multiline numberOfLines={3} style={ss.multiline} />
        )} />

        <Button title="Create Event" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ss = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
