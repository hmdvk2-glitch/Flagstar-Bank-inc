import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  ShieldCheck, 
  LogOut,
  Plus,
  ArrowRightLeft,
  Shield,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import AdminShield from './AdminShield';
import { Queries } from '../supabase/queries';
import { Mutations } from '../supabase/mutations';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'TRANSACTIONS' | 'RESTRICTIONS'>('USERS');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data } = await Queries.getAccounts();
    if (data) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bank_user');
    window.location.reload();
  };

  return (
    <AdminShield>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a] text-white">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-[#111] border-r border-white/5 flex flex-col p-8">
          <div className="mb-12 flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase">Flagstar <span className="text-red-600">Admin</span></h1>
              <p className="text-[9px] text-gray-600 font-black tracking-widest uppercase">Management Node</p>
            </div>
          </div>

          <nav className="flex-1 space-y-4">
            {[
              { id: 'USERS', label: 'Customer Central', icon: <Users size={18} /> },
              { id: 'TRANSACTIONS', label: 'Ledger Control', icon: <ArrowRightLeft size={18} /> },
              { id: 'RESTRICTIONS', label: 'Security Protocols', icon: <ShieldCheck size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  activeTab === item.id 
                  ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="mt-12 w-full flex items-center gap-4 p-4 text-gray-600 hover:text-red-500 transition-colors font-bold"
          >
            <LogOut size={18} />
            <span>Terminate Admin Session</span>
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 md:p-12 bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
          {activeTab === 'USERS' && <CustomerManagement customers={customers} onUpdate={loadData} />}
          {activeTab === 'TRANSACTIONS' && <LedgerControl customers={customers} onUpdate={loadData} />}
          {activeTab === 'RESTRICTIONS' && <SecurityProtocols customers={customers} />}
        </main>
      </div>
    </AdminShield>
  );
};

/* Customer Management Sub-Component */
const CustomerManagement: React.FC<{ customers: any[], onUpdate: () => void }> = ({ customers, onUpdate }) => {
  const [form, setForm] = useState({ name: '', email: '', balance: '', pin: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const accNum = 'FS-' + Math.floor(100000 + Math.random() * 900000);
      await Mutations.createCustomer({
        name: form.name,
        email: form.email,
        accountNumber: accNum,
        pin: form.pin,
        balance: Number(form.balance)
      });
      setForm({ name: '', email: '', balance: '', pin: '' });
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Customer Central</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Provisioning and Lifecycle Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <Plus size={20} className="text-red-600" />
            Provision Vault
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input 
                required placeholder="Full Name" 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-red-600 transition-all"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              />
              <input 
                required placeholder="Email Address" type="email"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-red-600 transition-all"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              />
              <input 
                required placeholder="Opening Balance ($)" type="number"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-red-600 transition-all font-mono"
                value={form.balance} onChange={e => setForm({...form, balance: e.target.value})}
              />
              <input 
                required placeholder="Access PIN (4-6 Digits)" maxLength={6}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-red-600 transition-all font-mono tracking-widest"
                value={form.pin} onChange={e => setForm({...form, pin: e.target.value.replace(/\D/g, '')})}
              />
            </div>
            <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all">
              {loading ? 'Initializing...' : 'Authorize Provisioning'}
            </button>
          </form>
        </div>

        {/* Customer List */}
        <div className="lg:col-span-2 bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <Users size={20} className="text-red-600" />
            Active Vaults
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {customers.map(c => (
              <div key={c.id} className="bg-black/40 p-6 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-red-600/30 transition-all">
                <div>
                  <p className="font-bold text-sm tracking-tight">{c.full_name}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">{c.account_number} • PIN: {c.pin}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-500 tracking-tighter">${Number(c.balance).toLocaleString()}</p>
                  <p className="text-[9px] uppercase font-black text-gray-700 tracking-widest">Active Status</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Ledger Control Sub-Component */
const LedgerControl: React.FC<{ customers: any[], onUpdate: () => void }> = ({ customers, onUpdate }) => {
  const [selected, setSelected] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransaction = async (type: 'credit' | 'debit') => {
    if (!selected || !amount) return;
    setLoading(true);
    try {
      await Mutations.recordTransaction(selected.id, Number(amount), type, narration || `${type.toUpperCase()} - Admin Override`);
      setAmount('');
      setNarration('');
      onUpdate();
      alert(`Successfully ${type === 'credit' ? 'funded' : 'debited'} account.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase">Ledger Orchestration</h2>
        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Manual Balance Control & Transaction Injection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <select 
              className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-red-600 appearance-none cursor-pointer"
              onChange={(e) => setSelected(customers.find(c => c.id === e.target.value))}
            >
              <option value="">Select Target Vault...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.account_number})</option>)}
            </select>
          </div>

          {selected && (
            <div className="bg-[#111] p-8 rounded-[2.5rem] border border-red-600/20 shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Target Identity</p>
                  <h4 className="text-2xl font-bold">{selected.full_name}</h4>
                  <p className="text-sm text-gray-500 font-mono mt-1">{selected.account_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Available Funds</p>
                  <h4 className="text-2xl font-black text-emerald-500">${Number(selected.balance).toLocaleString()}</h4>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    placeholder="0.00" type="number"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-red-600 font-mono text-xl"
                    value={amount} onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <input 
                  placeholder="Transaction Narration (Optional)" 
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none focus:border-red-600"
                  value={narration} onChange={e => setNarration(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    disabled={loading || !amount} onClick={() => handleTransaction('credit')}
                    className="bg-emerald-600 hover:bg-emerald-700 py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-emerald-600/10 transition-all disabled:bg-gray-800"
                  >
                    Credit Account
                  </button>
                  <button 
                    disabled={loading || !amount} onClick={() => handleTransaction('debit')}
                    className="bg-red-600 hover:bg-red-700 py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-red-600/10 transition-all disabled:bg-gray-800"
                  >
                    Debit Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-red-600/5 p-10 rounded-[3rem] border border-red-600/10 flex flex-col justify-between">
          <div>
            <Shield size={40} className="text-red-600 mb-8" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Direct Balance Mutation</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Mutations injected here skip the verification engine and affect the core ledger immediately. 
              Always provide an accurate narration for audit compliance.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-red-600/10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Protocol Version</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">STABLE_V2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Security Protocols (Restrictions) Sub-Component */
const SecurityProtocols: React.FC<{ customers: any[] }> = ({ customers }) => {
  const [selected, setSelected] = useState<any>(null);
  const [restrictions, setRestrictions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      Queries.getTransferRestrictions(selected.id).then(({ data }) => setRestrictions(data));
    }
  }, [selected]);

  const toggle = async (field: string) => {
    if (!selected || !restrictions) return;
    const update = { [field]: !restrictions[field] };
    await Mutations.updateRestrictions(selected.id, update);
    setRestrictions({...restrictions, ...update});
  };

  const updateCode = async (field: string, val: string) => {
    if (!selected || !restrictions) return;
    const update = { [field]: val };
    await Mutations.updateRestrictions(selected.id, update);
    setRestrictions({...restrictions, ...update});
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase">Security Protocols</h2>
        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Manage Transfer Restrictions & Authentication Codes</p>
      </div>

      <div className="max-w-4xl space-y-8">
        <select 
          className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 outline-none focus:border-red-600 appearance-none cursor-pointer"
          onChange={(e) => setSelected(customers.find(c => c.id === e.target.value))}
        >
          <option value="">Select Target Vault for Protocol Management...</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.account_number})</option>)}
        </select>

        {selected && restrictions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
            {[
              { id: 'cot', label: 'Cost of Transfer (COT)' },
              { id: 'tax', label: 'Tax Compliance (TAX)' },
              { id: 'irs', label: 'IRS Authority (IRS)' },
            ].map((p) => (
              <div key={p.id} className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">{p.label}</span>
                  <button 
                    onClick={() => toggle(`${p.id}_enabled`)}
                    className={`h-6 w-12 rounded-full relative transition-all ${restrictions[`${p.id}_enabled`] ? 'bg-red-600' : 'bg-gray-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${restrictions[`${p.id}_enabled`] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Active Code</label>
                  <input 
                    className="w-full bg-black border border-white/5 rounded-xl p-3 text-sm font-mono text-red-500 font-bold outline-none focus:border-red-600"
                    value={restrictions[`${p.id}_code`] || ''}
                    onChange={(e) => updateCode(`${p.id}_code`, e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {restrictions[`${p.id}_enabled`] ? (
                    <AlertCircle size={14} className="text-red-500" />
                  ) : (
                    <CheckCircle size={14} className="text-emerald-500" />
                  )}
                  <span className={`text-[9px] font-black uppercase tracking-widest ${restrictions[`${p.id}_enabled`] ? 'text-red-500' : 'text-emerald-500'}`}>
                    {restrictions[`${p.id}_enabled`] ? 'Enforcement Active' : 'By-Pass Enabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
