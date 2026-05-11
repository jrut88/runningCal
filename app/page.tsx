'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../src/store/authStore'

export default function RootPage() {
  const { session, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      router.replace(session ? '/groups' : '/login')
    }
  }, [session, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="text-6xl mb-4">🏅</div>
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    </div>
  )
}
