import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/customer/dashboard" replace />;

  return <Outlet />;
};

export const CustomerRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.role !== 'customer') return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
};
