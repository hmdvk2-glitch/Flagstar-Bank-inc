import React, { useEffect, useState } from 'react';
import { getAuditLogs, AuditLog } from '../utils/auditLog';
import { 
  ShieldCheck, Calendar, Filter, RefreshCw, XCircle, 
  CheckCircle2, User, Lock, Send, Search, Trash2, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLogViewProps {
  isDarkMode?: boolean;
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ isDarkMode = true }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  
  // Filters
  const [searchCustomer, setSearchCustomer] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CLEARANCE_ATTEMPT' | 'TRANSFER_ATTEMPT'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');
  const [filterDate, setFilterDate] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');

  const loadLogs = () => {
    const list = getAuditLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    let result = [...logs];

    // Customer search
    if (searchCustomer.trim()) {
      const q = searchCustomer.toLowerCase();
      result = result.filter(log => 
        log.customerName.toLowerCase().includes(q) || 
        log.customerId.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      result = result.filter(log => log.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      const wantSuccess = filterStatus === 'SUCCESS';
      result = result.filter(log => log.success === wantSuccess);
    }

    // Date filter
    if (filterDate !== 'ALL') {
      const now = new Date();
      result = result.filter(log => {
        const logDate = new Date(log.timestamp);
        const diffMs = now.getTime() - logDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (filterDate === 'TODAY') {
          return diffDays <= 1;
        } else if (filterDate === 'WEEK') {
          return diffDays <= 7;
        }
        return true;
      });
    }

    setFilteredLogs(result);
  }, [logs, searchCustomer, filterType, filterStatus, filterDate]);

  const handleClearAllLogs = () => {
    if (confirm('Are you sure you want to delete all audit logs? This action is irreversible.')) {
      localStorage.removeItem('flagstar_audit_logs');
      loadLogs();
      toast.success('Audit logs cleared');
    }
  };

  // Glassmorphic styles
  const glassCard = isDarkMode 
    ? 'backdrop-blur-md bg-[#002D38]/80 border-[#003B49]/50 shadow-[0_0_30px_rgba(241,90,36,0.1)] text-white' 
    : 'backdrop-blur-md bg-white/85 border-[#F15A24]/10 shadow-[0_0_20px_rgba(0,0,0,0.05)] text-gray-900';
  const filterPanelBg = isDarkMode ? 'bg-[#001D24]/40 border-gray-800' : 'bg-gray-50/50 border-gray-150';
  const inputBg = isDarkMode ? 'bg-[#001D24]/80 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800';

  return (
    <div className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${glassCard}`}>
      
      {/* Header Banner */}
      <div className={`px-8 py-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'border-gray-800/60' : 'border-gray-150'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#F15A24]/10 text-[#F15A24] border border-[#F15A24]/20 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Compliance Audit Stream</h2>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
              Inspect high-fidelity timeline nodes representing cryptographic check failures or ledger registrations.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadLogs}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white rounded-lg transition"
            title="Reload logs"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleClearAllLogs}
            className="px-4 py-2 border border-red-500/30 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-500 transition active:scale-95 flex items-center gap-1.5 min-h-[44px]"
          >
            <Trash2 size={14} />
            Clear Stream
          </button>
        </div>
      </div>

      {/* Filter Options Panel - Glassmorphic Filter Bar */}
      <div className={`p-6 border-b flex flex-wrap gap-4 items-center ${filterPanelBg} ${isDarkMode ? 'border-gray-800/60' : 'border-gray-150'}`}>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-400">
          <Filter size={14} className="text-[#FFB81C]" />
          <span>Filters</span>
        </div>

        {/* Customer Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer name or ID..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className={`text-xs font-semibold pl-9 pr-3 py-2 w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#F15A24] ${inputBg}`}
          />
        </div>

        {/* Event Type Select */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className={`text-xs font-bold py-2 px-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#F15A24] ${inputBg}`}
        >
          <option value="ALL">All Events</option>
          <option value="CLEARANCE_ATTEMPT">Compliance Clearance attempts</option>
          <option value="TRANSFER_ATTEMPT">Amortization Wire events</option>
        </select>

        {/* Status Select */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className={`text-xs font-bold py-2 px-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#F15A24] ${inputBg}`}
        >
          <option value="ALL">All Outcomes</option>
          <option value="SUCCESS">Cleared Successful</option>
          <option value="FAILURE">Flagged Failure</option>
        </select>

        {/* Date Select */}
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value as any)}
          className={`text-xs font-bold py-2 px-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#F15A24] ${inputBg}`}
        >
          <option value="ALL">All Timestamps</option>
          <option value="TODAY">Last 24 Hours</option>
          <option value="WEEK">Last 7 Days</option>
        </select>

        <span className="text-xs text-gray-400 font-black ml-auto">
          {filteredLogs.length} Events Logged
        </span>
      </div>

      {/* Vertical timeline timeline logs stream */}
      <div className="p-8 max-h-[550px] overflow-y-auto custom-scrollbar">
        {filteredLogs.length > 0 ? (
          <div className="relative border-l-2 border-dashed border-[#F15A24]/30 ml-4 md:ml-8 pl-8 space-y-8 py-2">
            {filteredLogs.map((log) => {
              // Custom details for event types
              const isClearance = log.type === 'CLEARANCE_ATTEMPT';
              const dotColor = log.success 
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]';
              
              const EventIcon = isClearance ? Lock : Send;

              return (
                <div key={log.id} className="relative group transition-all duration-300">
                  {/* Floating timeline dot */}
                  <div className={`absolute -left-[42px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                    isDarkMode ? 'border-[#002D38]' : 'border-white'
                  } ${dotColor} transition-transform group-hover:scale-110 z-10`}>
                    <EventIcon size={12} />
                  </div>

                  {/* Glassmorphic timeline card content */}
                  <div className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    isDarkMode 
                      ? 'bg-[#001D24]/40 border-gray-800/80 hover:border-gray-800' 
                      : 'bg-white border-gray-150 shadow-sm'
                  }`}>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 mb-2 border-b border-gray-800/10 dark:border-gray-800/30">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isClearance 
                            ? 'bg-[#FFB81C]/15 text-[#FFB81C] border border-[#FFB81C]/30' 
                            : 'bg-[#F15A24]/15 text-[#F15A24] border border-[#F15A24]/30'
                        }`}>
                          {isClearance ? 'Clearance Gate checkpoint' : 'Institutional Ledger Wire'}
                        </span>
                        
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          log.success 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {log.success ? 'Success' : 'Security Flag'}
                        </span>
                      </div>

                      {/* Custom monospace timestamp */}
                      <span className="text-[10px] text-gray-400 font-bold font-mono flex items-center gap-1.5">
                        <Clock size={11} className="text-gray-400" />
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* User account details */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <div className="flex items-center gap-1 bg-[#F15A24]/5 px-2.5 py-1 rounded-lg border border-[#F15A24]/15 text-[#F15A24] text-[10px] font-black">
                          <User size={12} />
                          {log.customerName}
                        </div>
                        <span className="text-gray-400 font-mono text-[10px] bg-gray-500/5 px-2 py-1 rounded">ID Ref: {log.customerId}</span>
                      </div>

                      {/* Descriptive narrations */}
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        {isClearance ? (
                          <>
                            Hydrating secure gate sequence validation. Checked <strong className="font-bold text-[#FFB81C]">{log.codeType} code</strong> clearance matrix against generated registry: <code className="px-1.5 py-0.5 bg-black/40 rounded font-bold font-mono text-[#F15A24]">"{log.codeValue}"</code>. Action outcome resolves compliance checks.
                          </>
                        ) : (
                          <>
                            Hydrating secure ledger balance update. Executed wire transaction draft transfer of <strong className="font-black text-emerald-500">${log.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> from customer reserves. Target transfer destination routed to account <strong className="font-semibold font-mono text-[#FFB81C]">{log.recipient}</strong>.
                          </>
                        )}
                      </p>

                      <div className="flex justify-between items-center text-[8px] text-gray-500 uppercase font-black tracking-widest pt-1">
                        <span>Event GUID: {log.id}</span>
                        <span>Sec Clearance Lvl 3 Verified</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-xs font-semibold text-gray-500 space-y-2">
            <ShieldCheck size={36} className="mx-auto text-gray-600 animate-bounce" />
            <p>No system compliance audit logs match selected filter streams.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditLogView;
