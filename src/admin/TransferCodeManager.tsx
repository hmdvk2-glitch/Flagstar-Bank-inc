import React, { useEffect, useState } from 'react';
import { fetchAllTransferCodes } from '../services/adminService';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, Key, Clock, Trash2 } from 'lucide-react';

interface TransferCodeManagerProps {
  isDarkMode?: boolean;
}

const TransferCodeManager: React.FC<TransferCodeManagerProps> = ({ isDarkMode = true }) => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCodes = async () => {
    try {
      const data = await fetchAllTransferCodes();
      setCodes(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const revokeCode = async (id: string) => {
    try {
      const { error } = await supabase.from('transfer_codes').update({ status: 'expired' }).eq('id', id);
      if (error) throw error;
      toast.success('Code revoked');
      loadCodes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke');
    }
  };

  if (loading) {
    return (
      <div className={`p-8 text-center text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Hydrating cryptographic codes ledger...
      </div>
    );
  }

  const containerBg = isDarkMode ? 'bg-gray-900/60 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const headerBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200';
  const theadBg = isDarkMode ? 'bg-gray-950/60 text-gray-400 border-b border-gray-800' : 'bg-gray-50 text-gray-500 border-b border-gray-200';
  const divideColor = isDarkMode ? 'divide-gray-800' : 'divide-gray-100';

  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 ${containerBg}`}>
      
      {/* Premium Header */}
      <div className={`px-6 py-5 border-b flex justify-between items-center ${headerBg}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl">
            <Key size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Active Transfer Clearances</h2>
            <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
              Audit and revoke high-integrity cryptographic codes.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={`text-[10px] font-black uppercase tracking-wider ${theadBg}`}>
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Clearance ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${divideColor}`}>
            {codes.map(c => (
              <tr key={c.id} className={`text-xs ${isDarkMode ? 'hover:bg-gray-800/20' : 'hover:bg-gray-50/50'} transition`}>
                <td className="px-6 py-4 font-semibold">{c.customers?.name || 'Unknown'}</td>
                <td className="px-6 py-4 font-mono text-[11px] tracking-tight">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{c.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide border ${
                    c.status === 'ACTIVE' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {c.status === 'ACTIVE' ? (
                    <button 
                      onClick={() => revokeCode(c.id)} 
                      className="inline-flex items-center gap-1 py-1.5 px-3 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-lg text-[10px] font-bold text-red-500 transition-all active:scale-95"
                    >
                      <Trash2 size={12} /> Revoke Code
                    </button>
                  ) : (
                    <span className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} font-bold`}>Revoked</span>
                  )}
                </td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-xs font-semibold text-gray-500">
                  No active transfer clearance codes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferCodeManager;
