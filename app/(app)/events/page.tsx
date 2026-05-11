'use client'
import Link from 'next/link'
import { useAllUpcomingEvents } from '../../../src/hooks/useEvents'
import { PageHeader } from '../../../components/PageHeader'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AllEventsPage() {
  const { data: events, isLoading } = useAllUpcomingEvents()

  return (
    <div>
      <PageHeader title="Upcoming Events" />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-3">📅</div>
          <h3 className="font-bold text-gray-900 mb-1">No upcoming events</h3>
          <p className="text-gray-500 text-sm">Events from your groups will appear here.</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {events?.map((event) => {
            const date = new Date(event.starts_at)
            return (
              <Link
                key={event.id}
                href={`/groups/${event.group_id}/events/${event.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="text-xs text-green-600 font-semibold mb-1">{event.group_name}</div>
                <div className="font-semibold text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">{formatDate(date)}</div>
                {event.location && (
                  <div className="text-xs text-gray-400 mt-0.5">📍 {event.location}</div>
                )}
                {event.cost_per_head > 0 && (
                  <div className="text-sm font-semibold text-green-700 mt-1">
                    {event.currency} {Number(event.cost_per_head).toFixed(2)}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
