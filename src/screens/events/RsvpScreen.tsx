import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../components/common/Avatar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useEventRsvps } from '../../hooks/useRsvp';
import type { GroupStackParamList } from '../../navigation/types';
import type { RsvpStatus } from '../../types/app';

type Props = NativeStackScreenProps<GroupStackParamList, 'RsvpScreen'>;

const STATUS_LABEL: Record<RsvpStatus, string> = { in: '✅ In', maybe: '🤔 Maybe', out: '❌ Out' };
const STATUS_COLOR: Record<RsvpStatus, string> = { in: '#16a34a', maybe: '#f59e0b', out: '#dc2626' };

export default function RsvpScreen({ route }: Props) {
  const { eventId } = route.params;
  const { data: rsvps, isLoading, refetch, isRefetching } = useEventRsvps(eventId);

  if (isLoading) return <LoadingSpinner />;

  const groups: Record<RsvpStatus, typeof rsvps> = {
    in: rsvps?.filter((r) => r.status === 'in') ?? [],
    maybe: rsvps?.filter((r) => r.status === 'maybe') ?? [],
    out: rsvps?.filter((r) => r.status === 'out') ?? [],
  };

  const sections: { status: RsvpStatus; items: typeof rsvps }[] = [
    { status: 'in', items: groups.in },
    { status: 'maybe', items: groups.maybe },
    { status: 'out', items: groups.out },
  ];

  return (
    <FlatList
      style={ss.bg}
      data={sections.flatMap(({ status, items }) =>
        (items ?? []).length > 0
          ? [{ type: 'header' as const, status }, ...(items ?? []).map((r) => ({ type: 'item' as const, rsvp: r, status }))]
          : []
      )}
      keyExtractor={(item, i) => String(i)}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      contentContainerStyle={ss.list}
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <Text style={[ss.groupHeader, { color: STATUS_COLOR[item.status] }]}>
              {STATUS_LABEL[item.status]}
            </Text>
          );
        }
        const name = item.rsvp.user?.display_name ?? 'Unknown';
        return (
          <View style={ss.row}>
            <Avatar name={name} url={item.rsvp.user?.avatar_url} size={36} />
            <Text style={ss.name}>{name}</Text>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={ss.empty}>
          <Text style={ss.emptyText}>No RSVPs yet.</Text>
        </View>
      }
    />
  );
}

const ss = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  groupHeader: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  name: { fontSize: 15, color: '#111827' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#6b7280', fontSize: 14 },
});
