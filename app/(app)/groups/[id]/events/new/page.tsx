'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateEvent } from '../../../../../../src/hooks/useEvents'
import { useAuthStore } from '../../../../../../src/store/authStore'
import { PageHeader } from '../../../../../../components/PageHeader'

const CURRENCIES = ['GBP', 'USD', 'EUR']
const schema = z.object({
  title: z.string().min(2, 'At least 2 characters').max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  starts_at: z.string().min(1, 'Pick a date & time'),
  ends_at: z.string().optional(),
  max_players: z.string().optional(),
  cost_per_head: z.string().default('0'),
  currency: z.string().default('GBP'),
})
type FormData = z.infer<typeof schema>

export default function NewEventPage() {
  const { id: groupId } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const createEvent = useCreateEvent(groupId)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'GBP', cost_per_head: '0' },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setError('')
    try {
      const event = await createEvent.mutateAsync({
        group_id: groupId,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        starts_at: new Date(data.starts_at).toISOString(),
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
        max_players: data.max_players ? parseInt(data.max_players) : null,
        cost_per_head: parseFloat(data.cost_per_head) || 0,
        currency: data.currency,
        created_by: user.id,
      })
      router.replace(`/groups/${groupId}/events/${event.id}`)
    } catch (e: any) {
      setError(e.message ?? 'Failed to create event')
    }
  }

  return (
    <div>
      <PageHeader title="New Event" backHref={`/groups/${groupId}/events`} />
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            {...register('title')}
            placeholder="e.g. Tuesday 5-a-side"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
          <input
            {...register('starts_at')}
            type="datetime-local"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.starts_at && <p className="text-red-600 text-xs mt-1">{errors.starts_at.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End time (optional)</label>
          <input
            {...register('ends_at')}
            type="datetime-local"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
          <input
            {...register('location')}
            placeholder="e.g. Hackney Marshes"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost per head</label>
            <input
              {...register('cost_per_head')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              {...register('currency')}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max players (optional)</label>
          <input
            {...register('max_players')}
            type="number"
            min="1"
            placeholder="e.g. 10"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Any details for your players..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </div>
  )
}
