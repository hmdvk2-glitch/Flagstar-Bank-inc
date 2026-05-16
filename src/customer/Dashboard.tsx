import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  Send, 
  LogOut, 
  Shield, 
  ArrowUpRight, 
  ArrowDownLeft,
  Bell,
  CreditCard,
  History,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { customerAuth } from '../auth/customerAuth';
import TransferUI from './TransferUI';
import StatementView from './StatementView';
import { supabase } from '../supabase/client';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSFER' | 'STATEMENT'>('OVERVIEW');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTransactions(data || []);
    } catch (error) {
      console.error("Failed to sync secure core:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    if (!user?.id) return;

    // ─── REAL-TIME SYNCHRONIZATION (MEMBER CHANNEL) ────────────────────
    const channel = supabase
      .channel(`member-sync-${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users', 
        filter: `id=eq.${user.id}` 
      }, () => fetchData())
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions', 
        filter: `user_id=eq.${user.id}` 
      }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleLogout = () => {
    customerAuth.logout();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center space-y-6">
      <div className="h-16 w-16 border-4 border-[#C00000]/10 border-t-[#C00000] rounded-full animate-spin shadow-2xl shadow-[#C00000]/20" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Syncing Secure Core...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-100 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#C00000] p-2 rounded-lg shadow-sm">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tighter uppercase">Flagstar <span className="text-[#C00000]">Bank</span></h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-gray-50 rounded-lg">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:flex w-full md:w-80 bg-white border-r border-gray-100 flex-col p-6 md:p-8 z-40 fixed md:sticky top-0 h-screen md:h-auto overflow-y-auto`}>
          <div className="mb-12 items-center gap-4 hidden md:flex">
            <div className="bg-[#C00000] p-3 rounded-2xl shadow-lg shadow-[#C00000]/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase">Flagstar <span className="text-[#C00000]">Bank</span></h1>
              <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase">Member Terminal</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'OVERVIEW', label: 'Vault Overview', icon: <Wallet size={20} /> },
              { id: 'TRANSFER', label: 'Global Transfer', icon: <Send size={20} /> },
              { id: 'STATEMENT', label: 'Audit Log', icon: <History size={20} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  activeTab === item.id 
                  ? 'bg-[#C00000] text-white shadow-xl shadow-[#C00000]/20' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-[#111827]'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="space-y-4 pt-8 border-t border-gray-50 mt-8">
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-2">Connection Status</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">SECURE_ACTIVE</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 text-gray-400 hover:text-[#C00000] transition-colors font-bold text-sm"
            >
              <LogOut size={20} />
              <span>Secure Sign Out</span>
            </button>
          </div>
        </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="animate-slide-up">
            <h2 className="text-4xl font-bold tracking-tight">System Access: {user?.name?.split(' ')[0]}</h2>
            <p className="text-gray-500 mt-2 font-medium">Provisioned Vault <span className="text-[#C00000] font-mono">#{user?.account_number}</span></p>
          </div>
          <div className="flex items-center gap-4 animate-slide-up">
            <button className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-[#111827] transition-all shadow-sm">
              <Bell size={20} />
            </button>
            <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
              <span className="font-black text-[#C00000] text-2xl">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-16 animate-slide-up">
            {/* Balance Card */}
            <div className="max-w-xl">
              <div className="bg-[#C00000] p-10 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(192,0,0,0.2)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                <div className="relative z-10 space-y-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-white/70 uppercase font-black tracking-[0.3em]">Total Vault Liquidity</p>
                      <h3 className="text-6xl font-black mt-4 tracking-tighter text-white">${Number(user?.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <CreditCard size={40} className="text-white/20" />
                  </div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-8">
                    <div className="font-mono text-sm tracking-[0.3em] text-white/80">
                      {user?.account_number}
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Active Node</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-4">
                  <History size={24} className="text-[#C00000]" />
                  Audit Log Summary
                </h3>
                <button onClick={() => customerAuth.logout()} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#C00000] transition-colors flex items-center gap-2">
                    <LogOut size={14} /> Terminate
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {transactions.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-[#C00000]/5 transition-all duration-500">
                    <div className="flex items-center gap-8">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${
                        txn.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#C00000]'
                      }`}>
                        {txn.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-lg tracking-tight">{txn.narration || 'Vault Transaction'}</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">{new Date(txn.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black tracking-tighter ${
                        txn.type === 'credit' ? 'text-emerald-500' : 'text-[#111827]'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}${Math.abs(Number(txn.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] uppercase font-black text-gray-300 tracking-[0.2em] mt-1 inline-block">{txn.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TRANSFER' && <TransferUI onSuccess={fetchData} />}
        {activeTab === 'STATEMENT' && <StatementView transactions={transactions} />}
      </main>
    </div>
  );
};

export default Dashboard;
