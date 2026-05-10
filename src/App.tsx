import React, { useState, useEffect } from 'react';
import Login from './customer/Login';
import Dashboard from './customer/Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import { supabase } from './supabase/client';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/login');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/login');
    window.addEventListener('hashchange', handleHashChange);
    
    // Auth Listener for route protection
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        window.location.hash = '#/login';
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  // Simplified Router
  const renderRoute = () => {
    if (route === '#/login' || route === '#/') return <Login />;
    if (route === '#/dashboard') return <Dashboard />;
    if (route === '#/admin') return <AdminDashboard />;
    
    return <Login />; // Fallback
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {renderRoute()}
    </div>
  );
};

export default App;
