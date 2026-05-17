import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { saveFunnelInteraction } from '../services/funnelService';
import toast from 'react-hot-toast';

const CreditCards: React.FC = () => {
  const { customer } = useAppStore();
  const [cardType, setCardType] = useState('Visa Signature');
  const [limit, setLimit] = useState(5000);
  const [loading, setLoading] = useState(false);

  const calculateInterestRate = () => {
    if (limit < 2000) return 18.99;
    if (limit < 10000) return 15.99;
    return 13.99;
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = { cardType, limit, interestRate: calculateInterestRate() };
      await saveFunnelInteraction(customer ? customer.id : null, 'Credit Cards', data);
      toast.success(customer ? 'Application submitted successfully!' : 'Preferences saved! Sign up to complete.');
    } catch (err: any) {
      toast.error(err.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Flagstar Premium Cards</h2>
      <p className="text-gray-500 mb-6">Apply for our elite Visa or Mastercard products. Unlock up to 5% cashback on everyday transactions.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Tier</label>
          <div className="grid grid-cols-3 gap-3">
            {['Visa Gold', 'Visa Signature', 'Mastercard Elite'].map((t) => (
              <button 
                key={t}
                onClick={() => setCardType(t)}
                className={`py-3 px-4 border rounded-lg font-medium text-sm transition ${cardType === t ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Desired Credit Limit: ${limit.toLocaleString()}</label>
          <input 
            type="range" 
            min="1000" 
            max="25000" 
            step="500" 
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$1,000</span>
            <span>$25,000</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Estimated APY</p>
            <p className="text-xl font-bold text-gray-900">{calculateInterestRate()}% Var.</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Annual Fee</p>
            <p className="text-xl font-bold text-green-600">$0</p>
          </div>
        </div>

        <button 
          onClick={handleApply}
          disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Apply Securely'}
        </button>
      </div>
    </div>
  );
};

export default CreditCards;
