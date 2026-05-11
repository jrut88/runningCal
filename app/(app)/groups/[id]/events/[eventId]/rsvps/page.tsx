'use client'
import { useParams } from 'next/navigation'
import { useEventRsvps } from '../../../../../../../src/hooks/useRsvp'
import { PageHeader } from '../../../../../../../components/PageHeader'
import type { RsvpStatus } from '../../../../../../../src/types/app'

const SECTIONS: { status: RsvpStatus; label: string; emoji: string }[] = [
  { status: 'in', label: 'Going', emoji: '✅' },
  { status: 'maybe', label: 'Maybe', emoji: '🤔' },
  { status: 'out', label: "Can't go", emoji: '❌' },
]

export default function RsvpsPage() {
  const { id: groupId, eventId } = useParams<{ id: string; eventId: string }>()
  const { data: rsvps, isLoading } = useEventRsvps(eventId)

  const hasAny = rsvps && rsvps.length > 0

  return (
    <div>
      <PageHeader title="RSVPs" backHref={`/groups/${groupId}/events/${eventId}`} />
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
          </div>
        ) : !hasAny ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🤷</div>
            <p className="text-gray-500 text-sm">No RSVPs yet.</p>
          </div>
        ) : (
          SECTIONS.map(({ status, label, emoji }) => {
            const filtered = rsvps.filter((r) => r.status === status)
            if (filtered.length === 0) return null
            return (
              <div key={status}>
                <div className="text-sm font-semibold text-gray-500 mb-2">
                  {emoji} {label} ({filtered.length})
                </div>
                <div className="space-y-2">
                  {filtered.map((rsvp) => (
                    <div key={rsvp.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                        {(rsvp.user?.display_name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {rsvp.user?.display_name ?? 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
