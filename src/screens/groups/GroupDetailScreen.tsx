import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MemberListItem } from '../../components/groups/MemberListItem';
import { useGroupDetail, useGroupMembers } from '../../hooks/useGroups';
import { useAuth } from '../../hooks/useAuth';
import type { GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'GroupDetail'>;

export default function GroupDetailScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { user } = useAuth();
  const { data: group, isLoading: groupLoading } = useGroupDetail(groupId);
  const { data: members, isLoading: membersLoading, refetch, isRefetching } = useGroupMembers(groupId);

  if (groupLoading || membersLoading) return <LoadingSpinner />;
  if (!group) return null;

  const myMembership = members?.find((m) => m.user_id === user?.id);
  const isOrganiser = myMembership?.role === 'organiser';

  const SPORT_EMOJI: Record<string, string> = { football: '⚽', running: '🏃', tennis: '🎾', basketball: '🏀', cycling: '🚴', general: '🏅' };
  const emoji = SPORT_EMOJI[group.sport] ?? '🏅';

  return (
    <ScrollView
      style={ss.scroll}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Header */}
      <View style={ss.header}>
        <Text style={ss.emoji}>{emoji}</Text>
        <Text style={ss.name}>{group.name}</Text>
        {group.description ? <Text style={ss.description}>{group.description}</Text> : null}
      </View>

      {/* Action buttons */}
      <View style={ss.actions}>
        <TouchableOpacity
          style={ss.actionBtn}
          onPress={() => navigation.navigate('EventList', { groupId, groupName: group.name })}
        >
          <Text style={ss.actionEmoji}>📅</Text>
          <Text style={ss.actionLabel}>Events</Text>
        </TouchableOpacity>

        {isOrganiser && (
          <>
            <TouchableOpacity
              style={ss.actionBtn}
              onPress={() => navigation.navigate('CreateEvent', { groupId })}
            >
              <Text style={ss.actionEmoji}>➕</Text>
              <Text style={ss.actionLabel}>Add Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={ss.actionBtn}
              onPress={() => navigation.navigate('InviteMember', { groupId })}
            >
              <Text style={ss.actionEmoji}>🔗</Text>
              <Text style={ss.actionLabel}>Invite</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Members */}
      <View style={ss.section}>
        <Text style={ss.sectionTitle}>Members ({members?.length ?? 0})</Text>
        {(members ?? []).map((member) => (
          <MemberListItem key={member.id} member={member} />
        ))}
      </View>
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  emoji: { fontSize: 48, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '800', color: '#111827' },
  description: { fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  actions: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12 },
  actionEmoji: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#16a34a' },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
});
