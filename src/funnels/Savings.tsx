import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { saveFunnelInteraction } from '../services/funnelService';
import toast from 'react-hot-toast';

const Savings: React.FC = () => {
  const { customer } = useAppStore();
  const [deposit, setDeposit] = useState(5000);
  const [apy, setApy] = useState(4.50); // High APY
  const [duration, setDuration] = useState(5); // years
  const [loading, setLoading] = useState(false);

  const calculateReturn = () => {
    // A = P(1 + r/n)^(nt)
    // Daily compounding n = 365
    const n = 365;
    const r = apy / 100;
    const t = duration;
    return deposit * Math.pow(1 + r / n, n * t);
  };

  const totalValue = calculateReturn();
  const interestEarned = totalValue - deposit;

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = { deposit, apy, duration, interestEarned: Math.round(interestEarned) };
      await saveFunnelInteraction(customer ? customer.id : null, 'Savings', data);
      toast.success(customer ? 'High Yield Savings Account provisioned!' : 'Calculation saved!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">High Yield Savings (4.50% APY)</h2>
      <p className="text-gray-500 mb-6">Maximize your earnings with daily compounding interest and $0 monthly maintenance fees.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Deposit: ${deposit.toLocaleString()}</label>
          <input 
            type="range" min="500" max="250000" step="500" value={deposit}
            onChange={(e) => setDeposit(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Savings Horizon (Years)</label>
          <div className="flex gap-2">
            {[1, 5, 10].map((y) => (
              <button 
                key={y} onClick={() => setDuration(y)}
                className={`flex-1 py-2 border rounded-lg text-sm font-medium transition ${duration === y ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700'}`}
              >
                {y} {y === 1 ? 'Year' : 'Years'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 grid grid-cols-2 gap-4 text-center">
          <div className="border-r border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold">Interest Earned</p>
            <p className="text-2xl font-bold text-green-600">+${Math.round(interestEarned).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">${Math.round(totalValue).toLocaleString()}</p>
          </div>
        </div>

        <button 
          onClick={handleApply} disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Open Savings Vault'}
        </button>
      </div>
    </div>
  );
};

export default Savings;
