import React, { useEffect, useState } from 'react';
import { fetchAllTransactions, adminUpdateTransaction } from '../services/adminService';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import { BookOpen, FileSpreadsheet, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface TransactionLedgerProps {
  isDarkMode?: boolean;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ isDarkMode = true }) => {
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
      toast.success(`Ledger stage updated to ${newStage}`);
      loadTransactions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ledger');
    }
  };

  if (loading) {
    return (
      <div className={`p-8 text-center text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Hydrating global transaction ledger...
      </div>
    );
  }

  const containerBg = isDarkMode ? 'bg-gray-900/60 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const headerBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200';
  const theadBg = isDarkMode ? 'bg-gray-950/60 text-gray-400 border-b border-gray-800' : 'bg-gray-50 text-gray-500 border-b border-gray-200';
  const divideColor = isDarkMode ? 'divide-gray-800' : 'divide-gray-100';

  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 ${containerBg}`}>
      
      {/* Premium Header */}
      <div className={`px-6 py-5 border-b flex justify-between items-center ${headerBg}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Global Transaction Ledger</h2>
            <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
              Track, audit, and authorize pending customer ledger withdrawals.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={`text-[10px] font-black uppercase tracking-wider ${theadBg}`}>
            <tr>
              <th className="px-6 py-4">Customer ID</th>
              <th className="px-6 py-4">Recipient Acc.</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Stage / Status</th>
              <th className="px-6 py-4 text-right">Administrative Clearance Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${divideColor}`}>
            {transactions.map(t => (
              <tr key={t.id} className={`text-xs ${isDarkMode ? 'hover:bg-gray-800/20' : 'hover:bg-gray-50/50'} transition`}>
                <td className="px-6 py-4 font-semibold">{t.customers?.name || 'Unknown'}</td>
                <td className="px-6 py-4 font-mono text-[11px] tracking-tight">{t.to_account}</td>
                <td className="px-6 py-4 font-extrabold text-red-500 text-sm">
                  -${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 align-start">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border self-start ${
                      t.stage === 'COMPLETED' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {t.stage}
                    </span>
                    <span className={`text-[9px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wider`}>{t.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status !== 'COMPLETED' && t.status !== 'REJECTED' ? (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {t.stage === 'PENDING' && (
                        <button 
                          onClick={() => handleUpdateStage(t.id, 'COT_VERIFIED')} 
                          className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition active:scale-95"
                        >
                          Verify COT
                        </button>
                      )}
                      {t.stage === 'COT_VERIFIED' && (
                        <button 
                          onClick={() => handleUpdateStage(t.id, 'TAX_VERIFIED')} 
                          className="py-1 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold transition active:scale-95"
                        >
                          Verify Tax
                        </button>
                      )}
                      {t.stage === 'TAX_VERIFIED' && (
                        <button 
                          onClick={() => handleUpdateStage(t.id, 'IRS_VERIFIED')} 
                          className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition active:scale-95"
                        >
                          Verify IRS
                        </button>
                      )}
                      {t.stage === 'IRS_VERIFIED' && (
                        <button 
                          onClick={() => handleUpdateStage(t.id, 'COMPLETED', 'COMPLETED')} 
                          className="py-1 px-2.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold transition active:scale-95"
                        >
                          Authorize Release
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateStage(t.id, t.stage, 'REJECTED')} 
                        className={`py-1 px-2.5 rounded text-[10px] font-bold border transition active:scale-95 ${
                          isDarkMode 
                            ? 'bg-gray-850 hover:bg-red-600/20 text-red-500 border-red-500/20 hover:text-white' 
                            : 'bg-gray-100 hover:bg-red-600 text-gray-700 border-gray-200 hover:text-white'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end items-center gap-1">
                      {t.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-500">
                          <CheckCircle size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-xs font-semibold text-gray-500">
                  No transaction activity logged in ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionLedger;
