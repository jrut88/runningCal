import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { session, user, profile, isLoading, signOut, setProfile } = useAuthStore();
  return { session, user, profile, isLoading, signOut, setProfile };
}
