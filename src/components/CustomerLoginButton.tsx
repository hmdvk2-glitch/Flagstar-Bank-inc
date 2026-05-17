import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerLogin } from '../services/customerService';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import { Lock, User } from 'lucide-react';

const CustomerLoginButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setCustomer = useAppStore((state) => state.setCustomer);
  const isCustomer = useAppStore((state) => state.isCustomer);

  if (isCustomer) {
    return (
      <button onClick={() => navigate('/customer/dashboard')} className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold text-sm">
        Go to Dashboard
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
      toast.success('Login successful');
      setIsOpen(false);
      navigate('/customer/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold text-sm hover:bg-red-700 transition"
      >
        Customer Login
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Secure Access</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter Account Number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter PIN"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerLoginButton;
