import { create } from 'zustand';
import type { User, UserRole } from '@velnox/types';

interface AuthState {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'> | null;
  isAuthenticated: boolean;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  hasRole: (roles) => {
    const { user } = get();
    return !!user && roles.includes(user.role);
  },
}));
