import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { saveFunnelInteraction } from '../services/funnelService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const Investments: React.FC = () => {
  const { customer } = useAppStore();
  const [amount, setAmount] = useState(25000);
  const [risk, setRisk] = useState(5);
  const [loading, setLoading] = useState(false);

  const allocation = useMemo(() => {
    // Dynamically calculate asset allocation percentages based on risk value (1-10)
    const stocks = risk * 9; // Max 90%
    const bonds = Math.max(5, 90 - risk * 8);
    const cash = 100 - stocks - bonds;
    
    return [
      { name: 'Equities', value: stocks, color: '#dc2626' },
      { name: 'Fixed Income', value: bonds, color: '#2563eb' },
      { name: 'Cash Reserves', value: cash, color: '#10b981' }
    ];
  }, [risk]);

  const projectedReturn = useMemo(() => {
    // Higher risk = higher potential returns (but more volatility)
    const annualReturn = 3 + (risk * 0.9);
    return annualReturn.toFixed(2);
  }, [risk]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = { amount, risk, allocation, projectedReturn };
      await saveFunnelInteraction(customer ? customer.id : null, 'Investments', data);
      toast.success(customer ? 'Wealth Management Portfolio established!' : 'Simulation saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Flagstar Wealth Management</h2>
      <p className="text-gray-500 mb-6">Build a robust, dynamically-hedged portfolio aligned precisely to your risk tolerance parameters.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Investment Capital: ${amount.toLocaleString()}</label>
          <input 
            type="range" min="5000" max="500000" step="5000" value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Risk Profile: {risk} / 10</label>
          <input 
            type="range" min="1" max="10" step="1" value={risk}
            onChange={(e) => setRisk(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Aggressive</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase font-semibold">Target Yield</p>
            <p className="text-2xl font-black text-gray-900">+{projectedReturn}%/yr</p>
            <ul className="text-xs space-y-1 text-gray-600">
              {allocation.map((a, i) => (
                <li key={i} className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: a.color }} />
                    {a.name}
                  </span>
                  <span className="font-bold">{a.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button 
          onClick={handleApply} disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Deploy Capital Portfolio'}
        </button>
      </div>
    </div>
  );
};

export default Investments;
