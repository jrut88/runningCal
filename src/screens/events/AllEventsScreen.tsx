import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAllUpcomingEvents } from '../../hooks/useEvents';
import type { EventsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'AllEvents'>;

export default function AllEventsScreen({ navigation }: Props) {
  const { data: events, isLoading, refetch, isRefetching } = useAllUpcomingEvents();

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      style={ss.bg}
      data={events ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id, groupId: item.group_id })}
          activeOpacity={0.7}
        >
          <Card style={ss.card}>
            <Text style={ss.groupTag}>{(item as any).group_name}</Text>
            <Text style={ss.title}>{item.title}</Text>
            <Text style={ss.date}>{format(new Date(item.starts_at), 'EEE d MMM · HH:mm')}</Text>
            {item.location ? <Text style={ss.location}>📍 {item.location}</Text> : null}
          </Card>
        </TouchableOpacity>
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      contentContainerStyle={ss.list}
      ListEmptyComponent={
        <View style={ss.empty}>
          <Text style={ss.emptyEmoji}>📅</Text>
          <Text style={ss.emptyTitle}>No upcoming events</Text>
          <Text style={ss.emptyText}>Join a group to see its events here.</Text>
        </View>
      }
    />
  );
}

const ss = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  card: { marginBottom: 10 },
  groupTag: { fontSize: 11, fontWeight: '600', color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  date: { fontSize: 13, color: '#6b7280' },
  location: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});
