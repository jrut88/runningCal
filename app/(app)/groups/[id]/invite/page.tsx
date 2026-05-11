'use client'
import { useParams } from 'next/navigation'
import { useGroupMembers, useGroupDetail } from '../../../../../src/hooks/useGroups'
import { PageHeader } from '../../../../../components/PageHeader'

export default function MembersPage() {
  const { id } = useParams<{ id: string }>()
  const { data: group } = useGroupDetail(id)
  const { data: members, isLoading } = useGroupMembers(id)

  return (
    <div>
      <PageHeader title="Members" backHref={`/groups/${id}`} />
      <div className="p-4">
        {group?.invite_code && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800">
            Share invite code{' '}
            <span className="font-mono font-bold">{group.invite_code}</span>{' '}
            to add members.
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-2">
            {members?.map((member) => (
              <div key={member.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                  {(member.user?.display_name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {member.user?.display_name ?? 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
