import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface ProtectedRouteProps {
  isAllowed: boolean;
  redirectTo?: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAllowed, redirectTo = '/', children }) => {
  // We re-read from the hook here to ensure reactivity
  const { isAdmin, isCustomer } = useAppStore();
  
  // The prop isAllowed is evaluated at render, but using the hook ensures updates trigger re-renders.
  // Actually, we'll just trust the parent passes the right boolean.
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
