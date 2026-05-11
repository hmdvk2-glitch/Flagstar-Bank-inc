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
  History
} from 'lucide-react';
import { Queries } from '../supabase/queries';
import TransferUI from './TransferUI';
import StatementView from './StatementView';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSFER' | 'HISTORY'>('OVERVIEW');

  const fetchData = async () => {
    const storedUser = JSON.parse(localStorage.getItem('bank_user') || '{}');
    if (storedUser.id) {
      const { data: profile } = await Queries.getProfile(storedUser.id);
      const { data: txns } = await Queries.getTransactions(storedUser.id);
      
      setUser(profile);
      setTransactions(txns || []);
      
      // Sync local storage in case balance updated
      localStorage.setItem('bank_user', JSON.stringify(profile));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bank_user');
    window.location.reload();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
      <div className="h-16 w-16 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin shadow-2xl shadow-red-600/20" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Secure Core...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#111] border-r border-white/5 flex flex-col p-8 z-20">
        <div className="mb-12 flex items-center gap-4">
          <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">Flagstar <span className="text-red-600">Bank</span></h1>
            <p className="text-[9px] text-gray-600 font-black tracking-widest uppercase">Member Node</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { id: 'OVERVIEW', label: 'Vault Overview', icon: <Wallet size={20} /> },
            { id: 'TRANSFER', label: 'Global Transfer', icon: <Send size={20} /> },
            { id: 'HISTORY', label: 'Audit Log', icon: <History size={20} /> },
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

        <div className="space-y-4 pt-8 border-t border-white/5">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-2">Security Status</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">AUTHENTICATED_SESSION</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-gray-600 hover:text-red-500 transition-colors font-bold"
          >
            <LogOut size={20} />
            <span className="text-sm">Secure Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="animate-in slide-in-from-left-4 duration-700">
            <h2 className="text-4xl font-bold tracking-tight">Welcome, {user?.full_name?.split(' ')[0]}</h2>
            <p className="text-gray-500 mt-2 font-medium">Vault Core: <span className="text-red-600 font-mono">#{user?.account_number}</span> • Fully Provisioned</p>
          </div>
          <div className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-700">
            <button className="p-4 bg-[#111] rounded-2xl border border-white/5 text-gray-400 hover:text-white transition-all shadow-xl">
              <Bell size={20} />
            </button>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-2xl shadow-red-600/30">
              <span className="font-black text-2xl">{user?.full_name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Balance Card */}
            <div className="max-w-xl">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-10 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(200,16,46,0.3)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                <div className="relative z-10 space-y-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-white/70 uppercase font-black tracking-[0.3em]">Total Available Liquidity</p>
                      <h3 className="text-6xl font-black mt-4 tracking-tighter">${Number(user?.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <CreditCard size={40} className="text-white/20" />
                  </div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-8">
                    <div className="font-mono text-sm tracking-[0.3em] text-white/80">
                      {user?.account_number}
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Recent Transactions */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-4">
                  <History size={24} className="text-red-600" />
                  Recent Terminal Activity
                </h3>
                <button 
                  onClick={() => setActiveTab('HISTORY')}
                  className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors border-b border-red-500/0 hover:border-red-500/100"
                >
                  Inspect All Records
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {transactions.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-all duration-500 shadow-xl">
                    <div className="flex items-center gap-8">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${
                        txn.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {txn.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-lg tracking-tight">{txn.narration || 'General Asset Transfer'}</p>
                        <p className="text-xs text-gray-600 mt-1 uppercase font-bold tracking-widest">{new Date(txn.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black tracking-tighter ${
                        txn.type === 'credit' ? 'text-emerald-500' : 'text-white'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}${Math.abs(Number(txn.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] uppercase font-black text-gray-800 tracking-[0.2em] mt-1 inline-block">{txn.status}</span>
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
