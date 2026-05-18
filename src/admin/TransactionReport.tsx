import React, { useEffect, useState } from 'react';
import { fetchAllCustomers } from '../services/adminService';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import { FileSpreadsheet, Download, RefreshCw, User, Database, X } from 'lucide-react';

interface TransactionReportProps {
  isDarkMode?: boolean;
}

const TransactionReport: React.FC<TransactionReportProps> = ({ isDarkMode = true }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);

  // Row Expand Modal State
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const loadCustomers = async () => {
    try {
      const data = await fetchAllCustomers();
      setCustomers(data);
      if (data.length > 0) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load customers list');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadTransactions = async (customerId: string) => {
    if (!customerId) return;
    setLoadingTx(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true }); // oldest first to compute running balance

      if (error) throw error;

      // Calculate running balance
      let running = 0;
      const computed = (data || []).map((t) => {
        if (t.type === 'credit') {
          running += parseFloat(t.amount);
        } else {
          running -= parseFloat(t.amount);
        }
        return {
          ...t,
          runningBalance: running,
        };
      });

      // Reverse so newest is displayed first
      setTransactions(computed.reverse());
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch customer transactions');
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      loadTransactions(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export');
      return;
    }

    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    const customerName = selectedCust ? selectedCust.name : 'Customer';

    // CSV headers
    let csvContent = 'Date,Type,Amount,Narration,Running Balance\n';

    transactions.forEach((t) => {
      const dateStr = new Date(t.created_at).toLocaleDateString();
      const typeStr = t.type.toUpperCase();
      const amountStr = t.amount.toString();
      // Escape commas in narration
      const narrationStr = `"${t.narration.replace(/"/g, '""')}"`;
      const runningStr = t.runningBalance.toString();

      csvContent += `${dateStr},${typeStr},${amountStr},${narrationStr},${runningStr}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Transaction_Report_${customerName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export initiated successfully!');
  };

  const selectedCust = customers.find(c => c.id === selectedCustomerId);

  const containerBg = isDarkMode ? 'bg-gray-900/60 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const selectBg = isDarkMode ? 'bg-gray-850 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800';
  const tableHeaderBg = isDarkMode ? 'bg-gray-950 text-gray-300' : 'bg-gray-100 text-gray-600 border-b border-gray-200';
  const rowHoverBg = isDarkMode ? 'hover:bg-gray-800/40 hover:translate-x-1' : 'hover:bg-gray-50 hover:translate-x-1';
  const tableBorderColor = isDarkMode ? 'border-gray-800' : 'border-gray-150';

  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 ${containerBg}`}>
      
      {/* Header Banner */}
      <div className={`px-6 py-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#F15A24]/10 text-[#F15A24] border border-[#F15A24]/20 rounded-xl">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Customer Transaction Report</h2>
            <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
              Analyze, review, and export complete credit/debit activity lists with fixed headers and expandable metadata.
            </p>
          </div>
        </div>

        {/* Customer Select Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <User size={14} className="text-[#FFB81C]" />
            <span className="text-xs font-bold">Account Holder:</span>
          </div>
          {loadingCustomers ? (
            <span className="text-xs text-gray-400">Loading accounts...</span>
          ) : (
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={`text-xs font-bold py-2 px-3.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#F15A24] ${selectBg}`}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.account_number})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => selectedCustomerId && loadTransactions(selectedCustomerId)}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white rounded-lg transition"
            title="Refresh transactions list"
          >
            <RefreshCw size={14} className={loadingTx ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50 min-h-[48px]"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table with Scroll boundary and Fixed Sticky Header */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className={`text-[10px] font-black uppercase tracking-wider sticky top-0 z-10 shadow-sm border-b ${tableHeaderBg} ${tableBorderColor}`}>
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Narration</th>
              <th className="px-6 py-4">Running Balance</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/80' : 'divide-gray-150'}`}>
            {loadingTx ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-xs font-semibold text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F15A24] animate-ping mr-2.5 inline-block" />
                  Generating ledger calculations for {selectedCust?.name || 'customer'}...
                </td>
              </tr>
            ) : transactions.map((t, idx) => (
              <tr 
                key={t.id} 
                onClick={() => setSelectedTx(t)}
                className={`text-xs ${rowHoverBg} transition-all duration-200 transform cursor-pointer border-l-2 border-transparent hover:border-l-[#F15A24] ${
                  idx % 2 === 0 ? (isDarkMode ? 'bg-gray-900/20' : 'bg-gray-50/40') : ''
                }`}
                title="Click to expand full payload"
              >
                <td className="px-6 py-4 font-semibold text-gray-400">
                  {new Date(t.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    t.type === 'credit' 
                      ? 'bg-[#F15A24]/15 text-[#F15A24] border border-[#F15A24]/30' 
                      : 'bg-[#FFB81C]/15 text-[#FFB81C] border border-[#FFB81C]/30'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className={`px-6 py-4 font-extrabold ${
                  t.type === 'credit' ? 'text-green-500' : 'text-[#F15A24]'
                }`}>
                  {t.type === 'credit' ? '+' : '-'}${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium max-w-xs truncate">
                  {t.narration}
                </td>
                <td className="px-6 py-4 font-extrabold text-[#FFB81C] text-sm">
                  ${t.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {!loadingTx && transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-xs font-semibold text-gray-500">
                  No transaction activity found for {selectedCust?.name || 'this customer'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row Expand Modal - Gorgeous Glassmorphic HUD overlay */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-xl rounded-3xl p-6 border shadow-2xl transition-all duration-300 transform scale-100 ${
            isDarkMode ? 'bg-[#002D38]/95 border-[#003B49]/80 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-center border-b pb-4 mb-4 border-gray-100/10 dark:border-gray-800">
              <div className="flex items-center gap-2 text-[#F15A24]">
                <Database size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Transaction Ledger Payload</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold">Transaction Reference ID</span>
                  <span className="font-mono font-bold break-all select-all">{selectedTx.id}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold">Authorization Timestamp</span>
                  <span className="font-semibold text-gray-300">{new Date(selectedTx.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold">Hydrated Customer Ref</span>
                  <span className="font-mono font-bold text-[#FFB81C]">{selectedCust?.name} ({selectedCust?.account_number})</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold">Clearance Type</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    selectedTx.type === 'credit' 
                      ? 'bg-[#F15A24]/10 text-[#F15A24] border border-[#F15A24]/20' 
                      : 'bg-[#FFB81C]/10 text-[#FFB81C] border border-[#FFB81C]/20'
                  }`}>
                    {selectedTx.type}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold">Wire Volume</span>
                  <span className={`font-black text-sm ${selectedTx.type === 'credit' ? 'text-green-500' : 'text-[#F15A24]'}`}>
                    ${parseFloat(selectedTx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold">Compliance Narration</span>
                  <span className="font-semibold text-gray-300">{selectedTx.narration}</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <span className="block text-[10px] uppercase text-gray-400 font-bold">Raw Ledger metadata Payload</span>
                <pre className="p-4 bg-black/60 rounded-2xl font-mono text-[10px] text-emerald-400 overflow-x-auto select-all max-h-48 scrollbar-thin border border-gray-800">
                  {JSON.stringify(selectedTx, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReport;
