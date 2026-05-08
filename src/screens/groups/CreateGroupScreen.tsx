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
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useCreateGroup } from '../../hooks/useGroups';
import type { GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'CreateGroup'>;

const SPORTS = ['football', 'running', 'tennis', 'basketball', 'cycling', 'general'];

const schema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  sport: z.string().min(1, 'Pick a sport'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateGroupScreen({ navigation }: Props) {
  const createGroup = useCreateGroup();
  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sport: 'general' },
  });

  const selectedSport = watch('sport');

  const onSubmit = async (data: FormData) => {
    try {
      const groupId = await createGroup.mutateAsync({
        name: data.name,
        sport: data.sport,
        description: data.description ?? null,
      });
      navigation.replace('GroupDetail', { groupId });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create group');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={ss.flex}>
      <ScrollView contentContainerStyle={ss.container} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label="Group name" placeholder="Sunday 5-a-side" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />

        <Text style={ss.label}>Sport</Text>
        <View style={ss.sportGrid}>
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[ss.sportBtn, selectedSport === sport && ss.sportBtnActive]}
              onPress={() => setValue('sport', sport)}
            >
              <Text style={ss.sportText}>{sport}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description (optional)"
              placeholder="A quick note about this group…"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              style={ss.multiline}
            />
          )}
        />

        <Button title="Create Group" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={ss.btn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ss = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  sportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  sportBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  sportBtnActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  sportText: { fontSize: 14, textTransform: 'capitalize', color: '#374151' },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  btn: { marginTop: 8 },
});
