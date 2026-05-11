'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useGroupEvents } from '../../../../../src/hooks/useEvents'
import { useGroupDetail } from '../../../../../src/hooks/useGroups'
import { PageHeader } from '../../../../../components/PageHeader'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function GroupEventsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: group } = useGroupDetail(id)
  const { data: events, isLoading } = useGroupEvents(id)

  return (
    <div>
      <PageHeader
        title={group ? `${group.name} Events` : 'Events'}
        backHref={`/groups/${id}`}
        right={
          <Link
            href={`/groups/${id}/events/new`}
            className="bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded-lg"
          >
            + New
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-3">📅</div>
          <h3 className="font-bold text-gray-900 mb-1">No events yet</h3>
          <p className="text-gray-500 text-sm mb-4">Schedule your first session.</p>
          <Link href={`/groups/${id}/events/new`} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {events?.map((event) => {
            const date = new Date(event.starts_at)
            const isPast = date < new Date()
            return (
              <Link
                key={event.id}
                href={`/groups/${id}/events/${event.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{event.title}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{formatDate(date)}</div>
                    {event.location && (
                      <div className="text-xs text-gray-400 mt-0.5">📍 {event.location}</div>
                    )}
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    {event.cost_per_head > 0 && (
                      <div className="text-sm font-semibold text-green-700">
                        {event.currency} {Number(event.cost_per_head).toFixed(2)}
                      </div>
                    )}
                    {isPast && <div className="text-xs text-gray-400 mt-1">Past</div>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
