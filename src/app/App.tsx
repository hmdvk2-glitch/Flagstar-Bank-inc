import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../supabase/client';

import Home from './Home';
import Dashboard from './Dashboard';
import FunnelLoader from './FunnelLoader';
import ProtectedRoute from '../components/ProtectedRoute';

const App: React.FC = () => {
  const { setAdmin, logout, isAdmin, isCustomer } = useAppStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data } = await supabase.from('admins').select('*').eq('auth_user_id', session.user.id).single();
        if (data) {
          setAdmin({ id: data.id, name: data.name, email: data.email });
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAdmin, logout]);

  const isAuthenticated = isAdmin || isCustomer;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/">
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/funnel/:id" element={
          <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/">
            <FunnelLoader />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;