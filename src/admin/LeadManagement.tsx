import React, { useEffect, useState } from 'react';
import { fetchAllFunnelInteractions } from '../services/funnelService';
import toast from 'react-hot-toast';
import { Users, FileText, Calendar, Database } from 'lucide-react';

interface LeadManagementProps {
  isDarkMode?: boolean;
}

const LeadManagement: React.FC<LeadManagementProps> = ({ isDarkMode = true }) => {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = async () => {
    try {
      const data = await fetchAllFunnelInteractions();
      setInteractions(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch interaction leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  if (loading) {
    return (
      <div className={`p-8 text-center text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Hydrating lead interaction database...
      </div>
    );
  }

  const containerBg = isDarkMode ? 'bg-gray-900/60 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-950';
  const headerBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200';
  const theadBg = isDarkMode ? 'bg-gray-950/60 text-gray-400 border-b border-gray-800' : 'bg-gray-50 text-gray-500 border-b border-gray-200';
  const divideColor = isDarkMode ? 'divide-gray-800' : 'divide-gray-100';

  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 ${containerBg}`}>
      
      {/* Premium Header */}
      <div className={`px-6 py-5 border-b flex justify-between items-center ${headerBg}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Lead & Product Interactions</h2>
            <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
              Track live user calculator logs and Specs across the 7 product channels.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={`text-[10px] font-black uppercase tracking-wider ${theadBg}`}>
            <tr>
              <th className="px-6 py-4">Client Prospect</th>
              <th className="px-6 py-4">Product Funnel</th>
              <th className="px-6 py-4">Specifications Dossier</th>
              <th className="px-6 py-4">Logged Date</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${divideColor}`}>
            {interactions.map((item) => (
              <tr key={item.id} className={`text-xs ${isDarkMode ? 'hover:bg-gray-800/20' : 'hover:bg-gray-50/50'} transition`}>
                <td className="px-6 py-4">
                  {item.customers ? (
                    <div className="space-y-1">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.customers.name}</p>
                      <p className={`text-[10px] font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.customers.email}</p>
                    </div>
                  ) : (
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Anonymous Prospect</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                    isDarkMode ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {item.funnel_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <pre className={`text-[11px] p-3 rounded-xl border font-mono max-h-36 overflow-y-auto max-w-md whitespace-pre-wrap leading-tight ${
                    isDarkMode ? 'bg-gray-950/60 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'
                  }`}>
                    {JSON.stringify(item.interaction_data, null, 2)}
                  </pre>
                </td>
                <td className="px-6 py-4 font-mono text-[10px] tracking-tight">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            {interactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-xs font-semibold text-gray-500">
                  No submissions or lead interactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadManagement;
