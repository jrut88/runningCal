'use client'
import { useState } from 'react'
import { useAuthStore } from '../../../src/store/authStore'
import { supabase } from '../../../src/lib/supabase'
import { PageHeader } from '../../../components/PageHeader'
import type { Profile } from '../../../src/types/app'

export default function ProfilePage() {
  const { user, profile, setProfile, signOut } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)
      .select()
      .single()
    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setProfile(data as Profile)
      setEditing(false)
    }
  }

  const handleSignOut = async () => {
    if (!confirm('Sign out?')) return
    await signOut()
  }

  const initials = (profile?.display_name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700 mb-3">
            {initials}
          </div>

          {editing ? (
            <div className="w-full mt-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Display name"
              />
              {error && <p className="text-red-600 text-xs mt-1 text-center">{error}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="font-bold text-gray-900 text-lg">
                {profile?.display_name || 'No name set'}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{user?.email}</div>
              <button
                onClick={() => {
                  setDisplayName(profile?.display_name ?? '')
                  setEditing(true)
                }}
                className="text-green-600 text-sm mt-3 font-semibold"
              >
                Edit name
              </button>
            </>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full border border-red-300 text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
