import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEventRsvps, upsertRsvp } from '../services/events';
import type { RsvpStatus } from '../types/app';

export function useEventRsvps(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId, 'rsvps'],
    queryFn: () => fetchEventRsvps(eventId),
    enabled: !!eventId,
  });
}

export function useUpsertRsvp(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: RsvpStatus }) =>
      upsertRsvp(eventId, userId, status),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['event', eventId, 'rsvps'] }),
  });
}
