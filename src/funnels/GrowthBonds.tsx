import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { saveFunnelInteraction } from '../services/funnelService';
import toast from 'react-hot-toast';

const GrowthBonds: React.FC = () => {
  const { customer } = useAppStore();
  const [purchaseAmount, setPurchaseAmount] = useState(10000);
  const [bondType, setBondType] = useState('Series-EE');
  const [loading, setLoading] = useState(false);

  const getYield = () => {
    switch (bondType) {
      case 'Series-I': return 4.30;
      case 'Treasury-Note': return 4.15;
      default: return 3.90; // Series-EE
    }
  };

  const yieldPct = getYield();
  const termYears = bondType === 'Treasury-Note' ? 10 : 20;

  const calculateMaturity = () => {
    // Simple yearly compounding A = P(1+r)^t
    return purchaseAmount * Math.pow(1 + yieldPct / 100, termYears);
  };

  const maturityValue = calculateMaturity();
  const interestAccrued = maturityValue - purchaseAmount;

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = { purchaseAmount, bondType, yieldPct, termYears, interestAccrued: Math.round(interestAccrued) };
      await saveFunnelInteraction(customer ? customer.id : null, 'Growth Bonds', data);
      toast.success(customer ? 'Bond purchasing plan locked!' : 'Bond simulation saved!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Growth & Government Bonds</h2>
      <p className="text-gray-500 mb-6">Invest in AAA-rated Flagstar institutional and treasury bonds. Zero credit risk, guaranteed yields.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bond Specification</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Series-EE', label: 'Series EE (20 Yr)' },
              { id: 'Series-I', label: 'Series I (20 Yr)' },
              { id: 'Treasury-Note', label: 'T-Note (10 Yr)' }
            ].map((b) => (
              <button 
                key={b.id} onClick={() => setBondType(b.id)}
                className={`py-3 px-1 border rounded-lg text-xs font-semibold tracking-tight transition ${bondType === b.id ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700'}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Purchase Principal: ${purchaseAmount.toLocaleString()}</label>
          <input 
            type="range" min="1000" max="100000" step="1000" value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 grid grid-cols-2 gap-4 text-center">
          <div className="border-r border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold">Coupon Yield (Annual)</p>
            <p className="text-2xl font-bold text-gray-900">{yieldPct}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Value at Maturity</p>
            <p className="text-2xl font-bold text-green-600">${Math.round(maturityValue).toLocaleString()}</p>
          </div>
        </div>

        <button 
          onClick={handleApply} disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Acquire Bonds'}
        </button>
      </div>
    </div>
  );
};

export default GrowthBonds;
