import React, { useState } from 'react';
import { 
  Users, 
  RefreshCcw, 
  Key, 
  Database, 
  Shield, 
  LogOut,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import AccountManager from './AccountManager';
import TransactionPanel from './TransactionPanel';
import CodeGenerator from './CodeGenerator';
import LedgerViewer from './LedgerViewer';

type AdminModule = 'DASHBOARD' | 'ACCOUNTS' | 'TRANSACTIONS' | 'CODES' | 'LEDGER';

const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<AdminModule>('DASHBOARD');

  const navItems = [
    { id: 'DASHBOARD', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'ACCOUNTS', label: 'Account Manager', icon: <Users size={20} /> },
    { id: 'TRANSACTIONS', label: 'Transaction Engine', icon: <RefreshCcw size={20} /> },
    { id: 'CODES', label: 'Security Codes', icon: <Key size={20} /> },
    { id: 'LEDGER', label: 'Ledger Audit', icon: <Database size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Shield className="text-red-600" size={24} />
          <span className="font-bold text-lg tracking-tight">ADMIN<span className="text-red-600">SHIELD</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as AdminModule)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                activeModule === item.id 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {activeModule === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => window.location.hash = '#/'}
            className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Exit Admin Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#111]">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-semibold">
            {navItems.find(i => i.id === activeModule)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">System Status</p>
              <p className="text-xs text-emerald-500 font-mono">DETERMINISTIC_ACTIVE</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        <div className="p-8">
          {activeModule === 'DASHBOARD' && <AdminOverview />}
          {activeModule === 'ACCOUNTS' && <AccountManager />}
          {activeModule === 'TRANSACTIONS' && <TransactionPanel />}
          {activeModule === 'CODES' && <CodeGenerator />}
          {activeModule === 'LEDGER' && <LedgerViewer />}
        </div>
      </main>
    </div>
  );
};

const AdminOverview: React.FC = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Active Users', value: '1,284', change: '+12%', color: 'border-blue-500' },
        { label: 'Total Deposits', value: '$42.8M', change: '+$2.4M', color: 'border-emerald-500' },
        { label: 'Pending COT', value: '18', change: '-4', color: 'border-amber-500' },
        { label: 'Security Alerts', value: '0', change: 'Stable', color: 'border-red-500' },
      ].map((stat, i) => (
        <div key={i} className={`bg-[#161616] p-6 rounded-2xl border-l-4 ${stat.color} shadow-xl`}>
          <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
          <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-gray-500'}`}>
            {stat.change} since last 24h
          </p>
        </div>
      ))}
    </div>

    <div className="bg-[#161616] p-8 rounded-2xl border border-white/5 shadow-2xl">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Shield size={20} className="text-red-600" />
        System Integrity Monitor
      </h3>
      <div className="space-y-4">
        {[
          { label: 'Supabase Sync', status: 'Healthy', time: '2ms' },
          { label: 'Ledger Immutability', status: 'Verified', time: 'Active' },
          { label: 'Encryption Layer', status: 'AES-256', time: 'Normal' },
          { label: 'State Machine', status: 'Deterministic', time: 'LOCKED' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <span className="text-gray-300">{item.label}</span>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-500">{item.time}</span>
              <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminDashboard;
