import React, { useState } from 'react';
import { Send, Shield, ArrowRight, AlertCircle, RefreshCcw, Lock } from 'lucide-react';
import { EventBus } from '../core/events/eventBus';
import { TransactionProjection } from '../core/projections/transactionProjection';
import { TransactionState } from '../core/reducers/transactionReducer';
import { supabase } from '../supabase/client';

interface TransferUIProps {
  onComplete: () => void;
}

const TransferUI: React.FC<TransferUIProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [state, setState] = useState<TransactionState | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    description: ''
  });

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // In a real event-sourced system, we'd have a command handler.
      // Here we simulate the command by creating the record AND the event.
      const tempId = crypto.randomUUID();
      
      await EventBus.emit({
        transactionId: tempId,
        type: 'TRANSACTION_CREATED',
        payload: { ...formData, customerId: user?.id },
        timestamp: Date.now(),
        actor: 'CUSTOMER'
      });

      setTransactionId(tempId);
      const initialState = await TransactionProjection.build(tempId);
      setState(initialState);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!transactionId || !state) return;
    setLoading(true);
    setError(null);
    
    try {
      // Determine event type based on current derived state
      let eventType: any;
      if (state.stage === 'PENDING') eventType = 'COT_VERIFIED';
      else if (state.stage === 'COT_VERIFIED') eventType = 'TAX_VERIFIED';
      else if (state.stage === 'TAX_VERIFIED') eventType = 'IRS_VERIFIED';
      else if (state.stage === 'IRS_VERIFIED') eventType = 'COMPLETED';

      if (!eventType) throw new Error('NO_VALID_TRANSITION');

      await EventBus.emit({
        transactionId,
        type: eventType,
        timestamp: Date.now(),
        actor: 'CUSTOMER'
      });

      // Rebuild state from events (Projections)
      const newState = await TransactionProjection.build(transactionId);
      setState(newState);
      setCode('');

      if (newState.stage === 'COMPLETED') {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[#111] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="bg-red-600/10 border-b border-white/5 p-8 flex items-center gap-4">
          <div className="bg-red-600 p-3 rounded-2xl"><Send size={24} /></div>
          <div>
            <h3 className="text-xl font-bold">Global Fund Transfer</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Event-Sourced Protocol v3.0</p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleInitiate} className="p-10 space-y-8">
            <div className="space-y-6">
              <input
                type="text"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 focus:border-red-600 outline-none transition-all"
                placeholder="Recipient Name"
                onChange={e => setFormData({...formData, recipient: e.target.value})}
              />
              <input
                type="number"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 focus:border-red-600 outline-none transition-all text-xl"
                placeholder="0.00"
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <button disabled={loading} className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3">
              {loading ? <RefreshCcw className="animate-spin" /> : <span>Initiate Event Stream</span>}
            </button>
          </form>
        ) : (
          <div className="p-10 text-center space-y-10 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <Lock size={32} className="text-amber-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Auth Required</h3>
              <p className="text-gray-500 text-sm mt-2 font-mono text-[10px]">DERIVED_STATE: {state?.stage}</p>
            </div>

            <div className="max-w-sm mx-auto space-y-6">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-black border-2 border-amber-500/30 rounded-2xl py-6 px-6 text-center text-3xl font-black text-amber-500 outline-none"
                placeholder="CODE-XXXX"
              />
              <button onClick={handleVerify} disabled={loading || !code} className="w-full bg-amber-500 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3">
                {loading ? <RefreshCcw className="animate-spin" /> : <span>Verify & Append Event</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferUI;
