import { useState, useEffect } from 'react';

/**
 * AUTH STATE MACHINE (v6.0 Gravity-Neutral)
 * 
 * Strict binary state driven by Primary Truth Layer (Supabase).
 * No intermediate states. No fake toggles.
 */
export type AuthPhase = 'AUTHENTICATED' | 'GUEST';

export type User = {
  id: string;
  email?: string;
  full_name?: string;
  role?: 'admin' | 'user';
  [key: string]: any;
} | null;

interface AuthState {
  user: User;
  phase: AuthPhase;
}

// Initial state must be GUEST until Supabase overrides it
let state: AuthState = {
  user: null,
  phase: 'GUEST',
};

const listeners = new Set<(s: AuthState) => void>();

function notify() {
  listeners.forEach((fn) => fn({ ...state }));
}

export const authStore = {
  getState: () => ({ ...state }),
  getUser: () => state.user,
  getPhase: () => state.phase,

  /** Atomic transition: set user + phase in one tick */
  transition: (user: User, phase: AuthPhase) => {
    state = { user, phase };
    notify();
  },

  reset: () => {
    state = { user: null, phase: 'GUEST' };
    notify();
  },

  subscribe: (listener: (s: AuthState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/**
 * useAuthStore — Reactive hook for components.
 * Exposes the binary state machine to the UI layer.
 */
export function useAuthStore() {
  const [current, setCurrent] = useState<AuthState>(authStore.getState());

  useEffect(() => {
    return authStore.subscribe(setCurrent);
  }, []);

  return {
    user: current.user,
    phase: current.phase,
    isAuthenticated: current.phase === 'AUTHENTICATED',
    isAdmin: current.phase === 'AUTHENTICATED' && current.user?.role === 'admin',
    isCustomer: current.phase === 'AUTHENTICATED' && current.user?.role === 'user',
  };
}
