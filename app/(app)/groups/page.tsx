'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserGroups, useJoinGroup } from '../../../src/hooks/useGroups'
import { PageHeader } from '../../../components/PageHeader'

function sportEmoji(sport: string): string {
  const map: Record<string, string> = {
    football: '⚽', running: '🏃', basketball: '🏀', tennis: '🎾',
    cricket: '🏏', rugby: '🏉', cycling: '🚴', swimming: '🏊', general: '🏅',
  }
  return map[sport?.toLowerCase()] ?? '🏅'
}

export default function GroupsPage() {
  const router = useRouter()
  const { data: groups, isLoading, error } = useUserGroups()
  const joinMutation = useJoinGroup()
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError] = useState('')

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    setJoinError('')
    try {
      const groupId = await joinMutation.mutateAsync(inviteCode.trim())
      setInviteCode('')
      router.push(`/groups/${groupId}`)
    } catch (e: any) {
      setJoinError(e.message ?? 'Invalid invite code')
    }
  }

  return (
    <div>
      <PageHeader
        title="My Groups"
        right={
          <Link href="/groups/new" className="bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded-lg">
            + New
          </Link>
        }
      />

      <div className="bg-white border-b border-gray-200 p-3 flex gap-2">
        <input
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="Enter invite code to join"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleJoin}
          disabled={!inviteCode.trim() || joinMutation.isPending}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          Join
        </button>
      </div>
      {joinError && <p className="text-red-600 text-sm text-center py-2 px-4">{joinError}</p>}

      {error && (
        <p className="text-red-600 text-sm text-center py-4 px-4">
          Error loading groups: {(error as any).message}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
        </div>
      ) : groups?.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="font-bold text-gray-900 mb-1">No groups yet</h3>
          <p className="text-gray-500 text-sm">Create a group or join one with an invite code above.</p>
          <Link href="/groups/new" className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold">
            Create Group
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {groups?.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="flex items-center px-4 py-4 bg-white hover:bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg mr-3">
                {sportEmoji(group.sport)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{group.name}</div>
                <div className="text-xs text-gray-500 capitalize">{group.sport} · {group.role}</div>
              </div>
              <span className="text-gray-400 text-lg">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
