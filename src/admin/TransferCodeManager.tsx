import React, { useEffect, useState } from 'react';
import { fetchAllTransferCodes } from '../services/adminService';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const TransferCodeManager: React.FC = () => {
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

  if (loading) return <div>Loading codes...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Transfer Codes</h2>
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-500 text-sm">
          <tr>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Code ID</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {codes.map(c => (
            <tr key={c.id} className="text-sm">
              <td className="px-6 py-4 font-medium">{c.customers?.name || 'Unknown'}</td>
              <td className="px-6 py-4 font-mono text-xs">{c.id}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {c.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {c.status === 'ACTIVE' && (
                  <button onClick={() => revokeCode(c.id)} className="text-red-600 hover:text-red-800 font-medium">Revoke</button>
                )}
              </td>
            </tr>
          ))}
          {codes.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No transfer codes found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default TransferCodeManager;
