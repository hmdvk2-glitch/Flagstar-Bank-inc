import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { saveFunnelInteraction } from '../services/funnelService';
import toast from 'react-hot-toast';

const Mortgage: React.FC = () => {
  const { customer } = useAppStore();
  const [propertyPrice, setPropertyPrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(60000);
  const [term, setTerm] = useState(30); // years
  const [loading, setLoading] = useState(false);

  const interestRate = 6.25; // 6.25% fixed

  const monthlyPayment = useMemo(() => {
    const principal = propertyPrice - downPayment;
    const monthlyRate = (interestRate / 100) / 12;
    const totalPayments = term * 12;
    if (principal <= 0) return 0;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
    );
  }, [propertyPrice, downPayment, term]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = { propertyPrice, downPayment, term, monthlyPayment: Math.round(monthlyPayment) };
      await saveFunnelInteraction(customer ? customer.id : null, 'Mortgages', data);
      toast.success(customer ? 'Mortgage pre-approval submitted!' : 'Mortgage calculation saved locally!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Mortgage Eligibility</h2>
      <p className="text-gray-500 mb-6">Explore flexible down payments and secure competitive fixed rates with Flagstar.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Property Purchase Price: ${propertyPrice.toLocaleString()}</label>
          <input 
            type="range" min="100000" max="1500000" step="10000" value={propertyPrice}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setPropertyPrice(val);
              if (downPayment > val) setDownPayment(val);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Down Payment: ${downPayment.toLocaleString()}</label>
          <input 
            type="range" min="10000" max={propertyPrice} step="5000" value={downPayment}
            onChange={(e) => setDownPayment(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Amortization Term</label>
          <div className="flex gap-4">
            {[15, 30].map((y) => (
              <button 
                key={y} onClick={() => setTerm(y)}
                className={`flex-1 py-2.5 border rounded-lg font-medium transition ${term === y ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700'}`}
              >
                {y} Years Fixed
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex justify-between items-center text-center">
          <div className="flex-1 border-r border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold">Interest Rate</p>
            <p className="text-2xl font-bold text-gray-900">{interestRate}%</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">Estimated Monthly</p>
            <p className="text-2xl font-bold text-red-600">${Math.round(monthlyPayment).toLocaleString()}</p>
          </div>
        </div>

        <button 
          onClick={handleApply} disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Get Pre-Approved'}
        </button>
      </div>
    </div>
  );
};

export default Mortgage;
