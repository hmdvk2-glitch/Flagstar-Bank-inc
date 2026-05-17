import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { saveFunnelInteraction } from '../services/funnelService';
import toast from 'react-hot-toast';

const Loans: React.FC = () => {
  const { customer } = useAppStore();
  const [loanAmount, setLoanAmount] = useState(10000);
  const [purpose, setPurpose] = useState('Debt Consolidation');
  const [term, setTerm] = useState(36); // months
  const [loading, setLoading] = useState(false);

  const calculateAPR = () => {
    switch(purpose) {
      case 'Auto Purchase': return 5.49;
      case 'Home Improvement': return 7.99;
      default: return 9.99; // Personal Debt
    }
  };

  const apr = calculateAPR();
  
  const calculateMonthly = () => {
    const monthlyRate = (apr / 100) / 12;
    return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
  };

  const monthlyPayment = calculateMonthly();

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = { loanAmount, purpose, term, apr, monthlyPayment: Math.round(monthlyPayment) };
      await saveFunnelInteraction(customer ? customer.id : null, 'Loans', data);
      toast.success(customer ? 'Loan request submitted successfully!' : 'Preferences logged locally!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Flagstar Personal & Auto Loans</h2>
      <p className="text-gray-500 mb-6">Rates starting at low APRs. No prepayment penalties, flexible repayment structures.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Select Loan Purpose</label>
          <select 
            value={purpose} onChange={e=>setPurpose(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white"
          >
            <option value="Debt Consolidation">Personal - Debt Consolidation</option>
            <option value="Home Improvement">Personal - Home Improvement</option>
            <option value="Auto Purchase">Auto - Purchase Vehicle</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Loan Amount: ${loanAmount.toLocaleString()}</label>
          <input 
            type="range" min="5000" max="100000" step="1000" value={loanAmount}
            onChange={(e) => setLoanAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Term (Months)</label>
          <div className="grid grid-cols-3 gap-2">
            {[24, 36, 60].map((m) => (
              <button 
                key={m} onClick={() => setTerm(m)}
                className={`py-2 border rounded-lg text-sm font-medium transition ${term === m ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700'}`}
              >
                {m} Months
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex justify-between items-center text-center">
          <div className="flex-1 border-r border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold">APR Rate</p>
            <p className="text-2xl font-bold text-gray-900">{apr}%</p>
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
          {loading ? 'Processing...' : 'Apply For Loan'}
        </button>
      </div>
    </div>
  );
};

export default Loans;
