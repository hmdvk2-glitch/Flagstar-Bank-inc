import React, { useState, useEffect } from 'react';
import { 
  Users, 
  RefreshCcw, 
  Key, 
  Database, 
  Shield, 
  LogOut,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  History
} from 'lucide-react';

import AdminShield from './AdminShield';
import CreateCustomerForm from './CreateCustomerForm';
import TransactionPanel from './TransactionPanel';
import CodeGenerator from './CodeGenerator';
import AuditViewer from './AuditViewer';
import { Queries } from '../supabase/queries';

type AdminModule = 'DASHBOARD' | 'ACCOUNTS' | 'TRANSACTIONS' | 'CODES' | 'AUDIT';

const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<AdminModule>('DASHBOARD');
  const [systemStatus, setSystemStatus] = useState('SYNCING');

  useEffect(() => {
    // Simulation of system check
    const timer = setTimeout(() => setSystemStatus('DETERMINISTIC_LOCKED'), 1000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { id: 'DASHBOARD', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'ACCOUNTS', label: 'Provisioning', icon: <Users size={20} /> },
    { id: 'TRANSACTIONS', label: 'Orchestration', icon: <RefreshCcw size={20} /> },
    { id: 'CODES', label: 'Security Buffer', icon: <Key size={20} /> },
    { id: 'AUDIT', label: 'Immutable Audit', icon: <History size={20} /> },
  ];

  return (
    <AdminShield>
      <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#111] border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Shield className="text-red-600" size={24} />
            <span className="font-bold text-lg tracking-tight uppercase">Flagstar <span className="text-red-600">Admin</span></span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as AdminModule)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
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
              <span className="font-medium text-sm">Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
          <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">
              {navItems.find(i => i.id === activeModule)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-gray-600 uppercase font-bold">Protocol</p>
                <p className="text-[10px] text-emerald-500 font-mono font-bold tracking-tighter">{systemStatus}</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </header>

          <div className="p-10 max-w-7xl mx-auto">
            {activeModule === 'DASHBOARD' && <AdminOverview />}
            {activeModule === 'ACCOUNTS' && <CreateCustomerForm />}
            {activeModule === 'TRANSACTIONS' && <TransactionPanel />}
            {activeModule === 'CODES' && <CodeGenerator />}
            {activeModule === 'AUDIT' && <AuditViewer />}
          </div>
        </main>
      </div>
    </AdminShield>
  );
};

const AdminOverview: React.FC = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Active Vaults', value: '2,841', status: 'Optimal' },
        { label: 'Net Liquidity', value: '$124.5M', status: '+2.4%' },
        { label: 'Pending COT', value: '14', status: 'Urgent' },
        { label: 'System Health', value: '99.9%', status: 'Stable' },
      ].map((stat, i) => (
        <div key={i} className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full -mr-8 -mt-8 group-hover:bg-red-600/10 transition-all" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
          <p className="text-3xl font-bold mt-2 tracking-tighter">{stat.value}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase">{stat.status}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
          <ShieldCheck size={20} className="text-red-600" />
          Core Execution Monitoring
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Deterministic State Engine', val: 'LOCKED', color: 'text-emerald-500' },
            { label: 'Cross-Border COT Validation', val: 'ENFORCED', color: 'text-emerald-500' },
            { label: 'IRS Tax Compliance Layer', val: 'ACTIVE', color: 'text-emerald-500' },
            { label: 'Ledger Immutability Check', val: 'VERIFIED', color: 'text-emerald-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
              <span className="text-sm text-gray-400 font-medium">{item.label}</span>
              <span className={`text-[10px] font-black tracking-widest ${item.color}`}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-600/5 p-8 rounded-3xl border border-red-600/20 shadow-2xl flex flex-col justify-between">
        <div>
          <Shield size={32} className="text-red-600 mb-6" />
          <h3 className="text-xl font-bold mb-4">Admin Authority</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Administrative actions are executed through high-privilege Edge Functions. 
            All system mutations are recorded in the immutable audit ledger for compliance verification.
          </p>
        </div>
        <button className="mt-8 w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-bold text-sm shadow-xl shadow-red-600/20 transition-all">
          Generate Authority Report
        </button>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
