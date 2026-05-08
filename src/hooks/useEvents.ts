import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEvent,
  fetchAllUpcomingEvents,
  fetchEventDetail,
  fetchGroupEvents,
} from '../services/events';

export function useGroupEvents(groupId: string) {
  return useQuery({
    queryKey: ['events', groupId],
    queryFn: () => fetchGroupEvents(groupId),
    enabled: !!groupId,
  });
}

export function useAllUpcomingEvents() {
  return useQuery({
    queryKey: ['events', 'all'],
    queryFn: fetchAllUpcomingEvents,
  });
}

export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventDetail(eventId),
    enabled: !!eventId,
  });
}

export function useCreateEvent(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', groupId] }),
  });
}
