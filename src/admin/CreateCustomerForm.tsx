import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Shield, DollarSign, Key, Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const CreateCustomerForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    initialDeposit: '',
    pin: '',
    accountType: 'Checking'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-customer', {
        body: formData
      });

      if (error) throw error;

      if (data.success) {
        setStatus({
          type: 'success',
          message: `Customer created successfully! Account Number: ${data.accountNumber}`
        });
        setFormData({
          name: '',
          email: '',
          initialDeposit: '',
          pin: '',
          accountType: 'Checking'
        });
      } else {
        throw new Error(data.error || 'Provisioning failed');
      }
    } catch (err: any) {
      console.error('Provisioning error:', err);
      setStatus({
        type: 'error',
        message: err.message || 'An unexpected error occurred during provisioning'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-red-600/10 border-b border-white/5 p-6 flex items-center gap-4">
        <div className="bg-red-600 p-3 rounded-xl shadow-lg shadow-red-600/20">
          <UserPlus size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Provision New Customer</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">Admin Execution Layer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="Jonathan Flagstar"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="customer@example.com"
            />
          </div>

          {/* Initial Deposit */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={12} /> Initial Deposit
            </label>
            <input
              type="number"
              required
              value={formData.initialDeposit}
              onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="5000.00"
            />
          </div>

          {/* PIN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Key size={12} /> Secure PIN (4-6 Digits)
            </label>
            <input
              type="password"
              required
              maxLength={6}
              minLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-[1em] focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-700"
              placeholder="****"
            />
          </div>

          {/* Account Type */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> Account Class
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="Checking">Essential Checking</option>
              <option value="Savings">High-Yield Savings</option>
              <option value="Holiday">Holiday Club</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 group"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
              <span>Initiate Secure Provisioning</span>
            </>
          )}
        </button>

        {status && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in zoom-in-95 duration-300 ${
            status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}
      </form>

      <div className="bg-black/20 p-4 border-t border-white/5">
        <p className="text-[10px] text-gray-600 text-center uppercase tracking-[0.2em]">
          Deterministic Execution Engine • AES-256 Hashing Active
        </p>
      </div>
    </div>
  );
};

export default CreateCustomerForm;
