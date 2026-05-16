import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  ShieldCheck, 
  LogOut,
  Plus,
  ArrowRightLeft,
  Shield,
  Search,
  CheckCircle,
  AlertCircle,
  UserPlus,
  History,
  Menu,
  X
} from 'lucide-react';
import AdminShield from './AdminShield';
import { adminLogic } from '../lib/admin';
import { useAuthStore } from '../store/authStore';
import { adminAuth } from '../auth/adminAuth';
import CustomerWizard from './CustomerWizard';
import AuditDashboard from './AuditDashboard';
import { supabase } from '../supabase/client';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TRANSACTIONS' | 'RESTRICTIONS' | 'AUDIT' | 'ADMINS'>('USERS');
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminLogic.getAllCustomers();
      setUsers(data);
      
      const { data: adminList } = await supabase.from('admins').select('*');
      if (adminList) {
        // Deduplicate by auth_user_id (Architecture Rule 4)
        const uniqueAdmins = Array.from(
          new Map(adminList.map(a => [a.auth_user_id, a])).values()
        );
        setAdmins(uniqueAdmins);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('admin-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admins' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = () => {
    adminAuth.logout();
  };

  return (
    <AdminShield>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#F9FAFB] text-[#111827]">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-100 z-50 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#C00000] p-2 rounded-lg shadow-sm">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tighter uppercase">Flagstar <span className="text-[#C00000]">Admin</span></h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-gray-50 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:flex w-full md:w-80 bg-white border-r border-gray-100 flex-col p-6 md:p-8 z-40 fixed md:sticky top-0 h-screen md:h-auto overflow-y-auto`}>
          <div className="mb-12 items-center gap-4 hidden md:flex">
            <div className="bg-[#C00000] p-3 rounded-2xl shadow-lg shadow-[#C00000]/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase">Flagstar <span className="text-[#C00000]">Admin</span></h1>
              <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase">Institutional Management</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'USERS', label: 'Customer Central', icon: <Users size={18} /> },
              { id: 'TRANSACTIONS', label: 'Ledger Control', icon: <ArrowRightLeft size={18} /> },
              { id: 'RESTRICTIONS', label: 'Security Protocols', icon: <ShieldCheck size={18} /> },
              { id: 'ADMINS', label: 'Staff Management', icon: <Shield size={18} /> },
              { id: 'AUDIT', label: 'Audit Log', icon: <History size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  activeTab === item.id 
                  ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#111827]'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="mt-8 w-full flex items-center gap-4 p-4 text-gray-400 hover:text-[#C00000] transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Terminate Session</span>
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-12 w-full max-w-screen-2xl mx-auto">
          {activeTab === 'USERS' && <CustomerManagement users={users} onUpdate={loadData} onStartWizard={() => setShowWizard(true)} />}
          {activeTab === 'TRANSACTIONS' && <LedgerControl users={users} onUpdate={loadData} adminId={user?.id} />}
          {activeTab === 'RESTRICTIONS' && <SecurityProtocols users={users} />}
          {activeTab === 'ADMINS' && <StaffManagement admins={admins} />}
          {activeTab === 'AUDIT' && <AuditDashboard />}
        </main>

        {/* Wizard Overlay */}
        {showWizard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl">
              <button onClick={() => setShowWizard(false)} className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                Cancel Provisioning <X size={16} />
              </button>
              <CustomerWizard onComplete={() => { setShowWizard(false); loadData(); }} onCancel={() => setShowWizard(false)} />
            </div>
          </div>
        )}
      </div>
    </AdminShield>
  );
};

const CustomerManagement: React.FC<{ users: any[], onUpdate: () => void, onStartWizard: () => void }> = ({ users, onUpdate, onStartWizard }) => {
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editingCustomer.full_name,
          account_number: editingCustomer.account_number
        })
        .eq('id', editingCustomer.id);

      if (error) throw error;
      setEditingCustomer(null);
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-slide-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Customer Central</h2>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em] font-black">Institutional Provisioning and Management</p>
        </div>
        <button onClick={onStartWizard} className="px-8 py-4 bg-[#C00000] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#C00000]/10 hover:bg-[#A00000] transition-all flex items-center gap-3">
          <UserPlus size={18} /> Launch Provisioning Wizard
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 font-bold text-sm">{u.full_name}</td>
                  <td className="px-6 py-5 font-mono text-xs text-gray-500">{u.account_number}</td>
                  <td className="px-6 py-5 font-black text-[#C00000]">${Number(u.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => setEditingCustomer(u)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6">
            <h3 className="text-xl font-bold">Edit Customer</h3>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <input className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold" value={editingCustomer.full_name} onChange={e => setEditingCustomer({...editingCustomer, full_name: e.target.value})} />
              <input className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-mono" value={editingCustomer.account_number} onChange={e => setEditingCustomer({...editingCustomer, account_number: e.target.value})} />
              <button disabled={saving} className="w-full bg-[#C00000] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                {saving ? 'Updating...' : 'Commit Changes'}
              </button>
              <button type="button" onClick={() => setEditingCustomer(null)} className="w-full text-gray-400 text-[10px] font-black uppercase">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const LedgerControl: React.FC<{ onUpdate: () => void, adminId?: string }> = ({ onUpdate }) => {
  const [pendingTxns, setPendingTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<Record<string, string>>({});

  const loadPending = async () => {
    const data = await adminService.getLedger();
    setPendingTxns(data.filter(t => t.status === 'PENDING'));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleVerify = async (txnId: string, stage: string) => {
    const code = codes[txnId];
    if (!code) {
      alert("Verification Code Required");
      return;
    }
    
    setLoading(true);
    try {
      await adminService.verifyStage(txnId, stage, code);
      alert(`Stage ${stage} Verified Successfully`);
      loadPending();
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-slide-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Transaction Verification Queue</h2>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em] font-black">Audit & Compliance Enforcement</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden mt-8">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stage</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Enforcement Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pendingTxns.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-8">
                  <p className="font-mono text-[10px] text-gray-400 mb-1">{t.id}</p>
                  <p className="font-bold text-sm">To: {t.to_account}</p>
                </td>
                <td className="px-6 py-8">
                  <p className="font-black text-lg text-[#111827]">${Number(t.amount).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{t.narration}</p>
                </td>
                <td className="px-6 py-8">
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">
                    {t.stage}
                  </span>
                </td>
                <td className="px-6 py-8">
                  <div className="flex flex-col items-end gap-4">
                    <input 
                      placeholder="Auth Code"
                      className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold w-32"
                      value={codes[t.id] || ''}
                      onChange={e => setCodes({...codes, [t.id]: e.target.value})}
                    />
                    <div className="flex gap-2">
                      {t.stage === 'PENDING' && (
                        <button onClick={() => handleVerify(t.id, 'COT_VERIFIED')} className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-all">Verify COT</button>
                      )}
                      {t.stage === 'COT_VERIFIED' && (
                        <button onClick={() => handleVerify(t.id, 'TAX_VERIFIED')} className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-all">Verify TAX</button>
                      )}
                      {t.stage === 'TAX_VERIFIED' && (
                        <button onClick={() => handleVerify(t.id, 'IRS_VERIFIED')} className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-all">Verify IRS</button>
                      )}
                      {t.stage === 'IRS_VERIFIED' && (
                        <button onClick={() => handleVerify(t.id, 'COMPLETED')} className="px-4 py-2 bg-[#C00000] text-white text-[10px] font-black uppercase rounded-lg hover:bg-[#A00000] transition-all">Complete Wire</button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {pendingTxns.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-sm">
                  No Pending Compliance Items Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SecurityProtocols: React.FC<{ users: any[] }> = ({ users }) => {
  const [selected, setSelected] = useState<any>(null);
  const [restrictions, setRestrictions] = useState<any>(null);

  useEffect(() => {
    if (selected) {
      supabase.from('transfer_codes').select('*').eq('user_id', selected.id).maybeSingle()
        .then(({data}) => setRestrictions(data));
    }
  }, [selected]);

  const toggle = async (field: string) => {
    if (!selected || !restrictions) return;
    const update = { [field]: !restrictions[field] };
    await adminLogic.updateRestrictions(selected.id, update);
    setRestrictions({...restrictions, ...update});
  };

  return (
    <div className="space-y-12 animate-slide-up">
      <h2 className="text-3xl font-bold tracking-tight uppercase">Security Protocols</h2>
      <select className="w-full bg-white border border-gray-100 rounded-2xl py-5 px-6 font-bold shadow-sm" onChange={(e) => setSelected(users.find(u => u.id === e.target.value))}>
        <option value="">Select Target Vault...</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.account_number})</option>)}
      </select>

      {selected && restrictions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {['cot', 'tax', 'irs'].map(p => (
            <div key={p} className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
              <p className="text-[10px] font-black uppercase mb-4">{p.toUpperCase()}</p>
              <button onClick={() => toggle(`${p}_enabled`)} className={`h-6 w-12 rounded-full relative ${restrictions[`${p}_enabled`] ? 'bg-[#C00000]' : 'bg-gray-100'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${restrictions[`${p}_enabled`] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StaffManagement: React.FC<{ admins: any[] }> = ({ admins }) => {
  return (
    <div className="space-y-12 animate-slide-up">
      <h2 className="text-3xl font-bold tracking-tight uppercase">Staff Management</h2>
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Identity</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Auth ID</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5 font-bold text-sm">{admin.full_name}</td>
                <td className="px-6 py-5 font-mono text-[10px] text-gray-400">{admin.auth_user_id}</td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full">ACTIVE</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
