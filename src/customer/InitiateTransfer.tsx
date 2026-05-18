import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTransferCode } from '../services/customerService';
import { supabase } from '../supabase/client';
import { logClearanceAttempt, logTransferAttempt } from '../utils/auditLog';
import toast from 'react-hot-toast';
import { triggerConfetti } from '../utils/confetti';
import { 
  ShieldCheck, ArrowRight, Lock, CreditCard, Landmark, Coins, 
  AlertCircle, CheckCircle2, XCircle, Info, RefreshCw, HelpCircle
} from 'lucide-react';

interface InitiateTransferProps {
  isDarkMode?: boolean;
}

const InitiateTransfer: React.FC<InitiateTransferProps> = ({ isDarkMode = true }) => {
  const { customer } = useAppStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Clearance Gate States
  const [cotInput, setCotInput] = useState('');
  const [taxInput, setTaxInput] = useState('');
  const [irsInput, setIrsInput] = useState('');

  const [cotSuccess, setCotSuccess] = useState(false);
  const [taxSuccess, setTaxSuccess] = useState(false);
  const [irsSuccess, setIrsSuccess] = useState(false);
  
  const [progress, setProgress] = useState(0);

  // Database Clearance Code
  const [validatedCode, setValidatedCode] = useState<any>(null);

  // Transfer Fields
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');

  // Active hover tooltips state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Load customer metadata from localStorage
  const customerMeta = React.useMemo(() => {
    if (!customer?.account_number) return null;
    try {
      const meta = localStorage.getItem(`flagstar_customer_metadata_${customer.account_number}`);
      if (meta) return JSON.parse(meta);
    } catch (e) {
      console.error('Error parsing customer metadata:', e);
    }
    return null;
  }, [customer?.account_number]);

  const expectedCot = (customerMeta?.cot_code || '1234').toString().trim();
  const expectedTax = (customerMeta?.tax_code || 'TAX-OK').toString().trim();
  const expectedIrs = (customerMeta?.irs_code || 'IRS-OK').toString().trim();

  // Section Validations
  const handleVerifyCot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const isMatch = cotInput.trim() === expectedCot;
    logClearanceAttempt(customer.id, customer.name, 'COT', cotInput, isMatch);

    if (isMatch) {
      setCotSuccess(true);
      setProgress(33);
      toast.success('COT Checkpoint Verified Successfully');
      triggerConfetti();
    } else {
      toast.error('Invalid Cost of Transfer (COT) Code');
    }
  };

  const handleVerifyTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    // Case-insensitive match
    const isMatch = taxInput.trim().toLowerCase() === expectedTax.toLowerCase();
    logClearanceAttempt(customer.id, customer.name, 'TAX', taxInput, isMatch);

    if (isMatch) {
      setTaxSuccess(true);
      setProgress(66);
      toast.success('TAX Checkpoint Verified Successfully');
      triggerConfetti();
    } else {
      toast.error('Invalid Revenue Tax (TAX) Code');
    }
  };

  const handleVerifyIrs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    // Case-insensitive match
    const isMatch = irsInput.trim().toLowerCase() === expectedIrs.toLowerCase();
    logClearanceAttempt(customer.id, customer.name, 'IRS', irsInput, isMatch);

    if (isMatch) {
      setIrsSuccess(true);
      setProgress(100);
      toast.success('IRS Checkpoint Verified Successfully');
      triggerConfetti();
    } else {
      toast.error('Invalid Federal Compliance (IRS) Code');
    }
  };

  // Fetch or setup database transfer code dynamically once gateway is cleared
  const handleAccessGateway = async () => {
    if (!customer?.id) return;
    setLoading(true);
    try {
      const { data: codes, error } = await supabase
        .from('transfer_codes')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (codes && codes.length > 0) {
        setValidatedCode(codes[0]);
        toast.success('Secure Amortization Tunnel Decrypted');
        setStep(2);
      } else {
        // Fallback: create active database transfer code on the fly
        const { data: newCode, error: insertError } = await supabase
          .from('transfer_codes')
          .insert({
            customer_id: customer.id,
            cot_code: expectedCot,
            tax_code: expectedTax,
            irs_code: expectedIrs,
            status: 'ACTIVE',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setValidatedCode(newCode);
        toast.success('Secure Compliance Amortization Tunnel Generated');
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gateway decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!toAccount || !amount || !narration) {
      toast.error('Please specify all payment parameters');
      return;
    }
    setStep(3);
  };

  const handleExecute = async () => {
    if (!customer?.id || !validatedCode) return;
    setLoading(true);
    
    const amountVal = parseFloat(amount);
    
    try {
      await useTransferCode(
        customer.id,
        validatedCode.id,
        toAccount,
        amountVal,
        narration
      );
      
      // Log successful transfer attempt
      logTransferAttempt(customer.id, customer.name, amountVal, toAccount, true);
      toast.success('Amortization transfer initiated successfully!');
      triggerConfetti();
      setStep(4);
    } catch (err: any) {
      // Log failed transfer attempt
      logTransferAttempt(customer.id, customer.name, amountVal, toAccount, false);
      toast.error(err.message || 'Transfer failed due to administrative clearance');
    } finally {
      setLoading(false);
    }
  };

  const resetGateway = () => {
    setStep(1);
    setLoading(false);
    setCotInput('');
    setTaxInput('');
    setIrsInput('');
    setCotSuccess(false);
    setTaxSuccess(false);
    setIrsSuccess(false);
    setProgress(0);
    setValidatedCode(null);
    setToAccount('');
    setAmount('');
    setNarration('');
  };

  // Luxury color settings
  const glassBg = isDarkMode 
    ? 'backdrop-blur-md bg-[#002D38]/80 border-[#003B49]/50 shadow-[0_0_30px_rgba(241,90,36,0.1)]' 
    : 'backdrop-blur-md bg-white/85 border-[#F15A24]/10 shadow-[0_0_20px_rgba(0,0,0,0.05)]';
  const textColor = isDarkMode ? 'text-white' : 'text-[#004B5C]';
  const inputBg = isDarkMode ? 'bg-[#001D24]/80' : 'bg-gray-50';
  const labelColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBorder = isDarkMode ? 'border-gray-800 focus:border-[#F15A24]/60' : 'border-gray-200 focus:border-[#F15A24]/40';

  return (
    <div className={`rounded-3xl border overflow-hidden transition-all duration-300 max-w-2xl mx-auto ${glassBg}`}>
      {/* CSS Keyframes for Shimmer Gradient Progress Bar */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #F15A24 25%, #FFB81C 50%, #F15A24 75%);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite linear;
        }
      `}</style>

      {/* Header Panel */}
      <div className={`px-8 py-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-800/60' : 'border-gray-150'}`}>
        <div>
          <h3 className={`text-lg font-black tracking-tight ${textColor}`}>Secure Transfer Clearance</h3>
          <p className={`text-xs ${labelColor} mt-0.5`}>Clear sequential compliance barriers to unlock the amortization ledger.</p>
        </div>
        <span className="text-[10px] font-black uppercase text-[#F15A24] bg-[#F15A24]/10 border border-[#F15A24]/20 px-3.5 py-1.5 rounded-full select-none">
          Step {step} of 4
        </span>
      </div>

      <div className="p-8">
        
        {/* Step 1: Sequential Security Clearance Verification */}
        {step === 1 && (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="p-4 bg-[#F15A24]/10 text-[#F15A24] rounded-2xl animate-pulse">
                <Lock size={26} />
              </div>
              <h4 className={`font-black text-md ${textColor}`}>Simulation Authentication Gate</h4>
              <p className={`text-xs ${labelColor} leading-normal max-w-sm`}>
                Complete institutional checklist checks below. Verify COT, TAX, and IRS codes exactly as generated.
              </p>
            </div>

            {/* Custom Horizontal Gradient Loading Bar with Shimmer Animation */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                <span>Verification State</span>
                <span className="text-[#F15A24]">{progress}% Completed</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                isDarkMode ? 'bg-[#001D24] border-[#003B49]/40' : 'bg-gray-100 border-gray-200'
              }`}>
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out animate-shimmer"
                  style={{ width: `${Math.max(progress, 4)}%` }}
                />
              </div>
            </div>

            {/* Three Sequential Inputs */}
            <div className="space-y-4">
              
              {/* Checkpoint A: COT Code */}
              <form onSubmit={handleVerifyCot} className={`p-4 rounded-2xl border transition-all duration-300 ${
                cotSuccess 
                  ? 'bg-emerald-500/[0.03] border-emerald-500/20' 
                  : isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50/50 border-gray-100'
              } space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${textColor} flex items-center gap-2`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${cotSuccess ? 'bg-emerald-500' : 'bg-[#F15A24] animate-ping'}`} />
                    1. COT Check (Cost of Transfer)
                    <button 
                      type="button"
                      onMouseEnter={() => setActiveTooltip('cot')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => setActiveTooltip(activeTooltip === 'cot' ? null : 'cot')}
                      className="text-gray-400 hover:text-[#F15A24] transition"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </span>
                  {cotSuccess && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                      <ShieldCheck size={14} /> CLEARED
                    </span>
                  )}
                </div>

                {activeTooltip === 'cot' && (
                  <p className="text-[10px] text-gray-400 bg-black/20 p-2 rounded-lg leading-normal">
                    <strong>Cost of Transfer clearance</strong> acts as a micro-payment validator, confirming state tax compliance limits.
                  </p>
                )}

                <div className="flex gap-3">
                  <input
                    required
                    disabled={cotSuccess}
                    type="password"
                    placeholder="Enter 4-Digit COT Code"
                    value={cotInput}
                    onChange={(e) => setCotInput(e.target.value)}
                    className={`flex-1 p-3 text-[16px] md:text-sm font-mono tracking-widest border rounded-xl outline-none disabled:opacity-50 transition-all font-bold ${inputBg} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]`}
                  />
                  {!cotSuccess && (
                    <button
                      type="submit"
                      className="px-5 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md shadow-[#F15A24]/10 min-h-[48px]"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </form>

              {/* Checkpoint B: TAX Code */}
              <form onSubmit={handleVerifyTax} className={`p-4 rounded-2xl border transition-all duration-300 ${
                taxSuccess 
                  ? 'bg-emerald-500/[0.03] border-emerald-500/20' 
                  : !cotSuccess 
                    ? 'opacity-35 pointer-events-none' 
                    : isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50/50 border-gray-100'
              } space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${textColor} flex items-center gap-2`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${taxSuccess ? 'bg-emerald-500' : cotSuccess ? 'bg-[#F15A24] animate-ping' : 'bg-gray-500'}`} />
                    2. TAX Check (Revenue Compliance)
                    <button 
                      type="button"
                      onMouseEnter={() => setActiveTooltip('tax')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => setActiveTooltip(activeTooltip === 'tax' ? null : 'tax')}
                      className="text-gray-400 hover:text-[#F15A24] transition"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </span>
                  {taxSuccess && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                      <ShieldCheck size={14} /> CLEARED
                    </span>
                  )}
                </div>

                {activeTooltip === 'tax' && (
                  <p className="text-[10px] text-gray-400 bg-black/20 p-2 rounded-lg leading-normal">
                    <strong>Revenue Tax compliance check</strong> logs tax filing center confirmation to certify offshore capital-gain requirements.
                  </p>
                )}

                <div className="flex gap-3">
                  <input
                    required
                    disabled={taxSuccess || !cotSuccess}
                    placeholder="Enter TAX Code (e.g. TAX-XX)"
                    value={taxInput}
                    onChange={(e) => setTaxInput(e.target.value)}
                    className={`flex-1 p-3 text-[16px] md:text-sm font-mono border rounded-xl outline-none disabled:opacity-50 transition-all font-bold ${inputBg} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]`}
                  />
                  {!taxSuccess && cotSuccess && (
                    <button
                      type="submit"
                      className="px-5 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md shadow-[#F15A24]/10 min-h-[48px]"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </form>

              {/* Checkpoint C: IRS Code */}
              <form onSubmit={handleVerifyIrs} className={`p-4 rounded-2xl border transition-all duration-300 ${
                irsSuccess 
                  ? 'bg-emerald-500/[0.03] border-emerald-500/20' 
                  : !taxSuccess 
                    ? 'opacity-35 pointer-events-none' 
                    : isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50/50 border-gray-100'
              } space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${textColor} flex items-center gap-2`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${irsSuccess ? 'bg-emerald-500' : taxSuccess ? 'bg-[#F15A24] animate-ping' : 'bg-gray-500'}`} />
                    3. IRS Check (Federal Compliance)
                    <button 
                      type="button"
                      onMouseEnter={() => setActiveTooltip('irs')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => setActiveTooltip(activeTooltip === 'irs' ? null : 'irs')}
                      className="text-gray-400 hover:text-[#F15A24] transition"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </span>
                  {irsSuccess && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                      <ShieldCheck size={14} /> CLEARED
                    </span>
                  )}
                </div>

                {activeTooltip === 'irs' && (
                  <p className="text-[10px] text-gray-400 bg-black/20 p-2 rounded-lg leading-normal">
                    <strong>Federal IRS Anti-Money Laundering key</strong> authorizes high-value transfers, completing regulatory checks.
                  </p>
                )}

                <div className="flex gap-3">
                  <input
                    required
                    disabled={irsSuccess || !taxSuccess}
                    placeholder="Enter IRS Code (e.g. IRS-XX)"
                    value={irsInput}
                    onChange={(e) => setIrsInput(e.target.value)}
                    className={`flex-1 p-3 text-[16px] md:text-sm font-mono border rounded-xl outline-none disabled:opacity-50 transition-all font-bold ${inputBg} ${inputBorder} focus:ring-2 focus:ring-[#F15A24]`}
                  />
                  {!irsSuccess && taxSuccess && (
                    <button
                      type="submit"
                      className="px-5 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md shadow-[#F15A24]/10 min-h-[48px]"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </form>

            </div>

            {/* Advance gateway button */}
            <button
              onClick={handleAccessGateway}
              disabled={!irsSuccess || loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-[#F15A24] to-[#FFB81C] hover:opacity-95 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-md transition disabled:opacity-30 active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4" />
                  Decrypting Secure Tunnel...
                </>
              ) : (
                <>
                  Enter Amortization Gateway
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Payment Specifications */}
        {step === 2 && (
          <div className="space-y-5 max-w-md mx-auto animate-slide-up">
            <h4 className={`font-black text-lg text-center ${textColor}`}>Payment Specifications</h4>
            <p className={`text-xs ${labelColor} text-center leading-relaxed`}>Configure payment amount and destination. Ledger checkpoints verified.</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`block text-xs font-black uppercase tracking-wider ${labelColor}`}>Recipient Account Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    required
                    placeholder="Enter Recipient Account"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl focus:ring-2 focus:ring-[#F15A24] text-sm focus:outline-none transition-all ${inputBg} ${inputBorder}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-xs font-black uppercase tracking-wider ${labelColor}`}>Payment Amount ($)</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    required
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl focus:ring-2 focus:ring-[#F15A24] text-sm focus:outline-none transition-all font-bold ${inputBg} ${inputBorder}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-xs font-black uppercase tracking-wider ${labelColor}`}>Transfer Narration</label>
                <div className="relative">
                  <Landmark className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    required
                    placeholder="E.g., Amortization Payment Draft"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl focus:ring-2 focus:ring-[#F15A24] text-sm focus:outline-none transition-all ${inputBg} ${inputBorder}`}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleConfirm} 
              className="w-full py-4 mt-2 bg-[#F15A24] hover:bg-[#D9431E] text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-md transition active:scale-95 min-h-[48px]"
            >
              Continue to Confirmation
            </button>
          </div>
        )}

        {/* Step 3: Review and Confirm compliance details */}
        {step === 3 && (
          <div className="space-y-5 max-w-md mx-auto animate-slide-up">
            <h4 className={`font-black text-lg text-center ${textColor}`}>Confirm Compliance Details</h4>
            <p className={`text-xs ${labelColor} text-center leading-relaxed`}>Review the payment parameters before authorizing. These details cannot be reverted.</p>
            
            <div className={`p-6 border rounded-3xl space-y-3.5 text-xs font-semibold ${
              isDarkMode ? 'bg-[#001D24]/50 border-gray-800' : 'bg-gray-50/50 border-gray-150'
            }`}>
              <div className="flex justify-between py-1.5 border-b border-gray-800/10 dark:border-gray-800/50">
                <span className={labelColor}>To Account:</span>
                <span className={`font-bold font-mono ${textColor}`}>{toAccount}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800/10 dark:border-gray-800/50">
                <span className={labelColor}>Transfer Amount:</span>
                <span className="font-bold text-[#F15A24] text-base font-mono">${parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className={labelColor}>Narration:</span>
                <span className={`font-bold text-right ${textColor}`}>{narration}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-[10px] font-black uppercase text-center">
              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-2 rounded-xl">
                COT CLEARED
              </div>
              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-2 rounded-xl">
                TAX CLEARED
              </div>
              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-2 rounded-xl">
                IRS CLEARED
              </div>
            </div>
            
            <div className="flex gap-2.5 items-start text-[10px] text-gray-400 leading-normal bg-[#FFB81C]/5 p-4 border border-[#F15A24]/20 rounded-2xl">
              <AlertCircle size={15} className="text-[#F15A24] shrink-0 mt-0.5" />
              <span>By authorizing, you consent to automatic clearing sequence validation including COT, Tax, and federal institutional audit procedures.</span>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => setStep(2)} 
                className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition active:scale-95 min-h-[48px]"
              >
                Back
              </button>
              <button 
                disabled={loading} 
                onClick={handleExecute} 
                className="flex-grow py-3.5 bg-gradient-to-r from-[#F15A24] to-[#FFB81C] hover:opacity-90 active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4" />
                    Executing Wire...
                  </>
                ) : (
                  <>
                    Authorize Amortization
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Compliance Hold / Success screen */}
        {step === 4 && (
          <div className="space-y-6 max-w-md mx-auto text-center py-4 animate-fadeIn">
            <div className="flex justify-center">
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.2)]">
                <ShieldCheck size={52} className="animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <h4 className={`text-xl font-black tracking-tight ${textColor}`}>Compliance Hold Activated</h4>
              <p className={`text-xs ${labelColor} leading-relaxed max-w-sm mx-auto`}>
                The amortization payment has been successfully recorded in the blockchain ledger. Redirection codes (COT, TAX, IRS) have been logged. Access clearance holds must be cleared by compliance officers.
              </p>
            </div>

            <button
              onClick={resetGateway}
              className="py-3.5 px-8 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#F15A24]/20 min-h-[48px]"
            >
              Initiate New Wire Draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitiateTransfer;
