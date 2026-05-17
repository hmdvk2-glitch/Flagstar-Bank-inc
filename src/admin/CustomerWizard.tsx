import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { adminCreateCustomer, adminInsertTransaction, adminCreateTransferCode } from '../services/adminService';
import toast from 'react-hot-toast';
import { supabase } from '../supabase/client';

const CustomerWizard: React.FC = () => {
  const admin = useAppStore((state) => state.admin);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [createdCustomer, setCreatedCustomer] = useState<{ id?: string, account_number: string } | null>(null);

  // Step 2
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txToAccount, setTxToAccount] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txNarration, setTxNarration] = useState('');

  // Step 3
  const [cot, setCot] = useState('');
  const [tax, setTax] = useState('');
  const [irs, setIrs] = useState('');
  const [createdCodeId, setCreatedCodeId] = useState<string | null>(null);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    setLoading(true);
    try {
      const account_number = await adminCreateCustomer(admin.id, name, email, pin);
      const { data } = await supabase.from('customers').select('id').eq('account_number', account_number).single();
      if (data) {
        setCreatedCustomer({ id: data.id, account_number });
        toast.success('Customer created successfully');
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!createdCustomer?.id || !admin) return;
    setLoading(true);
    try {
      const newTx = await adminInsertTransaction({
        customer_id: createdCustomer.id,
        to_account: txToAccount,
        amount: parseFloat(txAmount),
        narration: txNarration,
        stage: 'PENDING',
        status: 'PENDING',
        acted_by_role: 'admin',
        // other fields will be null
      });
      setTransactions([...transactions, newTx]);
      setTxToAccount('');
      setTxAmount('');
      setTxNarration('');
      toast.success('Transaction added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdCustomer?.id || !admin) return;
    setLoading(true);
    try {
      const codeId = await adminCreateTransferCode(admin.id, createdCustomer.id, cot, tax, irs, 7);
      setCreatedCodeId(codeId);
      toast.success('Transfer code created');
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create code');
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setName('');
    setEmail('');
    setPin('');
    setCreatedCustomer(null);
    setTransactions([]);
    setCot('');
    setTax('');
    setIrs('');
    setCreatedCodeId(null);
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Customer Setup Wizard</h2>
        <div className="text-sm font-medium text-gray-500">Step {step} of 4</div>
      </div>
      
      <div className="p-6">
        {step === 1 && (
          <form onSubmit={handleCreateCustomer} className="space-y-4 max-w-md">
            <h3 className="text-xl font-semibold mb-4">1. Customer Details</h3>
            <input required placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
            <input required type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
            <input required placeholder="PIN (4-6 digits)" maxLength={6} value={pin} onChange={e=>setPin(e.target.value)} className="w-full p-2 border rounded" />
            <button disabled={loading} type="submit" className="w-full py-2 bg-red-600 text-white rounded font-medium">
              Create Customer
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">2. Setup Initial Transactions</h3>
            <div className="p-4 bg-blue-50 text-blue-800 rounded">
              Customer created! Account Number: <strong>{createdCustomer?.account_number}</strong>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <input placeholder="To Account" value={txToAccount} onChange={e=>setTxToAccount(e.target.value)} className="p-2 border rounded col-span-1" />
              <input type="number" placeholder="Amount" value={txAmount} onChange={e=>setTxAmount(e.target.value)} className="p-2 border rounded col-span-1" />
              <input placeholder="Narration" value={txNarration} onChange={e=>setTxNarration(e.target.value)} className="p-2 border rounded col-span-1" />
              <button disabled={loading} onClick={handleAddTransaction} className="bg-gray-900 text-white rounded px-4">Add</button>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Added Transactions</h4>
              {transactions.length === 0 ? <p className="text-sm text-gray-500">None added yet.</p> : (
                <ul className="space-y-2">
                  {transactions.map(t => (
                    <li key={t.id} className="text-sm border p-2 rounded">${t.amount} to {t.to_account} ({t.narration})</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setStep(3)} className="py-2 px-6 bg-red-600 text-white rounded font-medium">Continue to Codes</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleCreateCode} className="space-y-4 max-w-md">
            <h3 className="text-xl font-semibold mb-4">3. Assign Transfer Codes</h3>
            <input required placeholder="COT Code" value={cot} onChange={e=>setCot(e.target.value)} className="w-full p-2 border rounded" />
            <input required placeholder="TAX Code" value={tax} onChange={e=>setTax(e.target.value)} className="w-full p-2 border rounded" />
            <input required placeholder="IRS Code" value={irs} onChange={e=>setIrs(e.target.value)} className="w-full p-2 border rounded" />
            <button disabled={loading} type="submit" className="w-full py-2 bg-red-600 text-white rounded font-medium">
              Generate Transfer Code
            </button>
            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(4)} className="text-sm text-gray-500 underline">Skip</button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-600">4. Setup Complete</h3>
            <div className="p-4 border rounded bg-gray-50 space-y-2">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Account Number:</strong> {createdCustomer?.account_number}</p>
              <p><strong>PIN:</strong> {pin}</p>
              {createdCodeId && <p><strong>Transfer Code ID:</strong> {createdCodeId}</p>}
            </div>
            <button onClick={resetWizard} className="py-2 px-6 bg-gray-900 text-white rounded font-medium">Start New Setup</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerWizard;
