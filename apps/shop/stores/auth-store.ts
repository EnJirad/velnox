import { create } from 'zustand';
import type { User } from '@velnox/types';

interface AuthState {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'> | null;
  isAuthenticated: boolean;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
