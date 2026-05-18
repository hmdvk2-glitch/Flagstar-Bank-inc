import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerLogin } from '../services/customerService';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import { Lock, User, ShieldCheck } from 'lucide-react';
import FlagstarLogo from './FlagstarLogo';

interface CustomerLoginButtonProps {
  buttonClassName?: string;
  buttonText?: string;
}

const CustomerLoginButton: React.FC<CustomerLoginButtonProps> = ({
  buttonClassName = "px-5 py-2.5 bg-flagstar-orange hover:bg-amber-500 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95",
  buttonText = "Customer Login"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setCustomer = useAppStore((state) => state.setCustomer);
  const isCustomer = useAppStore((state) => state.isCustomer);

  if (isCustomer) {
    return (
      <button 
        onClick={() => navigate('/dashboard')} 
        className="px-5 py-2.5 bg-flagstar-teal text-white rounded-full font-bold text-sm hover:bg-flagstar-teal-dark shadow transition active:scale-95"
      >
        Go to MyLoans Dashboard
      </button>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await customerLogin(account, pin);
      setCustomer({
        id: data.customer_id,
        account_number: data.account_number,
        name: data.name,
        balance: data.balance,
        kyc_status: data.kyc_status,
      }, data.token);
      toast.success('Securely logged into MyLoans');
      setIsOpen(false);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
      >
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-flagstar-slate/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-md relative overflow-hidden">
            {/* Header branding strip */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-flagstar-orange to-flagstar-green" />

            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
            >
              &times;
            </button>

            <div className="flex flex-col items-center mb-6 mt-2">
              <FlagstarLogo className="h-10 w-10" textSize="text-2xl" />
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-flagstar-teal font-extrabold uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                <ShieldCheck size={12} className="text-flagstar-green" />
                Secure MyLoans Gate
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Account Number
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={account}
                    onChange={(e) => setAccount(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-flagstar-teal focus:border-transparent text-sm font-mono tracking-wider placeholder-gray-400 transition-all"
                    placeholder="FL-XXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Secure Access PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-flagstar-teal focus:border-transparent text-sm text-center font-mono tracking-[1.5em] placeholder-gray-400 transition-all"
                    placeholder="****"
                  />
                </div>
              </div>

              <div className="text-[10px] text-gray-400 font-semibold text-center mt-2">
                Protected by institutional grade end-to-end security layers.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-flagstar-teal hover:bg-flagstar-teal-dark text-white rounded-2xl font-bold tracking-wider uppercase text-xs shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating Gateway...' : 'Authorize and Enter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerLoginButton;
