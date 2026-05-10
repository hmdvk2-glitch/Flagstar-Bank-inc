import React from 'react';
import { History, Download, Filter, Search, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface StatementViewProps {
  transactions: any[];
}

const StatementView: React.FC<StatementViewProps> = ({ transactions }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="bg-red-600/10 p-4 rounded-3xl">
              <FileText size={32} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Transaction Ledger</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black mt-1">Immutable Verification Trail</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-700" size={18} />
              <input
                type="text"
                placeholder="Search ledger..."
                className="bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:border-red-600 outline-none w-72 transition-all placeholder:text-gray-800"
              />
            </div>
            <button className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-gray-400 hover:text-white">
              <Download size={22} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
                <th className="pb-8">Timestamp</th>
                <th className="pb-8">Description</th>
                <th className="pb-8">Category</th>
                <th className="pb-8 text-right">Amount</th>
                <th className="pb-8 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                    No ledger entries found in current epoch.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="group hover:bg-white/[0.01] transition-all">
                    <td className="py-8">
                      <div className="flex items-center gap-4">
                        <div className={`h-1.5 w-1.5 rounded-full ${txn.type === 'credit' ? 'bg-emerald-500' : 'bg-red-600'}`} />
                        <span className="text-xs font-mono text-gray-500">
                          {new Date(txn.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-8">
                      <p className="text-sm font-bold tracking-tight">{txn.description || 'Global Network Settlement'}</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-1 uppercase">Ref: {txn.id.split('-')[0]}...</p>
                    </td>
                    <td className="py-8">
                      <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400 font-bold uppercase tracking-tighter">
                        {txn.category || 'Transfer'}
                      </span>
                    </td>
                    <td className="py-8 text-right">
                      <p className={`font-mono font-bold text-lg tracking-tighter ${
                        txn.type === 'credit' ? 'text-emerald-500' : 'text-white'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="py-8">
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border tracking-tighter uppercase ${
                          txn.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
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
