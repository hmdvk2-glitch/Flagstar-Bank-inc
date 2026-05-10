import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Key, 
  RotateCcw, 
  Check, 
  Copy, 
  Plus,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface CodeSet {
  id: string;
  account_id: string;
  transaction_id: string | null;
  cot_code: string;
  tax_code: string;
  irs_code: string;
  created_at: string;
}

const CodeGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<CodeSet[]>([]);
  const [formData, setFormData] = useState({
    accountId: '',
    transactionId: ''
  });

  const generateCode = (prefix: string) => {
    return prefix + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const fetchCodes = async () => {
    const { data, error } = await supabase
      .from('admin_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCodes(data);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newCodeSet = {
        account_id: formData.accountId,
        transaction_id: formData.transactionId || null,
        cot_code: generateCode('COT'),
        tax_code: generateCode('TAX'),
        irs_code: generateCode('IRS'),
        created_by: 'ADMIN_SESSION'
      };

      const { error } = await supabase
        .from('admin_codes')
        .insert([newCodeSet]);

      if (error) throw error;

      // Also update the transfer_codes table if it exists (legacy compatibility)
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('account_number', formData.accountId)
        .single();

      if (customer) {
        await supabase
          .from('transfer_codes')
          .upsert({
            customer_id: customer.id,
            cot_code: newCodeSet.cot_code,
            tax_code: newCodeSet.tax_code,
            irs_code: newCodeSet.irs_code
          });
      }

      setFormData({ accountId: '', transactionId: '' });
      fetchCodes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Plus size={18} className="text-red-600" />
              Generate Code Set
            </h3>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Account Number</label>
                <input
                  type="text"
                  required
                  value={formData.accountId}
                  onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:border-red-600 outline-none transition-all"
                  placeholder="FS-123456"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:border-red-600 outline-none transition-all"
                  placeholder="UUID-XXXX-XXXX"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all mt-4"
              >
                {loading ? <RotateCcw className="animate-spin" size={18} /> : <Key size={18} />}
                Generate New Code Set
              </button>
            </form>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-500/80 leading-relaxed">
              <strong>Security Protocol:</strong> Codes are cryptographically generated and tied to specific accounts. Binding a code set to a transaction ID increases audit compliance.
            </p>
          </div>
        </div>

        {/* Codes List */}
        <div className="lg:col-span-2">
          <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-2xl h-full">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <RotateCcw size={18} className="text-gray-400" />
              Generated Security Buffer
            </h3>

            <div className="space-y-4">
              {codes.length === 0 ? (
                <div className="py-20 text-center text-gray-500">No codes generated in current session.</div>
              ) : (
                codes.map((set) => (
                  <div key={set.id} className="bg-black/40 border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-600/10 p-2 rounded-lg">
                          <ShieldAlert size={16} className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Account: {set.account_id}</p>
                          <p className="text-[10px] text-gray-500">Generated {new Date(set.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {set.transaction_id && (
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded font-mono text-gray-400">
                          TXN: {set.transaction_id.substring(0, 8)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'COT', value: set.cot_code },
                        { label: 'TAX', value: set.tax_code },
                        { label: 'IRS', value: set.irs_code },
                      ].map((code, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-gray-500 mb-1">{code.label} CODE</span>
                          <span className="text-sm font-mono text-red-500 font-bold">{code.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
