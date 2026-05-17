import React, { useEffect, useState } from 'react';
import { fetchAllTransactions, adminUpdateTransaction } from '../services/adminService';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

const TransactionLedger: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const admin = useAppStore((state) => state.admin);

  const loadTransactions = async () => {
    try {
      const data = await fetchAllTransactions();
      setTransactions(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleUpdateStage = async (id: string, newStage: string, newStatus = 'PENDING') => {
    if (!admin) return;
    try {
      await adminUpdateTransaction(admin.id, id, { stage: newStage, status: newStatus });
      toast.success('Transaction updated');
      loadTransactions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  if (loading) return <div>Loading ledger...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Transaction Ledger</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">To Account</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Stage / Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map(t => (
              <tr key={t.id} className="text-sm">
                <td className="px-6 py-4 font-medium">{t.customers?.name || 'Unknown'}</td>
                <td className="px-6 py-4 font-mono">{t.to_account}</td>
                <td className="px-6 py-4 font-bold text-red-600">${t.amount}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold self-start">{t.stage}</span>
                    <span className="text-xs text-gray-500">{t.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {t.status !== 'COMPLETED' && t.status !== 'REJECTED' && (
                    <div className="flex flex-wrap gap-2">
                      {t.stage === 'PENDING' && <button onClick={() => handleUpdateStage(t.id, 'COT_VERIFIED')} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Verify COT</button>}
                      {t.stage === 'COT_VERIFIED' && <button onClick={() => handleUpdateStage(t.id, 'TAX_VERIFIED')} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">Verify Tax</button>}
                      {t.stage === 'TAX_VERIFIED' && <button onClick={() => handleUpdateStage(t.id, 'IRS_VERIFIED')} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Verify IRS</button>}
                      {t.stage === 'IRS_VERIFIED' && <button onClick={() => handleUpdateStage(t.id, 'COMPLETED', 'COMPLETED')} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Complete</button>}
                      <button onClick={() => handleUpdateStage(t.id, t.stage, 'REJECTED')} className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white rounded text-xs transition">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionLedger;
