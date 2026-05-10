import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AdminShield from './admin/AdminShield';
import AdminDashboard from './admin/AdminDashboard';
import { Shield } from 'lucide-react';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 7) {
      window.location.hash = '#/admin';
      setLogoClicks(0);
    }
  };

  // Simple Router
  if (route.startsWith('#/admin')) {
    return (
      <AdminShield>
        <AdminDashboard />
      </AdminShield>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <div 
        onClick={handleLogoClick}
        className="cursor-pointer select-none mb-8 group"
      >
        <div className="flex items-center gap-3">
          <Shield className="text-red-600 group-hover:scale-110 transition-transform" size={48} />
          <h1 className="text-4xl font-bold tracking-tighter">FLAGSTAR <span className="text-red-600">BANK</span></h1>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Simulation Environment Active</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The Flagstar Bank core engine is running in deterministic mode. 
          Access the banking interface or use administrative credentials to orchestrate the system.
        </p>
        
        <div className="grid gap-4">
          <button 
            onClick={() => window.location.hash = '#/login'}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
          >
            Access Customer Portal
          </button>
          <button 
            onClick={() => window.location.hash = '#/admin-login'}
            className="w-full bg-red-600/10 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-600/20 border border-red-600/20 transition-all"
          >
            Administrative Access
          </button>
        </div>
      </div>

      <p className="mt-12 text-[10px] text-gray-700 uppercase tracking-[0.4em]">
        Secured by Deterministic State Machine Core v7.0
      </p>
    </div>
  );
};

export default App;
