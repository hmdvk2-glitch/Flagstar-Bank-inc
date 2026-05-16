import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { requireAdmin } from '../auth/adminGuard';

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  
  try {
    requireAdmin(user);
    return <Outlet />;
  } catch (err) {
    return <Navigate to="/customer/dashboard" replace />;
  }
};

export const CustomerRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  
  try {
    requireAdmin(user);
    // If admin, redirect away from customer dashboard
    return <Navigate to="/admin/dashboard" replace />;
  } catch (err) {
    // If not admin, they are a customer
    return <Outlet />;
  }
};
