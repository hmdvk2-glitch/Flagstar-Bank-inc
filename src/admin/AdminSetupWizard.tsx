import React, { useState } from 'react';
import { adminAuth } from '../auth/adminAuth';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const AdminSetupWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminAuth.setup(email, pin, name);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-12 space-y-8">
        <div className="flex justify-center">
          <div className="bg-[#C00000]/10 p-6 rounded-full">
            <ShieldCheck className="text-[#C00000] h-12 w-12" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">System Initialization</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Create Root Administrator</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required type="text" placeholder="Admin Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 outline-none focus:border-[#C00000]" />
          <input required type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 outline-none focus:border-[#C00000]" />
          <input required type="password" placeholder="Secure Password (PIN)" value={pin} onChange={e => setPin(e.target.value)} className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 outline-none focus:border-[#C00000]" />
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          <button disabled={loading} className="w-full bg-[#C00000] text-white font-black uppercase tracking-widest py-6 rounded-2xl hover:bg-[#A00000] flex justify-center items-center gap-3">
            {loading ? 'Initializing...' : <>Initialize Core <ArrowRight size={18}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSetupWizard;
