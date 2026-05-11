'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePaymentRequest } from '../../../../../../../../src/hooks/usePayments'
import { useEventRsvps } from '../../../../../../../../src/hooks/useRsvp'
import { useEventDetail } from '../../../../../../../../src/hooks/useEvents'
import { useAuthStore } from '../../../../../../../../src/store/authStore'
import { PageHeader } from '../../../../../../../../components/PageHeader'

const schema = z.object({
  amount: z.string().min(1, 'Enter an amount'),
  currency: z.string().default('GBP'),
  description: z.string().max(200).optional(),
})
type FormData = z.infer<typeof schema>

export default function PaymentRequestPage() {
  const { id: groupId, eventId } = useParams<{ id: string; eventId: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: event } = useEventDetail(eventId)
  const { data: rsvps } = useEventRsvps(eventId)
  const createRequest = useCreatePaymentRequest()
  const [error, setError] = useState('')

  const inRsvps = rsvps?.filter((r) => r.status === 'in') ?? []

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: event?.currency ?? 'GBP',
      amount: event?.cost_per_head ? String(event.cost_per_head) : '',
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setError('')
    try {
      await createRequest.mutateAsync({
        eventId,
        createdBy: user.id,
        amount: parseFloat(data.amount),
        currency: data.currency,
        description: data.description || null,
        memberIds: inRsvps.map((r) => r.user_id),
      })
      router.replace(`/groups/${groupId}/events/${eventId}/payment`)
    } catch (e: any) {
      setError(e.message ?? 'Failed to create payment request')
    }
  }

  return (
    <div>
      <PageHeader title="Request Payment" backHref={`/groups/${groupId}/events/${eventId}/payment`} />
      <div className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          This will request payment from{' '}
          <strong>{inRsvps.length}</strong>{' '}
          member{inRsvps.length !== 1 ? 's' : ''} who RSVP&apos;d &quot;Going&quot;.
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount per person *</label>
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              {...register('currency')}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {['GBP', 'USD', 'EUR'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <input
            {...register('description')}
            placeholder="e.g. Pitch hire + balls"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || inRsvps.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
        >
          {isSubmitting
            ? 'Creating...'
            : `Request from ${inRsvps.length} member${inRsvps.length !== 1 ? 's' : ''}`}
        </button>

        {inRsvps.length === 0 && (
          <p className="text-gray-500 text-xs text-center">No members have RSVP&apos;d &quot;Going&quot; yet.</p>
        )}
      </div>
    </div>
  )
}
