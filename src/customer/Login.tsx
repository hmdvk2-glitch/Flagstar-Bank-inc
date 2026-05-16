import React, { useState } from 'react';
import { Shield, ArrowRight, CreditCard, Lock, Mail, Key } from 'lucide-react';
import { customerAuth } from '../auth/customerAuth';
import { adminAuth } from '../auth/adminAuth';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  
  const [customerCreds, setCustomerCreds] = useState({ accountNumber: '', pin: '' });
  const [adminCreds, setAdminCreds] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'CUSTOMER') {
        await customerAuth.login(customerCreds.accountNumber, customerCreds.pin);
      } else {
        await adminAuth.login(adminCreds.email, adminCreds.password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 relative overflow-hidden text-[#111827] flex flex-col items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C00000]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C00000]/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#C00000]/5 p-6 rounded-[2.5rem] border border-[#C00000]/10 mb-6 group hover:scale-105 transition-transform duration-500 shadow-xl shadow-[#C00000]/5">
            <Shield size={48} className="text-[#C00000]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Flagstar <span className="text-[#C00000]">Bank</span></h1>
          <p className="text-gray-400 mt-2 text-[10px] uppercase tracking-[0.5em] font-black">Digital Gateway Terminal</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setMode('CUSTOMER')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'CUSTOMER' ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-400'}`}
          >
            Customer Terminal
          </button>
          <button 
            onClick={() => setMode('ADMIN')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'ADMIN' ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-400'}`}
          >
            Admin Shield
          </button>
        </div>

        <div className="bg-white border border-gray-100 p-10 rounded-[3rem] shadow-2xl relative">
          <form onSubmit={handleLogin} className="space-y-8">
            {mode === 'CUSTOMER' ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={12} className="text-[#C00000]" /> Account Number
                  </label>
                  <input
                    type="text" required
                    value={customerCreds.accountNumber}
                    onChange={(e) => setCustomerCreds({...customerCreds, accountNumber: e.target.value.toUpperCase()})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:border-[#C00000] outline-none font-mono tracking-widest text-lg"
                    placeholder="FL-XXXXXX"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={12} className="text-[#C00000]" /> Access PIN
                  </label>
                  <input
                    type="password" required maxLength={6}
                    value={customerCreds.pin}
                    onChange={(e) => setCustomerCreds({...customerCreds, pin: e.target.value.replace(/\D/g, '')})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:border-[#C00000] outline-none font-mono tracking-[1.5em] text-center text-lg"
                    placeholder="****"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} className="text-[#C00000]" /> Admin Email
                  </label>
                  <input
                    type="email" required
                    value={adminCreds.email}
                    onChange={(e) => setAdminCreds({...adminCreds, email: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:border-[#C00000] outline-none font-bold text-sm"
                    placeholder="operator@flagstar.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} className="text-[#C00000]" /> Secure Passkey
                  </label>
                  <input
                    type="password" required
                    value={adminCreds.password}
                    onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:border-[#C00000] outline-none font-bold text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C00000] hover:bg-[#A00000] disabled:bg-gray-200 text-white font-black py-5 rounded-2xl shadow-xl shadow-[#C00000]/20 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <span className="uppercase tracking-widest">{mode === 'ADMIN' ? 'Activate Shield' : 'Authorize Access'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em] font-bold">Institutional Security Protocol v4.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
