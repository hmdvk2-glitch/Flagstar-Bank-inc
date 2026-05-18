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
    // 1. Get initial session safely on mount
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from('admins').select('*').eq('auth_user_id', session.user.id).single();
          if (data) {
            setAdmin({ id: data.id, name: data.name, email: data.email });
          }
        }
      } catch (err) {
        console.error('Session hydration error:', err);
      }
    };
    
    checkInitialSession();

    // 2. Subscribe to auth changes without returning any promise/value from the outer callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Perform async actions inside a self-executing context to avoid returning a promise
        (async () => {
          try {
            const { data } = await supabase.from('admins').select('*').eq('auth_user_id', session.user.id).single();
            if (data) {
              setAdmin({ id: data.id, name: data.name, email: data.email });
            }
          } catch (err) {
            console.error('Admin profile query error on sign-in:', err);
          }
        })();
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

        {/* Funnel loader is non-protected to allow anonymous user simulations and lead generation */}
        <Route path="/funnel/:id" element={<FunnelLoader />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;