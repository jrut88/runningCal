import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Event, Rsvp } from '../../types/app';
import { Card } from '../common/Card';

interface EventCardProps {
  event: Event;
  rsvps?: Rsvp[];
  onPress: () => void;
}

export function EventCard({ event, rsvps = [], onPress }: EventCardProps) {
  const inCount = rsvps.filter((r) => r.status === 'in').length;
  const totalCount = rsvps.length;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={ss.card}>
        <Text style={ss.title}>{event.title}</Text>
        <Text style={ss.date}>{format(new Date(event.starts_at), 'EEE d MMM · HH:mm')}</Text>
        {event.location ? <Text style={ss.location}>📍 {event.location}</Text> : null}
        <View style={ss.footer}>
          {totalCount > 0 && (
            <Text style={ss.rsvp}>
              ✅ {inCount}/{totalCount} in
            </Text>
          )}
          {event.cost_per_head > 0 && (
            <Text style={ss.cost}>
              £{event.cost_per_head.toFixed(2)} pp
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const ss = StyleSheet.create({
  card: { marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  date: { fontSize: 13, color: '#16a34a', fontWeight: '500', marginBottom: 2 },
  location: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rsvp: { fontSize: 13, color: '#374151' },
  cost: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
});
