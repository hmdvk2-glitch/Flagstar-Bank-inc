import React, { useState, useEffect } from 'react';
import { Search, History, Filter } from 'lucide-react';
import { supabase } from '../supabase/client';

const AuditDashboard: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', search: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, users(full_name, account_number), admins(full_name)')
      .order('created_at', { ascending: false });
    
    if (data) setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    if (filter.action && log.type !== filter.action) return false;
    if (filter.search) {
      const searchStr = filter.search.toLowerCase();
      return (
        log.users?.full_name?.toLowerCase().includes(searchStr) ||
        log.admins?.full_name?.toLowerCase().includes(searchStr) ||
        log.narration?.toLowerCase().includes(searchStr)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-slide-up max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Audit Terminal</h2>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em] font-black">Global Event Traceability</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search traces..."
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#C00000] text-sm font-medium"
              value={filter.search}
              onChange={e => setFilter({...filter, search: e.target.value})}
            />
          </div>
          <select 
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#C00000] text-sm font-medium appearance-none"
            value={filter.action}
            onChange={e => setFilter({...filter, action: e.target.value})}
          >
            <option value="">All Actions</option>
            <option value="credit">CREDIT</option>
            <option value="debit">DEBIT</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Account</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm font-medium text-gray-400">Loading traces...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm font-medium text-gray-400">No matching audit traces found.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                      {new Date(log.created_at || log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        log.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#C00000]'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm">{log.users?.full_name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">{log.users?.account_number}</p>
                    </td>
                    <td className="px-8 py-6 font-mono text-[10px] text-gray-400">
                      {log.admins?.full_name || 'SYSTEM'}
                    </td>
                    <td className={`px-8 py-6 text-right font-black ${log.type === 'credit' ? 'text-emerald-500' : 'text-[#111827]'}`}>
                      {log.type === 'credit' ? '+' : '-'}${Number(log.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

export default AuditDashboard;
