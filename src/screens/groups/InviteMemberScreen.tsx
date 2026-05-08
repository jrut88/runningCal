import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useGroupDetail, useRegenerateInviteCode } from '../../hooks/useGroups';
import type { GroupStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GroupStackParamList, 'InviteMember'>;

export default function InviteMemberScreen({ route }: Props) {
  const { groupId } = route.params;
  const { data: group, isLoading } = useGroupDetail(groupId);
  const regenerate = useRegenerateInviteCode(groupId);

  if (isLoading) return <LoadingSpinner />;
  if (!group) return null;

  const handleShare = async () => {
    await Share.share({
      message: `Join "${group.name}" on Groopay! Use invite code: ${group.invite_code}`,
    });
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate code?',
      'The current code will stop working. Anyone who hasn\'t joined yet will need the new code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: () => regenerate.mutate(),
        },
      ]
    );
  };

  return (
    <View style={ss.container}>
      <Text style={ss.subtitle}>Share this code with people you want to invite to</Text>
      <Text style={ss.groupName}>{group.name}</Text>

      <View style={ss.codeBox}>
        <Text style={ss.codeLabel}>Invite Code</Text>
        <Text style={ss.code}>{group.invite_code}</Text>
      </View>

      <Button title="📤  Share Invite" onPress={handleShare} style={ss.shareBtn} />

      <TouchableOpacity onPress={handleRegenerate} style={ss.regenLink}>
        <Text style={ss.regenText}>Regenerate code</Text>
      </TouchableOpacity>
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', padding: 32 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  groupName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 32 },
  codeBox: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', width: '100%', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  codeLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500', marginBottom: 8, letterSpacing: 1 },
  code: { fontSize: 36, fontWeight: '800', color: '#16a34a', letterSpacing: 6 },
  shareBtn: { width: '100%' },
  regenLink: { marginTop: 20 },
  regenText: { fontSize: 14, color: '#6b7280', textDecorationLine: 'underline' },
});
