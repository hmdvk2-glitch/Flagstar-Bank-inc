import React from 'react';
import { Download, FileText, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';

interface StatementViewProps {
  transactions: any[];
}

const StatementView: React.FC<StatementViewProps> = ({ transactions }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Audit Log</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-medium">Verified Historical Ledger Records</p>
        </div>
        <button className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
          <Download size={16} />
          Generate Certified Statement
        </button>
      </div>

      <div className="bg-[#111] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4 text-gray-500">
            <FileText size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Master Transaction Registry</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-red-600" />
            <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">Encrypted Audit Trail</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Reference ID</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Narration / Description</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Execution Date</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest">Flow Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-700 uppercase font-black tracking-widest text-sm">
                    No matching records discovered in vault core
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-8 font-mono text-[10px] text-gray-500 group-hover:text-red-500 transition-colors">
                      {txn.id.substring(0, 13).toUpperCase()}
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${txn.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {txn.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <span className="font-bold text-sm text-gray-300">{txn.narration || 'General Ledger Entry'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-sm text-gray-500 font-medium">
                      {new Date(txn.created_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className={`px-8 py-8 text-right font-black text-lg tracking-tighter ${
                      txn.type === 'credit' ? 'text-emerald-500' : 'text-white'
                    }`}>
                      {txn.type === 'credit' ? '+' : '-'}${Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatementView;
