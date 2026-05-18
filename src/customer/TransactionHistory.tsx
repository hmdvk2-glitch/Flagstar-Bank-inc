import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchCustomerTransactions } from '../services/customerService';
import toast from 'react-hot-toast';
import { CreditCard, ShieldCheck } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const { customer } = useAppStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTx = async () => {
      if (!customer?.id) return;
      try {
        const data = await fetchCustomerTransactions(customer.id);
        setTransactions(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    loadTx();
  }, [customer?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-gray-500 font-bold">
        <span className="w-2 h-2 rounded-full bg-flagstar-orange animate-ping mr-2" />
        Loading Payment Ledger History...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-flagstar-teal-dark">Mortgage Payment Ledger</h3>
          <p className="text-xs text-gray-400 mt-0.5">Comprehensive audit trail of historical amortization transactions.</p>
        </div>
        
        <span className="text-[10px] font-black uppercase text-flagstar-orange tracking-widest flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
          <ShieldCheck size={12} className="text-flagstar-orange" /> Authorized Safe-Audit
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-flagstar-bg text-gray-500 text-xs font-black uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Recipient Account</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Clearing State / Status</th>
              <th className="px-6 py-4">Transaction Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition duration-150">
                <td className="px-6 py-4 font-mono font-bold flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400" />
                  {t.to_account}
                </td>
                <td className="px-6 py-4 font-bold text-flagstar-orange">
                  ${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    t.status === 'COMPLETED' 
                      ? 'bg-emerald-50 text-flagstar-green' 
                      : t.status === 'REJECTED' 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-amber-50 text-flagstar-orange'
                  }`}>
                    {t.stage} ({t.status})
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 font-semibold">
                  {new Date(t.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-xs font-semibold text-gray-500">
                  No mortgage transactions recorded in this cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
