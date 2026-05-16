import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ADMIN ROUTE GUARD (v5.0 State Machine)
 * 
 * Phase check:
 *   BOOTING       → show nothing (wait)
 *   ADMIN_READY   → allow
 *   ANONYMOUS     → redirect to /auth/login
 *   anything else → redirect to /customer/dashboard
 */
export const AdminRoute: React.FC = () => {
  const { phase } = useAuthStore();

  if (phase === 'BOOTING') return null;
  if (phase === 'ANONYMOUS' || phase === 'ERROR') return <Navigate to="/auth/login" replace />;
  if (phase !== 'ADMIN_READY') return <Navigate to="/customer/dashboard" replace />;

  return <Outlet />;
};

/**
 * CUSTOMER ROUTE GUARD (v5.0 State Machine)
 * 
 * Phase check:
 *   BOOTING        → show nothing (wait)
 *   CUSTOMER_READY → allow
 *   ADMIN_READY    → redirect to /admin/dashboard
 *   ANONYMOUS      → redirect to /auth/login
 */
export const CustomerRoute: React.FC = () => {
  const { phase } = useAuthStore();

  if (phase === 'BOOTING') return null;
  if (phase === 'ANONYMOUS' || phase === 'ERROR') return <Navigate to="/auth/login" replace />;
  if (phase === 'ADMIN_READY') return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
};
