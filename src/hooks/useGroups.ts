import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  fetchGroupDetail,
  fetchGroupMembers,
  fetchUserGroups,
  joinGroupByInvite,
  regenerateInviteCode,
} from '../services/groups';

export function useUserGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchUserGroups,
  });
}

export function useGroupDetail(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => fetchGroupDetail(groupId),
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId, 'members'],
    queryFn: () => fetchGroupMembers(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, sport, description }: { name: string; sport: string; description: string | null }) =>
      createGroup(name, sport, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => joinGroupByInvite(inviteCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useRegenerateInviteCode(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateInviteCode(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group', groupId] }),
  });
}
