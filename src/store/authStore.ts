import { useState, useEffect } from 'react';

export type User = {
  id: string;
  auth_user_id?: string;
  [key: string]: any;
} | null;

let currentUser: User = null;
const listeners = new Set<(user: User) => void>();

export const authStore = {
  getUser: () => currentUser,
  setUser: (user: User) => {
    currentUser = user;
    listeners.forEach((listener) => listener(currentUser));
  },
  subscribe: (listener: (user: User) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useAuthStore() {
  const [user, setUser] = useState<User>(authStore.getUser());

  useEffect(() => {
    return authStore.subscribe(setUser);
  }, []);

  return {
    user,
    isAuthenticated: !!user
  };
}
