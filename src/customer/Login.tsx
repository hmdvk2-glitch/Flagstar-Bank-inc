import React, { useState } from 'react';
import { Shield, Key, ArrowRight, Loader2, CreditCard, Lock } from 'lucide-react';
import { Queries } from '../supabase/queries';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    accountNumber: '',
    pin: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: user, error: queryError } = await Queries.login(
        credentials.accountNumber,
        credentials.pin
      );

      if (queryError || !user) throw new Error('Invalid Account Number or Access PIN');

      // Set local session (Simulation style)
      localStorage.setItem('bank_user', JSON.stringify(user));
      
      // Redirect based on role
      if (user.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        window.location.hash = '#/dashboard';
      }
      
      window.location.reload(); // Force app state refresh
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-red-600/10 p-6 rounded-[2.5rem] border border-red-600/20 mb-6 group hover:scale-105 transition-transform duration-500 shadow-2xl shadow-red-600/10">
            <Shield size={48} className="text-red-600 group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">FLAGSTAR <span className="text-red-600">BANK</span></h1>
          <p className="text-gray-500 mt-2 text-[10px] uppercase tracking-[0.5em] font-black">Secure Digital Gateway</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-[3rem]" />
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={12} className="text-red-600" /> Account Number
                </label>
                <input
                  type="text"
                  required
                  value={credentials.accountNumber}
                  onChange={(e) => setCredentials({...credentials, accountNumber: e.target.value.toUpperCase()})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800 font-mono tracking-widest text-lg"
                  placeholder="FL-XXXXXX"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} className="text-red-600" /> Access PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={credentials.pin}
                  onChange={(e) => setCredentials({...credentials, pin: e.target.value.replace(/\D/g, '')})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800 font-mono tracking-[1.5em] text-center text-lg"
                  placeholder="****"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-2xl shadow-red-600/30 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="uppercase tracking-widest">Authorize Access</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em] font-bold mb-4">Fortified by Enterprise Shield Protocol</p>
          <div className="flex items-center justify-center gap-6">
            <div className="h-px w-12 bg-white/5" />
            <Shield size={16} className="text-white/10" />
            <div className="h-px w-12 bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
