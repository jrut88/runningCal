import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { GroupMember } from '../../types/app';
import { Avatar } from '../common/Avatar';

interface MemberListItemProps {
  member: GroupMember;
}

export function MemberListItem({ member }: MemberListItemProps) {
  const name = member.user?.display_name ?? 'Unknown';
  return (
    <View style={ss.row}>
      <Avatar name={name} url={member.user?.avatar_url} size={38} />
      <Text style={ss.name}>{name}</Text>
      {member.role === 'organiser' && (
        <View style={ss.badge}>
          <Text style={ss.badgeText}>Organiser</Text>
        </View>
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  name: { flex: 1, fontSize: 15, color: '#111827' },
  badge: { backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
});
