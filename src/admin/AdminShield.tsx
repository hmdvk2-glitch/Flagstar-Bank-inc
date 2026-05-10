import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminShieldProps {
  children: React.ReactNode;
}

const AdminShield: React.FC<AdminShieldProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check role in customers table (or profiles table)
      const { data, error } = await supabase
        .from('customers')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data || data.role !== 'admin') {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-xl mb-8">Access Denied: Administrative Privileges Required</p>
        <button 
          onClick={() => window.location.hash = '#/'}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
        >
          Return to Safety
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminShield;
