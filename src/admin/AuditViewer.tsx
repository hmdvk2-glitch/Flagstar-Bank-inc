import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, History, Shield, ExternalLink, Clock } from 'lucide-react';
import { Queries } from '../supabase/queries';

const AuditViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await Queries.getAuditLogs();
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-red-600/10 p-3 rounded-2xl">
              <History size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">System Audit Ledger</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Immutable Admin Trace</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Filter logs..."
                className="bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-red-600 outline-none w-64 transition-all"
              />
            </div>
            <button onClick={fetchLogs} className="p-2.5 hover:bg-white/5 rounded-xl border border-white/10 transition-all">
              <Database size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                <th className="pb-6">Timestamp</th>
                <th className="pb-6">Operation</th>
                <th className="pb-6">Actor</th>
                <th className="pb-6">Target</th>
                <th className="pb-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center animate-pulse text-gray-600 font-mono text-xs tracking-widest uppercase">Querying Immutable Log Buffer...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-500 text-sm">No administrative mutations detected.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/5 transition-all">
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-gray-700" />
                        <span className="text-xs font-mono text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="px-2 py-1 bg-red-600/10 text-red-600 text-[10px] font-black rounded-lg border border-red-600/20 uppercase tracking-tighter">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        <Shield size={12} className="text-gray-600" />
                        <span className="text-xs text-gray-400 font-mono">{log.admin_id?.substring(0, 8) || 'SYSTEM'}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-xs text-gray-500 font-mono">{log.target_id || 'N/A'}</span>
                    </td>
                    <td className="py-6 text-right">
                      <button className="text-gray-600 hover:text-white transition-colors">
                        <ExternalLink size={16} />
                      </button>
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

export default AuditViewer;
