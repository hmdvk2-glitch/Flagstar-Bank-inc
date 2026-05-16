import React, { useMemo } from 'react';
import { Download, FileText, ArrowUpRight, ArrowDownLeft, Shield, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface StatementViewProps {
  transactions: any[];
}

const StatementView: React.FC<StatementViewProps> = ({ transactions }) => {
  const { user } = useAuthStore();

  const filteredTransactions = useMemo(() => 
    transactions.filter(t => t.user_id === user?.id), 
  [transactions, user?.id]);

  const groupedTransactions = useMemo(() => {
    const today = new Date();
    const groups: { [key: string]: any[] } = {
      'Today': [],
      'This Week': [],
      'This Month': [],
      'Older': []
    };

    filteredTransactions.forEach(txn => {
      const date = new Date(txn.created_at || txn.createdAt);
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) groups['Today'].push(txn);
      else if (diffDays <= 7) groups['This Week'].push(txn);
      else if (diffDays <= 30) groups['This Month'].push(txn);
      else groups['Older'].push(txn);
    });

    return groups;
  }, [filteredTransactions]);

  const totalCredits = filteredTransactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalDebits = filteredTransactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-[#111827]">Account Statement</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-medium">Official Banking Ledger</p>
        </div>
        <button className="flex items-center gap-3 bg-[#111827] text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-black/10">
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Credits</p>
          <p className="text-2xl font-bold mt-2 text-emerald-500">+${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Debits</p>
          <p className="text-2xl font-bold mt-2 text-[#111827]">-${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-[#C00000]/5 p-8 rounded-3xl border border-[#C00000]/10 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#C00000]">Security Restrictions</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={18} className="text-[#C00000]" />
            <span className="font-bold text-[#111827] text-sm">Active Monitoring</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedTransactions).map(([group, txns]) => {
          if (txns.length === 0) return null;
          return (
            <div key={group} className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">{group}</h3>
              <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-50">
                  {txns.map(txn => (
                    <div key={txn.id} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          txn.type === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-[#C00000]'
                        }`}>
                          {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827] text-sm sm:text-base">
                            {txn.type === 'credit' ? 'CREDIT RECEIVED' : 'FUNDS TRANSFERRED'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {txn.type === 'credit' ? 'From' : 'To'}: <span className="font-semibold text-gray-700">{txn.to_account || 'FLAGSTAR SYSTEM'}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1 font-medium">{txn.narration || 'General Ledger Entry'}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className={`text-xl font-black tracking-tighter ${
                          txn.type === 'credit' ? 'text-emerald-500' : 'text-[#111827]'
                        }`}>
                          {txn.type === 'credit' ? '+' : '-'}${Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs font-medium text-gray-400 mt-1">
                          {new Date(txn.created_at || txn.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatementView;
