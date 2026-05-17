import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LogOut, Send, Clock, User } from 'lucide-react';
import InitiateTransfer from './InitiateTransfer';
import TransactionHistory from './TransactionHistory';

const CustomerDashboard: React.FC = () => {
  const { customer, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<'TRANSFER' | 'HISTORY' | 'PROFILE'>('TRANSFER');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-red-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold tracking-tight">Flagstar <span className="font-light">Banking</span></h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:block">Welcome, {customer?.name}</span>
              <button onClick={logout} className="p-2 hover:bg-red-800 rounded-full transition" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Available Balance</p>
            <h2 className="text-3xl font-black text-gray-900 mt-2">${customer?.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">ACC: {customer?.account_number}</p>
          </div>

          <nav className="flex md:flex-col gap-2">
            <button onClick={() => setActiveTab('TRANSFER')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'TRANSFER' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
              <Send size={18} /> Transfer
            </button>
            <button onClick={() => setActiveTab('HISTORY')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'HISTORY' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
              <Clock size={18} /> History
            </button>
            <button onClick={() => setActiveTab('PROFILE')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === 'PROFILE' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
              <User size={18} /> Profile
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'TRANSFER' && <InitiateTransfer />}
          {activeTab === 'HISTORY' && <TransactionHistory />}
          {activeTab === 'PROFILE' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-6 border-b pb-2">Profile Information</h3>
              <div className="space-y-4">
                <div><span className="text-gray-500 font-medium w-32 inline-block">Full Name</span> <span className="font-bold">{customer?.name}</span></div>
                <div><span className="text-gray-500 font-medium w-32 inline-block">Account No.</span> <span className="font-mono">{customer?.account_number}</span></div>
                <div><span className="text-gray-500 font-medium w-32 inline-block">KYC Status</span> <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">{customer?.kyc_status}</span></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
