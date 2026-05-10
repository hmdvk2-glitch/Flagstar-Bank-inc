import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Database, 
  FileSearch, 
  Filter, 
  Download,
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  account_id: string;
  amount: number;
  type: string;
  description: string;
  category: string;
  status: string;
  stage: string;
  created_at: string;
}

const LedgerViewer: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredEntries = entries.filter(e => 
    e.description?.toLowerCase().includes(filter.toLowerCase()) || 
    e.id.includes(filter) ||
    e.account_id.includes(filter)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#161616] p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Database size={20} className="text-red-600" />
              Immutable Ledger Audit
            </h3>
            <p className="text-sm text-gray-500 mt-1">Direct blockchain-simulated record verification</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search ledger..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-red-600 outline-none w-64"
              />
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="bg-red-600/5 border border-red-600/20 p-4 rounded-xl flex items-center gap-4 mb-8">
          <AlertTriangle className="text-red-600" size={24} />
          <div className="text-xs text-red-500/80 leading-relaxed font-medium">
            <strong>IMMUTABILITY WARNING:</strong> This interface provides a read-only view of the core transaction ledger. Any modifications to these records must be performed through the Transaction Engine Orchestration panel with proper security clearance.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="pb-4">Timestamp</th>
                <th className="pb-4">Record ID</th>
                <th className="pb-4">Operation</th>
                <th className="pb-4 text-right">Value</th>
                <th className="pb-4 text-center">Protocol Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center animate-pulse text-gray-500">Querying Supabase Ledger...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-500">No matching records found.</td></tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="group hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-red-600">
                    <td className="py-5 flex items-center gap-3">
                      <div className="bg-white/5 p-2 rounded-lg text-gray-500">
                        <Clock size={14} />
                      </div>
                      <span className="text-xs font-mono text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                        <br />
                        {new Date(entry.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-300">{entry.id.substring(0, 13)}...</span>
                        <ExternalLink size={12} className="text-gray-600 group-hover:text-red-600 cursor-pointer" />
                      </div>
                    </td>
                    <td className="py-5">
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{entry.description || 'System Mutation'}</p>
                      <p className="text-[10px] text-gray-500 font-mono">ACC_ID: {entry.account_id.substring(0, 8)}</p>
                    </td>
                    <td className="py-5 text-right">
                      <p className={`text-sm font-bold font-mono ${entry.type === 'debit' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {entry.type === 'debit' ? '-' : '+'}${Math.abs(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="py-5">
                      <div className="flex flex-col items-center">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                          entry.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        }`}>
                          {entry.status}
                        </span>
                        <span className="text-[8px] mt-1 text-gray-600 font-mono tracking-tighter">{entry.stage}</span>
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

export default LedgerViewer;
