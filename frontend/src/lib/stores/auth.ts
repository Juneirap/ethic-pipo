import { writable } from 'svelte/store';

interface User {
  id: number;
  phoneNumber: string;
  name?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null
};

export const auth = writable<AuthState>(initialState);

// Helper function to clear auth state (for logout)
export function clearAuth() {
  auth.set(initialState);
}
