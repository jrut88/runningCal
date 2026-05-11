'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../src/store/authStore'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/groups')
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
