import React, { useState } from 'react';
import { Shield, ArrowRight, CreditCard, Lock, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerLogin } from '../services/customerService';

interface LoginProps {
  hideBackground?: boolean;
}

const Login: React.FC<LoginProps> = ({ hideBackground }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const [customerCreds, setCustomerCreds] = useState({
    accountNumber: '',
    pin: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await customerLogin(
        customerCreds.accountNumber,
        customerCreds.pin
      );

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const wrapperClass = hideBackground
    ? 'p-6 text-[#111827] flex flex-col items-center justify-center'
    : 'min-h-screen bg-[#F9FAFB] p-6 relative overflow-hidden text-[#111827] flex flex-col items-center justify-center';

  return (
    <div className={wrapperClass}>
      {!hideBackground && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C00000]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C00000]/5 rounded-full blur-[120px]" />
        </>
      )}

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#C00000]/5 p-6 rounded-[2.5rem] border border-[#C00000]/10 mb-6">
            <Shield size={48} className="text-[#C00000]" />
          </div>

          <h1 className="text-3xl font-bold uppercase">
            Flagstar <span className="text-[#C00000]">Bank</span>
          </h1>

          <p className="text-gray-400 mt-2 text-[10px] uppercase tracking-[0.5em] font-black">
            Digital Gateway Terminal
          </p>
        </div>

        {/* CUSTOMER LOGIN ONLY */}
        <div className="bg-white border border-gray-100 p-10 rounded-[3rem] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-8">

            {/* ACCOUNT NUMBER */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={12} className="text-[#C00000]" />
                Account Number
              </label>

              <input
                type="text"
                required
                value={customerCreds.accountNumber}
                onChange={(e) =>
                  setCustomerCreds({
                    ...customerCreds,
                    accountNumber: e.target.value.toUpperCase()
                  })
                }
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-mono tracking-widest text-lg"
                placeholder="FL-XXXXXX"
              />
            </div>

            {/* PIN */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} className="text-[#C00000]" />
                Access PIN
              </label>

              <input
                type="password"
                required
                maxLength={6}
                value={customerCreds.pin}
                onChange={(e) =>
                  setCustomerCreds({
                    ...customerCreds,
                    pin: e.target.value.replace(/\D/g, '')
                  })
                }
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-mono tracking-[1.5em] text-center text-lg"
                placeholder="****"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C00000] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <RefreshCcw className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="uppercase tracking-widest">
                    Authorize Access
                  </span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;