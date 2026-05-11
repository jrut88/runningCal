'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '../../src/store/authStore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/login')
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
      </div>
    )
  }

  if (!session) return null

  const tabs = [
    { href: '/groups', icon: '👥', label: 'Groups' },
    { href: '/events', icon: '📅', label: 'Events' },
    { href: '/profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-lg mx-auto min-h-screen bg-white shadow-sm flex flex-col">
        <main className="flex-1 pb-16">{children}</main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex max-w-lg mx-auto">
          {tabs.map(({ href, icon, label }) => {
            const active =
              href === '/groups'
                ? pathname.startsWith('/groups')
                : pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 ${
                  active ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
