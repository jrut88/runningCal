import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GroupCard } from '../../components/groups/GroupCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useJoinGroup, useUserGroups } from '../../hooks/useGroups';
import type { AppTabParamList, GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'GroupList'>;

export default function GroupListScreen({ navigation }: Props) {
  const { data: groups, isLoading, refetch, isRefetching } = useUserGroups();
  const joinMutation = useJoinGroup();
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      await joinMutation.mutateAsync(inviteCode.trim());
      setInviteCode('');
      Alert.alert('Joined!', 'You have joined the group.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Invalid invite code');
    } finally {
      setJoining(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={ss.container}>
      {/* Join by invite code */}
      <View style={ss.joinRow}>
        <TextInput
          style={ss.codeInput}
          placeholder="Enter invite code"
          placeholderTextColor="#9ca3af"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleJoin}
        />
        <TouchableOpacity
          style={[ss.joinBtn, (!inviteCode.trim() || joining) && ss.joinBtnDisabled]}
          onPress={handleJoin}
          disabled={!inviteCode.trim() || joining}
        >
          <Text style={ss.joinBtnText}>Join</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
          />
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={ss.list}
        ListEmptyComponent={
          <View style={ss.empty}>
            <Text style={ss.emptyEmoji}>👥</Text>
            <Text style={ss.emptyTitle}>No groups yet</Text>
            <Text style={ss.emptyText}>Create a group or join one with an invite code.</Text>
          </View>
        }
      />

      <TouchableOpacity style={ss.fab} onPress={() => navigation.navigate('CreateGroup')}>
        <Text style={ss.fabText}>＋ New Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  joinRow: { flexDirection: 'row', padding: 16, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  codeInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#111827', backgroundColor: '#f9fafb' },
  joinBtn: { backgroundColor: '#16a34a', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  joinBtnDisabled: { opacity: 0.5 },
  joinBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 20, left: 20, backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
