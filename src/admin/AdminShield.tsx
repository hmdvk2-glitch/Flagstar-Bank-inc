import React, { useEffect, useState } from 'react';
import { Shield, Loader2, Lock } from 'lucide-react';

interface AdminShieldProps {
  children?: React.ReactNode;
}

const AdminShield: React.FC<AdminShieldProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('bank_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mode: Trigger (No children)
  // This is used in the footer as a discreet entry point
  if (!children) {
    return (
      <button
        onClick={() => window.location.hash = '#/admin'}
        className="
          opacity-20
          hover:opacity-100
          transition-all
          duration-300
          p-2
          rounded-xl
          bg-white/5
          hover:bg-white/10
          border border-white/0
          hover:border-white/10
          group
          relative
        "
        title="Administrative Access Core"
      >
        <Shield className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  // Mode: Gate (With children)
  // This protects the admin dashboard
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
        <div className="bg-red-600/10 p-10 rounded-[3.5rem] border border-red-600/20 mb-10 shadow-2xl shadow-red-600/10">
          <Lock className="h-24 w-24 text-red-600" />
        </div>
        <h1 className="text-6xl font-bold tracking-tighter mb-4">403</h1>
        <p className="text-xl font-medium text-gray-500 mb-12 uppercase tracking-[0.2em]">Restricted Administrative Area</p>
        <button 
          onClick={() => window.location.hash = '#/'}
          className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-red-600/30 group"
        >
          <span className="group-hover:scale-105 transition-transform inline-block">Return to Terminal</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminShield;
