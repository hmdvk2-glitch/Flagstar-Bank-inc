import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { 
  Building, LogOut, Users, ShieldAlert, BookOpen, 
  CreditCard, Home, Landmark, PiggyBank, BarChart3, LineChart, PieChart,
  User, Send, Clock, FileText, Moon, Sun
} from 'lucide-react';

import CustomerWizard from '../admin/CustomerWizard';
import TransferCodeManager from '../admin/TransferCodeManager';
import TransactionLedger from '../admin/TransactionLedger';
import LeadManagement from '../admin/LeadManagement'; // New component to inspect funnel leads

import InitiateTransfer from '../customer/InitiateTransfer';
import TransactionHistory from '../customer/TransactionHistory';

// Cards data
export const FUNNELS = [
  { id: 'credit-cards', name: 'Credit Cards', desc: 'Premium rewards, up to 5% cash back.', img: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=800&q=80', icon: CreditCard },
  { id: 'mortgages', name: 'Mortgages', desc: 'Secure custom home loan fixed rates.', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', icon: Home },
  { id: 'loans', name: 'Loans', desc: 'Personal & Auto credit capital.', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', icon: Landmark },
  { id: 'savings', name: 'Savings Vault', desc: 'Maximize yields at 4.50% APY.', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80', icon: PiggyBank },
  { id: 'interest', name: 'Interest Rates', desc: 'Fixed vs Variable index calculations.', img: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80', icon: BarChart3 },
  { id: 'growth-bonds', name: 'Growth Bonds', desc: 'AA-rated government coupon assets.', img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', icon: LineChart },
  { id: 'investments', name: 'Capital Wealth', desc: 'Diversify dynamic risk-managed portfolios.', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', icon: PieChart }
];

const Dashboard: React.FC = () => {
  const { admin, customer, isAdmin, isCustomer, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('PRODUCTS');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isAdmin) {
      await supabase.auth.signOut();
    } else {
      logout();
      navigate('/');
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-64 flex-shrink-0 flex flex-col border-r ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-inherit">
          <Building className="h-8 w-8 text-red-600 animate-pulse" />
          <div>
            <h1 className="text-lg font-black tracking-tight">FLAGSTAR</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-500">Institutional</p>
          </div>
        </div>

        <div className="px-4 py-4 flex-1 space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-2">Banking Services</p>
          
          <button 
            onClick={() => setActiveTab('PRODUCTS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'PRODUCTS' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
          >
            <Landmark size={18} /> Financial Products
          </button>

          {isCustomer && (
            <>
              <button 
                onClick={() => setActiveTab('TRANSFER')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'TRANSFER' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
              >
                <Send size={18} /> Initiate Transfer
              </button>
              <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'HISTORY' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
              >
                <Clock size={18} /> Transfer Ledger
              </button>
              <button 
                onClick={() => setActiveTab('PROFILE')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'PROFILE' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
              >
                <User size={18} /> Client Profile
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mt-6 mb-2">Admin Core</p>
              <button 
                onClick={() => setActiveTab('WIZARD')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'WIZARD' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
              >
                <Users size={18} /> Customer Setup
              </button>
              <button 
                onClick={() => setActiveTab('CODES')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'CODES' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
              >
                <ShieldAlert size={18} /> Transfer Codes
              </button>
              <button 
                onClick={() => setActiveTab('LEDGER')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'LEDGER' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
              >
                <BookOpen size={18} /> Global Ledger
              </button>
              <button 
                onClick={() => setActiveTab('LEADS')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'LEADS' ? 'bg-red-600 text-white' : 'hover:bg-inherit/10'}`}
              >
                <FileText size={18} /> Lead Submissions
              </button>
            </>
          )}
        </div>

        {/* Footer controls inside sidebar */}
        <div className="p-4 border-t border-inherit space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-center gap-2 py-2 border border-inherit rounded-lg text-xs font-bold transition hover:bg-inherit/10"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            Toggle Appearance
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 bg-red-700/10 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-500 transition"
          >
            <LogOut size={14} /> Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header containing details */}
        <header className={`px-8 py-4 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {isAdmin ? 'Administrative Terminal' : `Wealth Portal: ${customer?.name}`}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {isAdmin ? `Session User: ${admin?.email}` : `Acc No: ${customer?.account_number} • Bal: $${customer?.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
            </p>
          </div>
          
          {isCustomer && (
            <div className={`px-4 py-2 border border-inherit rounded-xl hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-wider`}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              KYC Verified
            </div>
          )}
        </header>

        {/* Dynamic Inner Panel Viewport */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'PRODUCTS' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Interactive Product Portals</h3>
                <p className="text-xs text-gray-500 mt-1">Select and calculate real-time capital parameters for dynamic loan pre-approvals or wealth simulations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {FUNNELS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div 
                      key={f.id}
                      onClick={() => navigate(`/funnel/${f.id}`)}
                      className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full ${isDarkMode ? 'bg-gray-900/60 border-gray-800 hover:border-red-600/50' : 'bg-white border-gray-100 hover:border-red-600/20 shadow-sm'}`}
                    >
                      <div className="h-44 relative overflow-hidden">
                        <img 
                          src={f.img} 
                          alt={f.name}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                          <div className="p-2 bg-red-600 rounded-lg">
                            <Icon size={16} />
                          </div>
                          <span className="font-extrabold text-sm tracking-wide">{f.name}</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">{f.desc}</p>
                        <span className="text-[10px] font-black uppercase text-red-500 tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Launch Calculator &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'TRANSFER' && <InitiateTransfer />}
          {activeTab === 'HISTORY' && <TransactionHistory />}
          {activeTab === 'PROFILE' && (
            <div className={`p-8 rounded-xl shadow-lg border max-w-xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-xl font-bold mb-6 border-b pb-2">Client Dossier</h3>
              <div className="space-y-4">
                <div><span className="text-gray-500 font-medium w-32 inline-block">Full Name</span> <span className="font-bold">{customer?.name}</span></div>
                <div><span className="text-gray-500 font-medium w-32 inline-block">Account No.</span> <span className="font-mono">{customer?.account_number}</span></div>
                <div><span className="text-gray-500 font-medium w-32 inline-block">KYC Status</span> <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">{customer?.kyc_status}</span></div>
              </div>
            </div>
          )}

          {/* Admin panel components */}
          {activeTab === 'WIZARD' && <CustomerWizard />}
          {activeTab === 'CODES' && <TransferCodeManager />}
          {activeTab === 'LEDGER' && <TransactionLedger />}
          {activeTab === 'LEADS' && <LeadManagement />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
