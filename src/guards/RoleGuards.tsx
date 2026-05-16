import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ADMIN ROUTE GUARD (v5.1 Non-Blocking)
 * 
 * During BOOTING, redirect to login (safe default).
 * After hydration completes, enforce phase-based access.
 */
export const AdminRoute: React.FC = () => {
  const { phase } = useAuthStore();

  if (phase === 'ADMIN_READY') return <Outlet />;
  if (phase === 'BOOTING' || phase === 'ANONYMOUS' || phase === 'ERROR') return <Navigate to="/auth/login" replace />;
  
  return <Navigate to="/customer/dashboard" replace />;
};

/**
 * CUSTOMER ROUTE GUARD (v5.1 Non-Blocking)
 */
export const CustomerRoute: React.FC = () => {
  const { phase } = useAuthStore();

  if (phase === 'CUSTOMER_READY') return <Outlet />;
  if (phase === 'ADMIN_READY') return <Navigate to="/admin/dashboard" replace />;
  
  return <Navigate to="/auth/login" replace />;
};
