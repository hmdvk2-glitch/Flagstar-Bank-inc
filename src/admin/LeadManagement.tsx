import React, { useEffect, useState } from 'react';
import { fetchAllFunnelInteractions } from '../services/funnelService';
import toast from 'react-hot-toast';

const LeadManagement: React.FC = () => {
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

  if (loading) return <div className="text-gray-500 font-bold text-sm">Hydrating lead database...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-gray-950">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Lead & Product Interactions</h2>
        <p className="text-xs text-gray-400 mt-0.5">Track user submissions across the 7 dynamic product funnels.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Product Funnel</th>
              <th className="px-6 py-3">Specifications</th>
              <th className="px-6 py-3">Logged Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {interactions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-semibold">
                  {item.customers ? (
                    <div>
                      <p className="text-gray-900">{item.customers.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.customers.email}</p>
                    </div>
                  ) : (
                    <span className="text-gray-400">Anonymous Prospect</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs font-bold font-mono">
                    {item.funnel_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <pre className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono max-h-36 overflow-y-auto max-w-md whitespace-pre-wrap leading-tight text-gray-700">
                    {JSON.stringify(item.interaction_data, null, 2)}
                  </pre>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                  {new Date(item.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {interactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-semibold">
                  No submissions or lead profiles recorded yet.
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
