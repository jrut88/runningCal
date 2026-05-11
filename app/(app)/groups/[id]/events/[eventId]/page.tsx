'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEventDetail } from '../../../../../../src/hooks/useEvents'
import { useEventRsvps, useUpsertRsvp } from '../../../../../../src/hooks/useRsvp'
import { useAuthStore } from '../../../../../../src/store/authStore'
import { PageHeader } from '../../../../../../components/PageHeader'
import type { RsvpStatus } from '../../../../../../src/types/app'

const STATUS_LABELS: Record<RsvpStatus, string> = {
  in: '✅ Going',
  out: '❌ Not going',
  maybe: '🤔 Maybe',
}

const RSVP_BTNS: { status: RsvpStatus; label: string; active: string; inactive: string }[] = [
  { status: 'in', label: '✅ Going', active: 'bg-green-600 text-white', inactive: 'border border-green-600 text-green-700' },
  { status: 'maybe', label: '🤔 Maybe', active: 'bg-yellow-400 text-white', inactive: 'border border-yellow-400 text-yellow-700' },
  { status: 'out', label: "❌ Can't go", active: 'bg-red-500 text-white', inactive: 'border border-red-400 text-red-600' },
]

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function EventDetailPage() {
  const { id: groupId, eventId } = useParams<{ id: string; eventId: string }>()
  const { user } = useAuthStore()
  const { data: event, isLoading } = useEventDetail(eventId)
  const { data: rsvps } = useEventRsvps(eventId)
  const upsert = useUpsertRsvp(eventId)

  const myRsvp = rsvps?.find((r) => r.user_id === user?.id)
  const inCount = rsvps?.filter((r) => r.status === 'in').length ?? 0
  const maybeCount = rsvps?.filter((r) => r.status === 'maybe').length ?? 0

  const handleRsvp = (status: RsvpStatus) => {
    if (!user) return
    upsert.mutate({ userId: user.id, status })
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Event" backHref={`/groups/${groupId}/events`} />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!event) return null

  const date = new Date(event.starts_at)

  return (
    <div>
      <PageHeader title={event.title} backHref={`/groups/${groupId}/events`} />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📅</span>
            <span>{formatDate(date)}</span>
          </div>
          {event.ends_at && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>⏱</span>
              <span>Until {formatTime(new Date(event.ends_at))}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.max_players && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>👥</span>
              <span>{inCount} / {event.max_players} going</span>
            </div>
          )}
          {event.cost_per_head > 0 && (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <span>💰</span>
              <span>{event.currency} {Number(event.cost_per_head).toFixed(2)} per head</span>
            </div>
          )}
          {event.description && (
            <p className="text-sm text-gray-600 pt-1 border-t border-gray-100 mt-2">{event.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{inCount}</div>
            <div className="text-xs text-gray-500">Going</div>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{maybeCount}</div>
            <div className="text-xs text-gray-500">Maybe</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            Your RSVP
            {myRsvp && (
              <span className="text-gray-400 font-normal ml-1">
                — {STATUS_LABELS[myRsvp.status]}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {RSVP_BTNS.map(({ status, label, active, inactive }) => (
              <button
                key={status}
                onClick={() => handleRsvp(status)}
                disabled={upsert.isPending}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  myRsvp?.status === status ? active : inactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Link
          href={`/groups/${groupId}/events/${eventId}/rsvps`}
          className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4"
        >
          <span className="text-sm font-medium text-gray-700">View all RSVPs</span>
          <span className="text-gray-400">›</span>
        </Link>

        <Link
          href={`/groups/${groupId}/events/${eventId}/payment`}
          className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4"
        >
          <span className="text-sm font-medium text-gray-700">💰 Payment</span>
          <span className="text-gray-400">›</span>
        </Link>
      </div>
    </div>
  )
}
