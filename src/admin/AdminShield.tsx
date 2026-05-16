import React, { useState } from 'react';
import { Shield, Lock, X, RefreshCcw, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { adminAuth } from '../auth/adminAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminShieldProps {
  children?: React.ReactNode;
}

/**
 * ADMIN SHIELD (v5.0 State Machine)
 * 
 * Uses phase-based gating instead of role checks.
 * Phase === 'ADMIN_READY' → allow children
 * Otherwise → 403 lockout
 */
const AdminShield: React.FC<AdminShieldProps> = ({ children }) => {
  const { isAdmin } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', pin: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      await adminAuth.login(credentials.email, credentials.pin);
      setShowLogin(false);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication Failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Mode: Trigger (No children) — Discreet entry point on Home page
  if (!children) {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLogin(true)}
          className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 hover:border-[#C00000]/30 shadow-xl transition-all group relative z-50 opacity-10 hover:opacity-100"
          title="Administrative Access Core"
        >
          <Shield className="h-6 w-6 text-[#C00000]" />
          <div className="absolute inset-0 bg-[#C00000]/5 rounded-2xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
        </motion.button>

        {/* Admin Login Modal */}
        <AnimatePresence>
          {showLogin && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" 
                onClick={() => setShowLogin(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-white rounded-[3rem] border border-gray-100 shadow-[0_50px_100px_-20px_rgba(192,0,0,0.15)] overflow-hidden relative z-10"
              >
                <div className="p-12 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="bg-[#C00000] p-4 rounded-2xl shadow-xl shadow-[#C00000]/20 text-white">
                      <Lock size={24} />
                    </div>
                    <button onClick={() => setShowLogin(false)} className="p-2 text-gray-400 hover:text-[#111827] transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-[#111827]">Administrative Terminal</h3>
                    <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-black">Authorized Personnel Only</p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                      <input
                        required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-[#C00000] transition-all font-bold"
                        placeholder="Admin Email"
                        value={credentials.email} onChange={e => setCredentials({...credentials, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure PIN</label>
                      <input
                        type="password" required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-[#C00000] transition-all font-bold tracking-[0.5em]"
                        placeholder="••••"
                        value={credentials.pin} onChange={e => setCredentials({...credentials, pin: e.target.value})}
                      />
                    </div>

                    {authError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{authError}</p>}

                    <button 
                      disabled={authLoading}
                      className="w-full bg-[#C00000] hover:bg-[#A00000] text-white font-black py-6 rounded-2xl shadow-xl shadow-[#C00000]/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                      {authLoading ? <RefreshCcw className="animate-spin" /> : <>Initiate Secure Handshake <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Mode: Wrapper — Phase-based gating
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] text-[#111827] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[3.5rem] border border-gray-100 mb-10 shadow-2xl shadow-[#C00000]/5 flex items-center justify-center"
      >
        <Lock className="h-20 w-20 text-[#C00000]" />
      </motion.div>
      <h1 className="text-6xl font-bold tracking-tighter mb-4 text-[#111827]">403</h1>
      <p className="text-xs font-black text-gray-400 mb-12 uppercase tracking-[0.3em]">Institutional Restriction: Access Denied</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-12 py-5 bg-[#C00000] hover:bg-[#A00000] text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-[#C00000]/20 group"
      >
        <span className="group-hover:scale-105 transition-transform inline-block">Return to Vault</span>
      </button>
    </div>
  );
};

export default AdminShield;
