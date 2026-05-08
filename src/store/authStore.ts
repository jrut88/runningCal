import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/app';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  activeGroupId: string | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setActiveGroupId: (id: string | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  activeGroupId: null,
  isLoading: true,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setProfile: (profile) =>
    set({ profile }),

  setActiveGroupId: (id) =>
    set({ activeGroupId: id }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, activeGroupId: null });
  },

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    set({ session, user: session?.user ?? null, isLoading: false });

    if (session?.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      set({ profile: profileData ?? null });
    }

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      set({ session: newSession, user: newSession?.user ?? null });
      if (newSession?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .single();
        set({ profile: profileData ?? null });
      } else {
        set({ profile: null });
      }
    });
  },
}));
