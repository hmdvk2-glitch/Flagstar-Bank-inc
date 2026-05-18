import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import FlagstarLogo from '../components/FlagstarLogo';
import toast from 'react-hot-toast';
import { 
  LogOut, Users, ShieldAlert, BookOpen, 
  CreditCard, Home, Landmark, PiggyBank, BarChart3, LineChart, PieChart,
  User, Send, Clock, FileText, Moon, Sun, ShieldCheck, Download, ChevronRight, 
  BadgeHelp, ExternalLink, FileSpreadsheet
} from 'lucide-react';

import CustomerWizard from '../admin/CustomerWizard';
import TransferCodeManager from '../admin/TransferCodeManager';
import TransactionLedger from '../admin/TransactionLedger';
import LeadManagement from '../admin/LeadManagement';
import TransactionReport from '../admin/TransactionReport';
import AuditLogView from '../admin/AuditLogView';

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

  // Load customer metadata from localStorage
  const customerMeta = React.useMemo(() => {
    if (!customer?.account_number) return null;
    try {
      const meta = localStorage.getItem(`flagstar_customer_metadata_${customer.account_number}`);
      if (meta) return JSON.parse(meta);
    } catch (e) {
      console.error(e);
    }
    return {
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
      ssn: 'XXX-XX-6789',
      taxNumber: 'XX-XXXX890'
    };
  }, [customer?.account_number]);
  
  // Set default tab to MYLOANS for customer, WIZARD for admin
  const [activeTab, setActiveTab] = useState<string>(() => {
    const state = useAppStore.getState();
    return state.isAdmin ? 'WIZARD' : 'MYLOANS';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Light mode matches standard portal, but allow toggle
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isAdmin) {
      await supabase.auth.signOut();
    } else {
      logout();
      navigate('/');
    }
  };

  const handleDownloadDoc = (docName: string) => {
    toast.success(`Preparing ${docName} download...`);
    setTimeout(() => {
      // Mock download triggering
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', docName);
      toast.success(`${docName} downloaded successfully!`);
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-[#001D38] text-white' : 'bg-flagstar-bg text-[#334155]'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-64 flex-shrink-0 flex flex-col border-r ${
        isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-white border-gray-100'
      }`}>
        {/* Rebranded Sidebar Header */}
        <div className="p-6 flex items-center gap-3 border-b border-inherit">
          <FlagstarLogo className="h-8 w-8" showText={false} />
          <div>
            <h1 className={`text-md font-black tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-flagstar-teal'}`}>
              flagstar
            </h1>
            <p className="text-[9px] uppercase font-bold tracking-wider text-flagstar-orange">
              {isAdmin ? 'Institutional Terminal' : 'MyLoans Client Portal'}
            </p>
          </div>
        </div>

        {/* Sidebar Tabs List */}
        <div className="px-4 py-6 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          {isCustomer && (
            <>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2.5">Mortgage Services</p>
              
              <button 
                onClick={() => setActiveTab('MYLOANS')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'MYLOANS' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home size={18} /> MyLoans Overview
              </button>

              <button 
                onClick={() => setActiveTab('TRANSFER')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'TRANSFER' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Send size={18} /> Make a Payment
              </button>

              <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'HISTORY' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Clock size={18} /> Payment Ledger
              </button>
              
              <button 
                onClick={() => setActiveTab('PROFILE')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'PROFILE' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User size={18} /> Account Dossier
              </button>

              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 pt-6 mb-2.5">Simulators</p>

              <button 
                onClick={() => setActiveTab('PRODUCTS')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'PRODUCTS' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Landmark size={18} /> Wealth Calculators
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2.5">Admin Control</p>
              
              <button 
                onClick={() => setActiveTab('WIZARD')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'WIZARD' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users size={18} /> Customer Setup
              </button>
              
              <button 
                onClick={() => setActiveTab('CODES')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'CODES' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShieldAlert size={18} /> Clearance Codes
              </button>
              
              <button 
                onClick={() => setActiveTab('LEDGER')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'LEDGER' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen size={18} /> System Ledger
              </button>
              
              <button 
                onClick={() => setActiveTab('LEADS')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'LEADS' 
                    ? 'bg-flagstar-teal text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText size={18} /> Lead Submissions
              </button>

              <button 
                onClick={() => setActiveTab('REPORTS')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'REPORTS' 
                    ? 'bg-[#F15A24] text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileSpreadsheet size={18} className="text-[#FFB81C]" /> Transaction Reports
              </button>

              <button 
                onClick={() => setActiveTab('AUDITS')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'AUDITS' 
                    ? 'bg-[#F15A24] text-white shadow-md' 
                    : isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck size={18} className="text-[#FFB81C]" /> Compliance Audits
              </button>
            </>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-inherit space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 border rounded-xl text-xs font-bold transition-colors ${
              isDarkMode ? 'border-[#004B5C] hover:bg-white/5 text-gray-200' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            Toggle Appearance
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600/10 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold text-red-500 transition-all active:scale-95"
          >
            <LogOut size={14} /> Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Main Viewport Header */}
        <header className={`px-8 py-4 border-b flex justify-between items-center ${
          isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            {isCustomer && customerMeta && (
              <img 
                src={customerMeta.photoUrl} 
                alt={customer?.name}
                className="w-10 h-10 rounded-full object-cover border border-flagstar-teal/30 shadow-sm"
              />
            )}
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-flagstar-teal-dark'}`}>
                {isAdmin ? 'Administrative Dashboard Terminal' : 'Mortgage Portfolio Management'}
              </h2>
              
              {isCustomer && (
                <div className="flex gap-4 mt-2.5 text-xs font-bold border-t border-gray-100/10 pt-2">
                  <button 
                    onClick={() => setActiveTab('MYLOANS')}
                    className={`pb-1 border-b-2 transition ${activeTab === 'MYLOANS' ? 'border-[#F15A24] text-[#F15A24]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('TRANSFER')}
                    className={`pb-1 border-b-2 transition ${activeTab === 'TRANSFER' ? 'border-[#F15A24] text-[#F15A24]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >
                    Transfer Checkpoint
                  </button>
                  <button 
                    onClick={() => setActiveTab('HISTORY')}
                    className={`pb-1 border-b-2 transition ${activeTab === 'HISTORY' ? 'border-[#F15A24] text-[#F15A24]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >
                    Ledger Statements
                  </button>
                  <button 
                    onClick={() => setActiveTab('PROFILE')}
                    className={`pb-1 border-b-2 transition ${activeTab === 'PROFILE' ? 'border-[#F15A24] text-[#F15A24]' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >
                    Portfolio Dossier
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {isCustomer && (
            <div className={`px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider ${
              isDarkMode ? 'bg-emerald-950/50 border border-emerald-500/20 text-[#D2FF3D]' : 'bg-emerald-50 text-flagstar-green'
            }`}>
              <ShieldCheck size={14} />
              AutoPay Draft Active
            </div>
          )}
        </header>

        {/* Dynamic Viewport Panel Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* A. MYLOANS tab (Pixel-perfect replicated customer dashboard) */}
          {activeTab === 'MYLOANS' && isCustomer && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Alert Ribbon */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                isDarkMode ? 'bg-blue-950/20 border-blue-500/20 text-blue-200' : 'bg-blue-50/50 border-blue-100 text-flagstar-teal-dark'
              }`}>
                <div className="flex items-center gap-2.5">
                  <BadgeHelp size={16} className="text-flagstar-orange" />
                  <span>Go Paperless! Opt-in to receive e-Statements and stop paper delivery. View, save or print your bills.</span>
                </div>
                <button 
                  onClick={() => toast.success("Paperless delivery preferences updated successfully!")}
                  className="px-3.5 py-1.5 bg-flagstar-teal text-white rounded-full font-bold text-[10px] uppercase tracking-wider hover:bg-flagstar-teal-dark transition active:scale-95 shadow-sm"
                >
                  Go Paperless
                </button>
              </div>

              <div>
                <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004B5C]'}`}>
                  MyLoans Portal Summary
                </h3>
                <p className="text-xs text-gray-400 mt-1">Review active amortization, balances, escrow ledgers, and download secure bills.</p>
              </div>

              {/* 3 Summary Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Mortgage Loan Balance Card */}
                <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-white border-gray-100'
                }`}>
                  <div>
                    <h4 className="text-xs text-gray-400 font-black uppercase tracking-wider mb-4">Mortgage Loan Details</h4>
                    <p className="text-[10px] font-bold text-gray-400">Current Principal Balance</p>
                    <p className="text-3xl font-black text-[#F15A24] mt-1">
                      $248,500.00
                    </p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-semibold text-gray-500 mt-6 border-t border-dashed border-gray-100 pt-4">
                      <span>Original Loan:</span>
                      <span className={`text-right font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>$300,000.00</span>
                      <span>Interest Rate:</span>
                      <span className={`text-right font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>6.25% Fixed</span>
                      <span>Maturity Date:</span>
                      <span className={`text-right font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>May 01, 2056</span>
                    </div>
                  </div>
                </div>

                {/* 2. Escrow Summary Card */}
                <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-white border-gray-100'
                }`}>
                  <div>
                    <h4 className="text-xs text-gray-400 font-black uppercase tracking-wider mb-4">Escrow & Disbursals</h4>
                    <p className="text-[10px] font-bold text-gray-400">Escrow Account Balance</p>
                    <p className="text-3xl font-black text-[#F15A24] mt-1">
                      $4,850.00
                    </p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-semibold text-gray-500 mt-6 border-t border-dashed border-gray-100 pt-4">
                      <span>Home Insurance YTD:</span>
                      <span className={`text-right font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>$1,200.00</span>
                      <span>Property Taxes YTD:</span>
                      <span className={`text-right font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>$3,600.00</span>
                      <span>Last Analysis Date:</span>
                      <span className={`text-right font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Jan 15, 2026</span>
                    </div>
                  </div>
                </div>

                {/* 3. Next Payment Details Card */}
                <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-white border-gray-100'
                }`}>
                  <div>
                    <h4 className="text-xs text-gray-400 font-black uppercase tracking-wider mb-4">Amortization Due</h4>
                    <p className="text-[10px] font-bold text-gray-400">Monthly Payment Amount</p>
                    <p className="text-3xl font-black text-[#F15A24] mt-1">
                      $1,532.40
                    </p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-semibold text-gray-500 mt-6 border-t border-dashed border-gray-100 pt-4">
                      <span>Payment Due Date:</span>
                      <span className={`text-right font-mono font-bold text-[#F15A24]`}>June 01, 2026</span>
                      <span>AutoPay Status:</span>
                      <span className={`text-right font-bold text-flagstar-green flex items-center justify-end gap-1`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-flagstar-green" /> Enabled
                      </span>
                      <span>Grace Period:</span>
                      <span className={`text-right font-semibold text-gray-400`}>Until June 16</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                
                <button 
                  onClick={() => setActiveTab('TRANSFER')}
                  className="p-5 bg-[#F15A24] hover:bg-[#D9431E] text-white rounded-2xl font-bold flex items-center justify-between shadow transition duration-200 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black tracking-wider opacity-90">Instant Payment</p>
                    <p className="text-base font-black">Make a Payment Online</p>
                  </div>
                  <Send size={20} />
                </button>

                <button 
                  onClick={() => setActiveTab('HISTORY')}
                  className="p-5 bg-flagstar-teal hover:bg-flagstar-teal-dark text-white rounded-2xl font-bold flex items-center justify-between shadow transition duration-200 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black tracking-wider opacity-90">Document History</p>
                    <p className="text-base font-black">View e-Statements & History</p>
                  </div>
                  <Clock size={20} />
                </button>

                <button 
                  onClick={() => setActiveTab('PROFILE')}
                  className="p-5 bg-flagstar-slate hover:bg-[#003B49] text-white rounded-2xl font-bold flex items-center justify-between shadow transition duration-200 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black tracking-wider opacity-90">Institutional Dossier</p>
                    <p className="text-base font-black">Manage Mortgage Profile</p>
                  </div>
                  <User size={20} />
                </button>

              </div>

              {/* e-Statements and Tax Center Document List */}
              <div className={`p-8 rounded-3xl border shadow-sm space-y-6 ${
                isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-white border-gray-100'
              }`}>
                <div className="flex justify-between items-center border-b border-dashed border-gray-100 pb-4">
                  <div>
                    <h4 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-flagstar-teal-dark'}`}>
                      e-Statements & Tax Documents Center
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">Click any document to securely download the high-definition billing summary.</p>
                  </div>
                  
                  <span className="text-[10px] font-black uppercase text-flagstar-orange tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-flagstar-green" /> Authenticated Safe-Link
                  </span>
                </div>

                <div className="divide-y divide-gray-100/50">
                  
                  {/* May Statement */}
                  <div className="py-4 flex justify-between items-center hover:bg-gray-50/50 transition px-2 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Mortgage Billing Statement - May 2026</p>
                        <p className="text-xs text-gray-400">Available Date: May 12, 2026 • Billing Cycle 05</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadDoc("mortgage_statement_may_2026.pdf")}
                      className="p-2.5 hover:bg-gray-100 text-flagstar-teal hover:text-flagstar-teal-dark rounded-full transition"
                      title="Download Statement"
                    >
                      <Download size={18} />
                    </button>
                  </div>

                  {/* April Statement */}
                  <div className="py-4 flex justify-between items-center hover:bg-gray-50/50 transition px-2 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Mortgage Billing Statement - April 2026</p>
                        <p className="text-xs text-gray-400">Available Date: Apr 12, 2026 • Billing Cycle 04</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadDoc("mortgage_statement_april_2026.pdf")}
                      className="p-2.5 hover:bg-gray-100 text-flagstar-teal hover:text-flagstar-teal-dark rounded-full transition"
                    >
                      <Download size={18} />
                    </button>
                  </div>

                  {/* March Statement */}
                  <div className="py-4 flex justify-between items-center hover:bg-gray-50/50 transition px-2 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Mortgage Billing Statement - March 2026</p>
                        <p className="text-xs text-gray-400">Available Date: Mar 12, 2026 • Billing Cycle 03</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadDoc("mortgage_statement_march_2026.pdf")}
                      className="p-2.5 hover:bg-gray-100 text-flagstar-teal hover:text-flagstar-teal-dark rounded-full transition"
                    >
                      <Download size={18} />
                    </button>
                  </div>

                  {/* Form 1098 */}
                  <div className="py-4 flex justify-between items-center hover:bg-gray-50/50 transition px-2 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                        <Landmark size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Form 1098 - Annual Mortgage Interest Statement (2025)</p>
                        <p className="text-xs text-gray-400">Available Date: Jan 22, 2026 • Federal Tax Filing Center</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadDoc("form_1098_annual_tax_statement_2025.pdf")}
                      className="p-2.5 hover:bg-gray-100 text-flagstar-teal hover:text-flagstar-teal-dark rounded-full transition"
                    >
                      <Download size={18} />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* B. PRODUCTS tab (List of 7 product funnels for simulation) */}
          {activeTab === 'PRODUCTS' && isCustomer && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-flagstar-teal'}`}>
                  Interactive Wealth & Credit Portals
                </h3>
                <p className="text-xs text-gray-500 mt-1">Select and calculate parameters for dynamic pre-approvals or wealth simulations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {FUNNELS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div 
                      key={f.id}
                      onClick={() => navigate(`/funnel/${f.id}`)}
                      className={`group cursor-pointer rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex flex-col h-full ${
                        isDarkMode ? 'bg-[#002D38] border-[#003B49] hover:border-flagstar-orange/50' : 'bg-white border-gray-100 hover:border-flagstar-orange/20 shadow-sm'
                      }`}
                    >
                      <div className="h-40 relative overflow-hidden">
                        <img 
                          src={f.img} 
                          alt={f.name}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                          <div className="p-1.5 bg-flagstar-orange rounded-lg">
                            <Icon size={14} />
                          </div>
                          <span className="font-extrabold text-xs tracking-wide">{f.name}</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">{f.desc}</p>
                        <span className="text-[9px] font-black uppercase text-flagstar-orange tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Launch Calculator <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. TRANSFER tab (Initiate transfer with security codes) */}
          {activeTab === 'TRANSFER' && isCustomer && <InitiateTransfer isDarkMode={isDarkMode} />}
          
          {/* D. HISTORY tab (Completed transaction histories) */}
          {activeTab === 'HISTORY' && isCustomer && <TransactionHistory />}
          
          {/* E. PROFILE tab (Client details) */}
          {activeTab === 'PROFILE' && isCustomer && (
            <div className={`p-8 rounded-3xl shadow-lg border max-w-xl animate-fadeIn ${
              isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-white border-gray-100 shadow-md'
            }`}>
              <div className="flex items-center gap-5 border-b pb-6 mb-6 border-gray-100/30">
                <img 
                  src={customerMeta?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'} 
                  alt={customer?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#F15A24] shadow-md"
                />
                <div>
                  <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004B5C]'}`}>
                    {customer?.name}
                  </h3>
                  <p className="text-xs text-[#F15A24] font-black uppercase tracking-wider mt-0.5">
                    Premium Amortized Member
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    Account: FL-100200 • ID: {customer?.id.substring(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100/30">
                  <span className="text-gray-400 font-medium w-36">Full Name</span> 
                  <span className={`font-bold text-right ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{customer?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/30">
                  <span className="text-gray-400 font-medium w-36">Account Number</span> 
                  <span className={`font-mono font-bold text-right ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>FL-100200</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/30">
                  <span className="text-gray-400 font-medium w-36">Social Security (SSI/SSN)</span> 
                  <span className={`font-bold text-right font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{customerMeta?.ssn || 'XXX-XX-6789'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/30">
                  <span className="text-gray-400 font-medium w-36">Tax Identification No.</span> 
                  <span className={`font-bold text-right font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{customerMeta?.taxNumber || 'XX-XXXX890'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/30">
                  <span className="text-gray-400 font-medium w-36">Escrow Draft Code</span> 
                  <span className="font-mono text-gray-400 text-right">{customer?.account_number}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/30">
                  <span className="text-gray-400 font-medium w-36">Deposit Balance</span> 
                  <span className="font-bold text-right text-flagstar-green">${customer?.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/30">
                  <span className="text-gray-400 font-medium w-36">KYC Status</span> 
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-flagstar-green rounded-full text-xs font-black text-right flex items-center gap-1">
                    <ShieldCheck size={12} /> {customer?.kyc_status}
                  </span>
                </div>

                {/* Clearance Checkpoints Panel */}
                <div className="mt-6 pt-4 border-t border-dashed border-gray-100/30 space-y-3">
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-[#004B5C]'}`}>
                    Institutional Clearance Checkpoints
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-[11px] font-bold">
                    <div className="p-3 bg-[#F15A24] text-white rounded-xl border border-[#F15A24]/30 flex flex-col items-center justify-center gap-1 shadow-md">
                      <ShieldCheck size={16} className="text-[#FFB81C]" />
                      <span>COT Check</span>
                      <span className="text-[9px] font-black text-[#FFB81C] uppercase">APPROVED</span>
                    </div>

                    <div className="p-3 bg-[#F15A24] text-white rounded-xl border border-[#F15A24]/30 flex flex-col items-center justify-center gap-1 shadow-md">
                      <ShieldCheck size={16} className="text-[#FFB81C]" />
                      <span>TAX Check</span>
                      <span className="text-[9px] font-black text-[#FFB81C] uppercase">APPROVED</span>
                    </div>

                    <div className="p-3 bg-[#F15A24] text-white rounded-xl border border-[#F15A24]/30 flex flex-col items-center justify-center gap-1 shadow-md">
                      <ShieldCheck size={16} className="text-[#FFB81C]" />
                      <span>IRS Check</span>
                      <span className="text-[9px] font-black text-[#FFB81C] uppercase">PASSED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* F. ADMIN TABS (Only loaded for verified admin sessions) */}
          {activeTab === 'WIZARD' && isAdmin && <CustomerWizard isDarkMode={isDarkMode} />}
          {activeTab === 'CODES' && isAdmin && <TransferCodeManager isDarkMode={isDarkMode} />}
          {activeTab === 'LEDGER' && isAdmin && <TransactionLedger isDarkMode={isDarkMode} />}
          {activeTab === 'LEADS' && isAdmin && <LeadManagement isDarkMode={isDarkMode} />}
          {activeTab === 'REPORTS' && isAdmin && <TransactionReport isDarkMode={isDarkMode} />}
          {activeTab === 'AUDITS' && isAdmin && <AuditLogView isDarkMode={isDarkMode} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
