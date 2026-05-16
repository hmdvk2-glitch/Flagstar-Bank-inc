import { useState, useEffect } from 'react';

/**
 * AUTH STATE MACHINE (v5.0 Deterministic)
 * 
 * States:
 *   BOOTING       → App init, checking persisted session
 *   AUTHENTICATING → Login in progress
 *   ADMIN_READY   → Verified admin, dashboard access granted
 *   CUSTOMER_READY → Verified customer, terminal access granted
 *   ANONYMOUS     → No session, show login
 *   ERROR         → Auth failure, show error + login
 */
export type AuthPhase = 
  | 'BOOTING' 
  | 'AUTHENTICATING' 
  | 'ADMIN_READY' 
  | 'CUSTOMER_READY' 
  | 'ANONYMOUS' 
  | 'ERROR';

export type User = {
  id: string;
  auth_user_id?: string;
  email?: string;
  full_name?: string;
  [key: string]: any;
} | null;

interface AuthState {
  user: User;
  phase: AuthPhase;
  error: string | null;
}

let state: AuthState = {
  user: null,
  phase: 'BOOTING',
  error: null,
};

const listeners = new Set<(s: AuthState) => void>();

function notify() {
  listeners.forEach((fn) => fn({ ...state }));
}

export const authStore = {
  getState: () => ({ ...state }),
  getUser: () => state.user,
  getPhase: () => state.phase,

  setPhase: (phase: AuthPhase, error?: string) => {
    state = { ...state, phase, error: error || null };
    notify();
  },

  setUser: (user: User) => {
    state = { ...state, user };
    notify();
  },

  /** Atomic transition: set user + phase in one tick */
  transition: (user: User, phase: AuthPhase) => {
    state = { user, phase, error: null };
    notify();
  },

  reset: () => {
    state = { user: null, phase: 'ANONYMOUS', error: null };
    notify();
  },

  subscribe: (listener: (s: AuthState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/**
 * useAuthStore — Reactive hook for components.
 * Exposes the full state machine to the UI layer.
 */
export function useAuthStore() {
  const [current, setCurrent] = useState<AuthState>(authStore.getState());

  useEffect(() => {
    return authStore.subscribe(setCurrent);
  }, []);

  return {
    user: current.user,
    phase: current.phase,
    error: current.error,
    isAuthenticated: current.phase === 'ADMIN_READY' || current.phase === 'CUSTOMER_READY',
    isAdmin: current.phase === 'ADMIN_READY',
    isCustomer: current.phase === 'CUSTOMER_READY',
    isBooting: current.phase === 'BOOTING',
  };
}
