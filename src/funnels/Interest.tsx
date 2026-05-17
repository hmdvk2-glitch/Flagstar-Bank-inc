import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { saveFunnelInteraction } from '../services/funnelService';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const Interest: React.FC = () => {
  const { customer } = useAppStore();
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5.5);
  const [time, setTime] = useState(10);
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    const list = [];
    const fixedRate = rate / 100;
    // Let's assume variable rate starts at rate but fluctuates slightly over years
    let currentVarRate = rate / 100;
    let fixedVal = principal;
    let varVal = principal;

    list.push({ year: 0, Fixed: Math.round(fixedVal), Variable: Math.round(varVal) });

    for (let i = 1; i <= time; i++) {
      fixedVal = fixedVal * (1 + fixedRate);
      // Simulate slight variance (-1% to +1.5%) in var rates
      const fluctuation = (Math.random() * 2.5 - 1) / 100;
      currentVarRate = Math.max(0.01, currentVarRate + fluctuation);
      varVal = varVal * (1 + currentVarRate);

      list.push({
        year: i,
        Fixed: Math.round(fixedVal),
        Variable: Math.round(varVal)
      });
    }
    return list;
  }, [principal, rate, time]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = { principal, rate, time, finalFixed: chartData[chartData.length - 1].Fixed };
      await saveFunnelInteraction(customer ? customer.id : null, 'Interest', data);
      toast.success(customer ? 'Comparator preferences saved!' : 'Calculation saved!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Interest Comparator</h2>
      <p className="text-gray-500 mb-6">Compare the long-term wealth returns of fixed vs variable compounding interests.</p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Principal Amount ($)</label>
            <input 
              type="number" value={principal} onChange={e=>setPrincipal(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target APY (%)</label>
            <input 
              type="number" step="0.1" value={rate} onChange={e=>setRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Time Horizon: {time} Years</label>
          <input 
            type="range" min="5" max="30" step="1" value={time}
            onChange={(e) => setTime(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div className="h-64 w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Fixed" stroke="#dc2626" strokeWidth={2} />
              <Line type="monotone" dataKey="Variable" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button 
          onClick={handleApply} disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Lock Investment Term'}
        </button>
      </div>
    </div>
  );
};

export default Interest;
