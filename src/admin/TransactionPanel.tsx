import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { 
  Play, 
  RefreshCcw, 
  FastForward, 
  AlertCircle, 
  Eye,
  Lock,
  History,
  ShieldCheck
} from 'lucide-react';
import { EventBus } from '../core/events/eventBus';
import { TransactionProjection } from '../core/projections/transactionProjection';
import { TransactionState, TransactionStage } from '../core/reducers/transactionReducer';

const TransactionPanel: React.FC = () => {
  const [projections, setProjections] = useState<TransactionState[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndProject = async () => {
    setLoading(true);
    // 1. Get all unique transaction IDs from the ledger
    const { data: ledgerEntries } = await supabase
      .from('ledger')
      .select('transaction_id')
      .order('created_at', { ascending: false });

    if (!ledgerEntries) return setLoading(false);

    const uniqueIds = [...new Set(ledgerEntries.map(e => e.transaction_id))];
    
    // 2. Build projections for each ID
    const results = await Promise.all(
      uniqueIds.map(id => TransactionProjection.build(id))
    );

    setProjections(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchAndProject();
    
    // Listen for new events to trigger re-projection
    const channel = supabase
      .channel('ledger_changes')
      .on('postgres_changes', { event: 'INSERT', table: 'ledger' }, () => {
        fetchAndProject();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const emitAdvance = async (transactionId: string, currentStage: TransactionStage) => {
    const nextStageMap: Record<string, string> = {
      'PENDING': 'COT_VERIFIED',
      'COT_VERIFIED': 'TAX_VERIFIED',
      'TAX_VERIFIED': 'IRS_VERIFIED',
      'IRS_VERIFIED': 'COMPLETED'
    };

    const nextType = nextStageMap[currentStage];
    if (!nextType) return;

    await EventBus.emit({
      transactionId,
      type: nextType as any,
      timestamp: Date.now(),
      actor: 'ADMIN'
    });
  };

  const emitReject = async (transactionId: string) => {
    await EventBus.emit({
      transactionId,
      type: 'REJECTED',
      timestamp: Date.now(),
      actor: 'ADMIN'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3">
              <ShieldCheck size={24} className="text-red-600" />
              Event-Driven Orchestration
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">v3.0 Immutable State Derivation</p>
          </div>
          <button onClick={fetchAndProject} className={`p-3 bg-white/5 rounded-xl border border-white/5 transition-all ${loading ? 'animate-spin' : ''}`}>
            <RefreshCcw size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                <th className="pb-6">Stream ID</th>
                <th className="pb-6">Current Projection</th>
                <th className="pb-6">Status</th>
                <th className="pb-6 text-right">Mutations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projections.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-gray-500 text-sm italic">No event streams detected in ledger.</td></tr>
              ) : (
                projections.map((state) => (
                  <tr key={state.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                        <History size={14} className="text-gray-700" />
                        <span className="text-xs font-mono text-gray-400">{state.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] font-black rounded-lg border border-white/10 uppercase">
                        {state.stage}
                      </span>
                    </td>
                    <td className="py-6">
                      <span className={`text-[10px] font-black tracking-tighter uppercase ${
                        state.status === 'APPROVED' ? 'text-emerald-500' : (state.status === 'REJECTED' ? 'text-red-500' : 'text-amber-500')
                      }`}>
                        {state.status}
                      </span>
                    </td>
                    <td className="py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        {state.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => emitAdvance(state.id, state.stage)}
                              className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                              title="Emit Advancement Event"
                            >
                              <FastForward size={16} />
                            </button>
                            <button 
                              onClick={() => emitReject(state.id)}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                              title="Emit Rejection Event"
                            >
                              <AlertCircle size={16} />
                            </button>
                          </>
                        )}
                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:text-white transition-all">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#111] p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <h4 className="font-bold flex items-center gap-3 mb-4">
            <Lock size={18} className="text-amber-500" />
            Authority Bypass
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Force-emit a series of 'COMPLETED' events to the global ledger stream. 
            <span className="text-amber-500/60 block mt-2 font-mono">/!\ DANGER: IRREVERSIBLE_MUTATION</span>
          </p>
          <button className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Execute Global Ledger Advancement
          </button>
        </div>

        <div className="bg-[#111] p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
          <h4 className="font-bold flex items-center gap-3 mb-4">
            <AlertCircle size={18} className="text-red-600" />
            Ledger Freeze
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Immediately block all 'append' operations to the event store. 
            Halts all global financial transactions.
          </p>
          <button className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Initiate Protocol Lockdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPanel;
