import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Search, ShieldCheck, Mail, CreditCard, DollarSign } from 'lucide-react';

const AccountManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!', // Default password for simulation
    initialBalance: '0',
    role: 'customer',
    accountType: 'Checking'
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const userId = authData.user.id;
      const accountNumber = 'FS-' + Math.floor(100000 + Math.random() * 900000);

      // 2. Create Customer Record
      const { error: customerError } = await supabase
        .from('customers')
        .insert([{
          id: userId,
          name: formData.name,
          email: formData.email,
          account_number: accountNumber,
          balance: parseFloat(formData.initialBalance),
          role: formData.role,
          kyc_status: 'verified'
        }]);

      if (customerError) throw customerError;

      // 3. Create Account Record
      const { error: accountError } = await supabase
        .from('accounts')
        .insert([{
          customer_id: userId,
          type: formData.accountType,
          account_number: accountNumber,
          balance: parseFloat(formData.initialBalance),
          status: 'active'
        }]);

      if (accountError) throw accountError;

      setMessage({ type: 'success', text: `Successfully created account for ${formData.name}. Account Number: ${accountNumber}` });
      setFormData({
        name: '',
        email: '',
        password: 'Password123!',
        initialBalance: '0',
        role: 'customer',
        accountType: 'Checking'
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#161616] p-8 rounded-2xl border border-white/5 shadow-2xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600">
          <UserPlus size={20} />
          Create New Customer Vault
        </h3>

        <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 text-gray-600" size={18} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                placeholder="Jane Cooper"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-600" size={18} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Initial Balance ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-600" size={18} />
              <input
                type="number"
                required
                value={formData.initialBalance}
                onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                placeholder="5000.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Type</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 text-gray-600" size={18} />
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all appearance-none"
              >
                <option value="Checking">Checking Account</option>
                <option value="Savings">Savings Account</option>
                <option value="Holiday">Holiday Club</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" /> : <UserPlus size={20} />}
              Initialize Secure Vault Record
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}
      </div>

      <div className="bg-[#161616] p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            Recent Account Operations
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
                <th className="pb-4 font-semibold">User</th>
                <th className="pb-4 font-semibold">Account #</th>
                <th className="pb-4 font-semibold">Type</th>
                <th className="pb-4 font-semibold">Balance</th>
                <th className="pb-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 font-medium text-sm">Customer Record #{1024 + i}</td>
                  <td className="py-4 text-sm font-mono text-gray-400">FS-8829{i}</td>
                  <td className="py-4 text-sm">Checking</td>
                  <td className="py-4 text-sm font-bold">$12,450.00</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase border border-emerald-500/20">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;
