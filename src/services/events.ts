import { supabase } from '../lib/supabase';
import type { Event, Rsvp, RsvpStatus } from '../types/app';

export async function fetchGroupEvents(groupId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('group_id', groupId)
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Event[];
}

export async function fetchAllUpcomingEvents(): Promise<(Event & { group_name: string })[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('group:groups(id, name, events(*))')
    .gte('group.events.starts_at', new Date().toISOString());
  if (error) throw error;

  const events: (Event & { group_name: string })[] = [];
  for (const row of (data ?? []) as any[]) {
    const group = row.group;
    if (!group) continue;
    for (const event of group.events ?? []) {
      events.push({ ...event, group_name: group.name });
    }
  }
  return events.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

export async function fetchEventDetail(eventId: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
  if (error) throw error;
  return data as Event;
}

export async function fetchEventRsvps(eventId: string): Promise<Rsvp[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, user:profiles(*)')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []) as unknown as Rsvp[];
}

export async function createEvent(payload: {
  group_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  starts_at: string;
  ends_at?: string | null;
  max_players?: number | null;
  cost_per_head: number;
  currency: string;
  created_by: string;
}): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Event;
}

export async function upsertRsvp(eventId: string, userId: string, status: RsvpStatus): Promise<void> {
  const { error } = await supabase.from('rsvps').upsert(
    { event_id: eventId, user_id: userId, status, updated_at: new Date().toISOString() },
    { onConflict: 'event_id,user_id' }
  );
  if (error) throw error;
}
