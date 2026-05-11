'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useGroupDetail, useGroupMembers, useRegenerateInviteCode } from '../../../../src/hooks/useGroups'
import { useAuthStore } from '../../../../src/store/authStore'
import { PageHeader } from '../../../../components/PageHeader'

function sportEmoji(sport: string): string {
  const map: Record<string, string> = {
    football: '⚽', running: '🏃', basketball: '🏀', tennis: '🎾',
    cricket: '🏏', rugby: '🏉', cycling: '🚴', swimming: '🏊', general: '🏅',
  }
  return map[sport?.toLowerCase()] ?? '🏅'
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { data: group, isLoading } = useGroupDetail(id)
  const { data: members } = useGroupMembers(id)
  const regenerate = useRegenerateInviteCode(id)
  const [copied, setCopied] = useState(false)
  const [regenError, setRegenError] = useState('')

  const isOwner = group?.owner_id === user?.id

  const copyCode = () => {
    navigator.clipboard.writeText(group?.invite_code ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegen = async () => {
    if (!confirm('Regenerate invite code? The old code will stop working.')) return
    setRegenError('')
    try {
      await regenerate.mutateAsync()
    } catch (e: any) {
      setRegenError(e.message)
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Group" backHref="/groups" />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div>
        <PageHeader title="Group" backHref="/groups" />
        <p className="text-center text-gray-500 py-12">Group not found.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={group.name} backHref="/groups" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              {sportEmoji(group.sport)}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">{group.name}</div>
              <div className="text-sm text-gray-500 capitalize">{group.sport}</div>
            </div>
          </div>
          {group.description && <p className="text-gray-600 text-sm">{group.description}</p>}
          <div className="text-xs text-gray-400 mt-2">
            {members?.length ?? 0} member{members?.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">Invite Code</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-lg font-bold tracking-widest text-center text-green-700">
              {group.invite_code}
            </div>
            <button
              onClick={copyCode}
              className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold min-w-[60px]"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {isOwner && (
            <button onClick={handleRegen} className="text-xs text-gray-400 mt-2 underline">
              Regenerate code
            </button>
          )}
          {regenError && <p className="text-red-600 text-xs mt-1">{regenError}</p>}
        </div>

        <Link
          href={`/groups/${id}/events`}
          className="block w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm text-center"
        >
          📅 View Events
        </Link>

        <Link
          href={`/groups/${id}/invite`}
          className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm text-center"
        >
          👥 View Members
        </Link>
      </div>
    </div>
  )
}
