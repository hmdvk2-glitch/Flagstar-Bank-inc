import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail } from 'lucide-react';

const AdminShield: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const isAdmin = useAppStore((state) => state.isAdmin);

  if (isAdmin) {
    return null; // Do not show shield if already admin
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success('Admin authenticated');
      setIsOpen(false);
      navigate('/admin/dashboard');
      // Store state is updated in App.tsx onAuthStateChange listener
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-gray-900 text-gray-400 hover:text-white rounded-full shadow-lg hover:shadow-xl transition z-40"
        title="Admin Access"
      >
        <Shield className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md relative text-white">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              &times;
            </button>
            <div className="flex justify-center mb-6">
              <div className="bg-red-900/30 p-4 rounded-full">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-6 text-center tracking-wider">RESTRICTED ACCESS</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    placeholder="Admin Email"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    placeholder="Password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition mt-4"
              >
                {loading ? 'Verifying...' : 'Authorize'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminShield;
