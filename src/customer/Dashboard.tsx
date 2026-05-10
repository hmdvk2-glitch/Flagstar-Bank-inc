import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  Send, 
  History, 
  PieChart, 
  Settings, 
  LogOut, 
  Shield, 
  ArrowUpRight, 
  ArrowDownLeft,
  Bell,
  CreditCard
} from 'lucide-react';
import { supabase } from '../supabase/client';
import { Queries } from '../supabase/queries';
import TransferUI from './TransferUI';
import StatementView from './StatementView';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSFER' | 'HISTORY'>('OVERVIEW');

  const fetchData = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await Queries.getProfile(authUser.id);
      const { data: accs } = await Queries.getAccounts(authUser.id);
      
      setUser(profile);
      setAccounts(accs || []);

      if (accs && accs.length > 0) {
        const { data: txns } = await Queries.getTransactions(accs[0].id);
        setTransactions(txns || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#/login';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
      {/* Mobile Nav */}
      <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between">
        <h1 className="font-bold tracking-tighter">FLAGSTAR <span className="text-red-600">BANK</span></h1>
        <button onClick={handleLogout} className="text-gray-500"><LogOut size={20} /></button>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#111] border-r border-white/10 flex-col p-8">
        <div className="mb-12">
          <h1 className="text-xl font-bold tracking-tighter">FLAGSTAR <span className="text-red-600">BANK</span></h1>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mt-2">Member Portal</p>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { id: 'OVERVIEW', label: 'Vault Overview', icon: <Wallet size={20} /> },
            { id: 'TRANSFER', label: 'Funds Transfer', icon: <Send size={20} /> },
            { id: 'HISTORY', label: 'Transaction Log', icon: <History size={20} /> },
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

        <div className="space-y-4">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-gray-600 uppercase font-black">Secure Status</p>
            <div className="flex items-center gap-2 mt-2">
              <Shield size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">DETERMINISTIC_ON</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-gray-600 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Secure Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.name?.split(' ')[0]}</h2>
            <p className="text-gray-500 mt-1">Status: Fully Verified • Account #{user?.account_number}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white/5 rounded-2xl border border-white/5 text-gray-400 hover:text-white transition-all">
              <Bell size={20} />
            </button>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/20">
              <span className="font-black text-xl">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Account Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {accounts.map((acc) => (
                <div key={acc.id} className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="relative z-10 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-white/60 uppercase font-black tracking-widest">{acc.type}</p>
                        <h3 className="text-4xl font-bold mt-2">${acc.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      </div>
                      <CreditCard size={32} className="text-white/20" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="font-mono text-sm tracking-[0.2em] text-white/80">
                        {acc.account_number}
                      </div>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-white/20">Active</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center text-center space-y-4 group cursor-pointer hover:border-white/10 transition-all">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PieChart size={28} className="text-gray-500" />
                </div>
                <div>
                  <h4 className="font-bold">Portfolio Analysis</h4>
                  <p className="text-xs text-gray-600 mt-1">Available in Phase 2.15</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <History size={20} className="text-red-600" />
                  Recent Activity
                </h3>
                <button 
                  onClick={() => setActiveTab('HISTORY')}
                  className="text-xs font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="bg-[#111] p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        txn.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{txn.description || 'Global Wire Transfer'}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold tracking-tighter ${
                        txn.type === 'credit' ? 'text-emerald-500' : 'text-white'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[9px] uppercase font-black text-gray-700 tracking-widest">{txn.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TRANSFER' && <TransferUI onComplete={fetchData} />}
        {activeTab === 'HISTORY' && <StatementView transactions={transactions} />}
      </main>
    </div>
  );
};

export default Dashboard;
