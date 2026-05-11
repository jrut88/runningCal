import { supabase } from '../lib/supabase';
import type { Group, GroupMember, GroupWithRole } from '../types/app';

export async function fetchUserGroups(): Promise<GroupWithRole[]> {
  const { data: memberships, error: membError } = await supabase
    .from('group_members')
    .select('group_id, role')
    .order('joined_at', { ascending: false });
  if (membError) throw membError;
  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds);
  if (groupsError) throw groupsError;

  return (groups ?? []).map((group) => ({
    ...group,
    role: memberships.find((m) => m.group_id === group.id)?.role ?? 'member',
  })) as GroupWithRole[];
}

export async function fetchGroupDetail(groupId: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();
  if (error) throw error;
  return data as Group;
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('*, user:profiles(*)')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as GroupMember[];
}

export async function createGroup(
  name: string,
  sport: string,
  description: string | null
): Promise<string> {
  const { data, error } = await supabase.rpc('create_group', {
    p_name: name,
    p_sport: sport,
    p_description: description,
  });
  if (error) throw error;
  return data as string;
}

export async function joinGroupByInvite(inviteCode: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_group_by_invite', {
    p_invite_code: inviteCode.toUpperCase(),
  });
  if (error) throw error;
  return data as string;
}

export async function regenerateInviteCode(groupId: string): Promise<string> {
  const { data, error } = await supabase.rpc('regenerate_invite_code', {
    p_group_id: groupId,
  });
  if (error) throw error;
  return data as string;
}
