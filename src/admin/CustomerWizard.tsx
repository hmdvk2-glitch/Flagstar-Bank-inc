import React, { useState } from 'react';
import { 
  UserPlus, 
  Hash, 
  Lock, 
  Wallet, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import { adminService } from '../services/adminService';

interface CustomerWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CustomerWizard: React.FC<CustomerWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: 'FL-' + Math.floor(100000 + Math.random() * 900000),
    pin: '',
    balance: 0,
    cot: true,
    tax: true,
    irs: true
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await adminService.createCustomer({
        name: formData.name,
        email: formData.name.toLowerCase().replace(/ /g, '.') + '@flagstar-secure.com',
        account_number: formData.accountNumber,
        pin: formData.pin
      });
      onComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden max-w-2xl w-full">
      {/* Header */}
      <div className="bg-gray-50 p-8 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Provisioning Wizard</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Enterprise Asset Setup</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className={`h-1.5 w-6 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#C00000]' : 'bg-gray-200'}`} 
            />
          ))}
        </div>
      </div>

      <div className="p-12">
        {step === 1 && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-[#C00000]/5 p-6 rounded-3xl w-fit">
              <UserPlus className="text-[#C00000]" size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight">Identify Customer</h3>
              <p className="text-gray-500 text-sm">Enter the legal full name for the new institutional account.</p>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Full Legal Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-5 px-6 outline-none focus:border-[#C00000] transition-all"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-[#C00000]/5 p-6 rounded-3xl w-fit">
              <Hash className="text-[#C00000]" size={32} />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight">Access Credentials</h3>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Account Number</label>
                <input 
                  type="text"
                  readOnly
                  value={formData.accountNumber}
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-5 px-6 font-mono text-lg tracking-widest"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Define Security PIN (6 Digits)</label>
                <input 
                  type="password"
                  maxLength={6}
                  value={formData.pin}
                  onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                  placeholder="******"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-5 px-6 outline-none focus:border-[#C00000] transition-all font-mono tracking-[1em] text-center text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-[#C00000]/5 p-6 rounded-3xl w-fit">
              <Wallet className="text-[#C00000]" size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight">Initial Liquidity</h3>
              <p className="text-gray-500 text-sm">Set the opening vault balance for this account.</p>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                <input 
                  type="number"
                  value={formData.balance}
                  onChange={e => setFormData({...formData, balance: Number(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-5 pl-12 pr-6 outline-none focus:border-[#C00000] transition-all font-bold text-xl"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-[#C00000]/5 p-6 rounded-3xl w-fit">
              <Settings className="text-[#C00000]" size={32} />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight">Transfer Gating</h3>
              <p className="text-gray-500 text-sm">Configure deterministic verification stages for this customer.</p>
              
              <div className="space-y-3">
                {[
                  { id: 'cot', label: 'COT (Certificate of Transfer)', desc: 'Initial clearing stage' },
                  { id: 'tax', label: 'TAX (Wealth Tax Clearance)', desc: 'Revenue verification' },
                  { id: 'irs', label: 'IRS (Federal Reporting)', desc: 'Final regulatory check' }
                ].map(flag => (
                  <label key={flag.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-[#C00000]/20 transition-all">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest">{flag.label}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">{flag.desc}</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={formData[flag.id as keyof typeof formData] as boolean}
                      onChange={e => setFormData({...formData, [flag.id]: e.target.checked})}
                      className="h-5 w-5 accent-[#C00000]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-slide-up text-center">
            <div className="bg-[#C00000]/5 p-8 rounded-full w-fit mx-auto">
              <ShieldCheck className="text-[#C00000]" size={64} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight uppercase">Provisioning Ready</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Account <strong>{formData.accountNumber}</strong> is prepared for instantiation.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-left space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Owner</span>
                  <span>{formData.name}</span>
               </div>
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Security PIN</span>
                  <span>******</span>
               </div>
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Status</span>
                  <span className="text-[#C00000]">LOCKED / PENDING</span>
               </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="px-8 py-5 rounded-2xl border border-gray-200 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <button 
            onClick={step === 5 ? handleSubmit : handleNext}
            disabled={loading || (step === 1 && !formData.name) || (step === 2 && formData.pin.length < 6)}
            className="flex-1 bg-[#C00000] hover:bg-[#A00000] disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-[#C00000]/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {step === 5 ? 'Instantiate Account' : 'Continue'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerWizard;
