import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { GroupWithRole } from '../../types/app';
import { Card } from '../common/Card';

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽',
  running: '🏃',
  tennis: '🎾',
  basketball: '🏀',
  cycling: '🚴',
  general: '🏅',
};

interface GroupCardProps {
  group: GroupWithRole;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const emoji = SPORT_EMOJI[group.sport] ?? '🏅';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={ss.card}>
        <View style={ss.row}>
          <Text style={ss.emoji}>{emoji}</Text>
          <View style={ss.info}>
            <Text style={ss.name}>{group.name}</Text>
            <Text style={ss.sport}>{group.sport}</Text>
          </View>
          {group.role === 'organiser' && (
            <View style={ss.badge}>
              <Text style={ss.badgeText}>Organiser</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const ss = StyleSheet.create({
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 32, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#111827' },
  sport: { fontSize: 13, color: '#6b7280', marginTop: 2, textTransform: 'capitalize' },
  badge: { backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
});
