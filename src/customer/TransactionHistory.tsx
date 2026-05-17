import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchCustomerTransactions } from '../services/customerService';
import toast from 'react-hot-toast';

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

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
      </div>

      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="px-6 py-3">To Account</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Stage / Status</th>
            <th className="px-6 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {transactions.map(t => (
            <tr key={t.id}>
              <td className="px-6 py-4 font-mono">{t.to_account}</td>
              <td className="px-6 py-4 font-bold text-red-600">${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : t.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {t.stage} ({t.status})
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No transactions recorded.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
