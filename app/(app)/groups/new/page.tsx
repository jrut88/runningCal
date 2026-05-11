'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateGroup } from '../../../../src/hooks/useGroups'
import { PageHeader } from '../../../../components/PageHeader'

const SPORTS = ['football', 'running', 'basketball', 'tennis', 'cricket', 'rugby', 'cycling', 'swimming', 'general']

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(50),
  sport: z.string().min(1),
  description: z.string().max(200).optional(),
})
type FormData = z.infer<typeof schema>

export default function NewGroupPage() {
  const router = useRouter()
  const createGroup = useCreateGroup()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sport: 'general' },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const groupId = await createGroup.mutateAsync({
        name: data.name,
        sport: data.sport,
        description: data.description ?? null,
      })
      router.replace(`/groups/${groupId}`)
    } catch (e: any) {
      setError(e.message ?? 'Failed to create group')
    }
  }

  return (
    <div>
      <PageHeader title="New Group" backHref="/groups" />
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group name *</label>
          <input
            {...register('name')}
            placeholder="e.g. Tuesday 5-a-side"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
          <select
            {...register('sport')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Tell members about your group"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  )
}
