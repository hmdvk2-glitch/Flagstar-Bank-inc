import React, { useState } from 'react';
import { Shield, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase/client';

interface AdminShieldProps {
  children?: React.ReactNode;
}

const AdminShield: React.FC<AdminShieldProps> = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', pin: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.pin
      });

      if (error || !data?.user) {
        throw new Error(error?.message || 'Invalid credentials');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Access denied');
      }

      localStorage.setItem(
        'admin_session',
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          role: profile.role
        })
      );

      setShowLogin(false);
      navigate('/admin');

    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (!children) {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLogin(true)}
          className="p-4 rounded-2xl bg-white border shadow-xl opacity-30 hover:opacity-100"
        >
          <Shield className="h-6 w-6 text-[#C00000]" />
        </motion.button>

        <AnimatePresence>
          {showLogin && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogin(false)} />

              <div className="relative bg-white p-8 rounded-2xl w-full max-w-md z-10">
                <div className="flex justify-between items-center">
                  <Lock className="text-[#C00000]" />
                  <button onClick={() => setShowLogin(false)}>
                    <X />
                  </button>
                </div>

                <h2 className="text-xl font-bold mt-4">Admin Login</h2>

                <form onSubmit={handleAdminLogin} className="space-y-4 mt-6">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border rounded"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                  />

                  <input
                    type="password"
                    placeholder="PIN"
                    className="w-full p-3 border rounded"
                    value={credentials.pin}
                    onChange={(e) =>
                      setCredentials({ ...credentials, pin: e.target.value })
                    }
                  />

                  {authError && (
                    <p className="text-red-500 text-sm">{authError}</p>
                  )}

                  <button
                    disabled={authLoading}
                    className="w-full bg-[#C00000] text-white p-3 rounded"
                  >
                    {authLoading ? 'Verifying...' : 'Login'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  const session = localStorage.getItem('admin_session');

  if (session) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">403</h1>
      <p>Access Denied</p>
      <button onClick={() => navigate('/')}>Return</button>
    </div>
  );
};

export default AdminShield;