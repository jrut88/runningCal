import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EventCard } from '../../components/events/EventCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useGroupEvents } from '../../hooks/useEvents';
import type { GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'EventList'>;

export default function EventListScreen({ route, navigation }: Props) {
  const { groupId, groupName } = route.params;
  const { data: events, isLoading, refetch, isRefetching } = useGroupEvents(groupId);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: groupName });
  }, [groupName]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={ss.container}>
      <FlatList
        data={events ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id, groupId })}
          />
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={ss.list}
        ListEmptyComponent={
          <View style={ss.empty}>
            <Text style={ss.emptyEmoji}>📅</Text>
            <Text style={ss.emptyTitle}>No events yet</Text>
            <Text style={ss.emptyText}>An organiser can create the first event for this group.</Text>
          </View>
        }
      />

      <TouchableOpacity style={ss.fab} onPress={() => navigation.navigate('CreateEvent', { groupId })}>
        <Text style={ss.fabText}>＋ New Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 20, left: 20, backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
