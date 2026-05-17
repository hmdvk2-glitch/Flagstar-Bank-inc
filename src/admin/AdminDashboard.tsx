import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../supabase/client';
import { LogOut, Users, ShieldAlert, BookOpen } from 'lucide-react';

import CustomerWizard from './CustomerWizard';
import TransferCodeManager from './TransferCodeManager';
import TransactionLedger from './TransactionLedger';

const AdminDashboard: React.FC = () => {
  const { admin, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<'WIZARD' | 'CODES' | 'LEDGER'>('WIZARD');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // the auth state change listener in App.tsx will call logout()
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-500 tracking-wider">FLAGSTAR ADMIN</h2>
          <p className="text-sm text-gray-400 mt-1">{admin?.name}</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('WIZARD')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'WIZARD' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <Users size={18} /> Setup Wizard
          </button>
          <button 
            onClick={() => setActiveTab('CODES')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'CODES' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <ShieldAlert size={18} /> Transfer Codes
          </button>
          <button 
            onClick={() => setActiveTab('LEDGER')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'LEDGER' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <BookOpen size={18} /> Ledger
          </button>
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'WIZARD' && <CustomerWizard />}
        {activeTab === 'CODES' && <TransferCodeManager />}
        {activeTab === 'LEDGER' && <TransactionLedger />}
      </div>
    </div>
  );
};

export default AdminDashboard;
