'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePaymentRequest, usePaymentRecords, useMyPaymentRecord, usePayNow } from '../../../../../../../src/hooks/usePayments'
import { useAuthStore } from '../../../../../../../src/store/authStore'
import { useGroupMembers } from '../../../../../../../src/hooks/useGroups'
import { PageHeader } from '../../../../../../../components/PageHeader'
import type { PaymentStatus } from '../../../../../../../src/types/app'

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default function PaymentPage() {
  const { id: groupId, eventId } = useParams<{ id: string; eventId: string }>()
  const { user } = useAuthStore()
  const { data: paymentRequest, isLoading } = usePaymentRequest(eventId)
  const { data: records } = usePaymentRecords(paymentRequest?.id ?? '')
  const { data: myRecord } = useMyPaymentRecord(paymentRequest?.id ?? '', user?.id ?? '')
  const { data: members } = useGroupMembers(groupId)
  const payNow = usePayNow()

  const isOrganiser = members?.find((m) => m.user_id === user?.id)?.role === 'organiser'
  const paidCount = records?.filter((r) => r.status === 'paid').length ?? 0
  const totalCount = records?.length ?? 0

  const handlePay = async () => {
    if (!myRecord || !paymentRequest) return
    try {
      await payNow.mutateAsync({
        paymentRecordId: myRecord.id,
        paymentRequestId: paymentRequest.id,
        amount: myRecord.amount,
        currency: myRecord.currency,
        description: 'Event payment',
      })
    } catch {}
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Payment" backHref={`/groups/${groupId}/events/${eventId}`} />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!paymentRequest) {
    return (
      <div>
        <PageHeader title="Payment" backHref={`/groups/${groupId}/events/${eventId}`} />
        <div className="p-4 text-center py-16">
          <div className="text-5xl mb-3">💰</div>
          <h3 className="font-bold text-gray-900 mb-2">No payment request yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            {isOrganiser
              ? 'Request payment from members who RSVP\'d Going.'
              : 'The organiser hasn\'t requested payment yet.'}
          </p>
          {isOrganiser && (
            <Link
              href={`/groups/${groupId}/events/${eventId}/payment/request`}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold"
            >
              Request Payment
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Payment" backHref={`/groups/${groupId}/events/${eventId}`} />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">{paymentRequest.description || 'Payment request'}</div>
          <div className="text-2xl font-bold text-green-700">
            {paymentRequest.currency} {Number(paymentRequest.amount).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">{paidCount} / {totalCount} paid</div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: totalCount ? `${(paidCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {myRecord?.status === 'pending' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="font-semibold text-green-900 mb-1">Your payment is pending</div>
            <div className="text-sm text-green-700 mb-3">
              {myRecord.currency} {Number(myRecord.amount).toFixed(2)}
            </div>
            <button
              onClick={handlePay}
              disabled={payNow.isPending}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              {payNow.isPending ? 'Processing...' : '💳 Pay Now'}
            </button>
          </div>
        )}

        {myRecord?.status === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">✅</div>
            <div className="font-semibold text-green-900">You&apos;ve paid!</div>
          </div>
        )}

        {isOrganiser && records && records.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-2">All payments</div>
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                    {(record.user?.display_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{record.user?.display_name ?? 'Unknown'}</div>
                    <div className="text-xs text-gray-400">
                      {record.currency} {Number(record.amount).toFixed(2)}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[record.status]}`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
