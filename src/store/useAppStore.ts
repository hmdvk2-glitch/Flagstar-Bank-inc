import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppState = {
  admin: { id: string; name: string; email: string } | null;
  customer: { id: string; account_number: string; name: string; balance: number; kyc_status: string } | null;
  customerToken: string | null;
  isAdmin: boolean;
  isCustomer: boolean;
  
  setAdmin: (admin: { id: string; name: string; email: string }) => void;
  setCustomer: (customer: { id: string; account_number: string; name: string; balance: number; kyc_status: string }, token: string) => void;
  logout: () => void;
  clearAll: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      admin: null,
      customer: null,
      customerToken: null,
      isAdmin: false,
      isCustomer: false,

      setAdmin: (admin) => set({ admin, isAdmin: true, customer: null, customerToken: null, isCustomer: false }),
      setCustomer: (customer, token) => set({ customer, customerToken: token, isCustomer: true, admin: null, isAdmin: false }),
      logout: () => set({ admin: null, customer: null, customerToken: null, isAdmin: false, isCustomer: false }),
      clearAll: () => set({ admin: null, customer: null, customerToken: null, isAdmin: false, isCustomer: false }),
    }),
    {
      name: 'flagstar-auth-storage',
    }
  )
);
