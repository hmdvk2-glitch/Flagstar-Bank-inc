import React, { useState } from 'react';
import { supabase } from '../supabase/client';
import { Shield, Key, ArrowRight, Loader2, CreditCard } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [credentials, setCredentials] = useState({
    accountNumber: '',
    pin: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real banking app, we'd use a custom login edge function 
      // but for simulation we verify against the customers table
      const { data: customer, error: queryError } = await supabase
        .from('customers')
        .select('id, email, pin_hash')
        .eq('account_number', credentials.accountNumber)
        .single();

      if (queryError || !customer) throw new Error('Invalid Account Number');

      // Note: In production, we'd verify the PIN hash here.
      // For the simulation prototype, we'll proceed to the email login.
      
      // We'll use the email to sign in via Supabase Auth
      // (Admins create these users in the provisioning step)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: customer.email,
        password: 'Password123!', // Standard simulation password
      });

      if (authError) throw authError;
      
      window.location.hash = '#/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-red-600/10 p-5 rounded-[2rem] border border-red-600/20 mb-6 group hover:scale-105 transition-transform">
            <Shield size={48} className="text-red-600 group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">FLAGSTAR <span className="text-red-600">BANK</span></h1>
          <p className="text-gray-500 mt-2 text-xs uppercase tracking-[0.4em] font-medium">Digital Access Core</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-[2.5rem]" />
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={12} /> Account Number
                </label>
                <input
                  type="text"
                  required
                  value={credentials.accountNumber}
                  onChange={(e) => setCredentials({...credentials, accountNumber: e.target.value.toUpperCase()})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800 font-mono tracking-widest"
                  placeholder="FLAG-10XXXX"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Key size={12} /> Access PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={credentials.pin}
                  onChange={(e) => setCredentials({...credentials, pin: e.target.value.replace(/\D/g, '')})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800 font-mono tracking-[1.5em] text-center"
                  placeholder="****"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>Unlock Digital Vault</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em] mb-4">Secured by Enterprise Shield Technology</p>
          <div className="flex items-center justify-center gap-6">
            <div className="h-px w-8 bg-white/5" />
            <Shield size={16} className="text-white/10" />
            <div className="h-px w-8 bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
