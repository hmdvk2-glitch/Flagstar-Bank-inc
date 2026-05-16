import React from 'react';
import CustomerWizard from './CustomerWizard';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

/**
 * SETUP WIZARD PAGE (v5.0)
 * 
 * Mandatory provisioning gateway.
 * Route: /admin/setup-wizard
 * 
 * Purpose:
 *   - Customer creation
 *   - Account provisioning
 *   - 3-code transfer security initialization
 * 
 * This page is only accessible after admin validation (AdminRoute guard).
 */
const SetupWizardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C00000]/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C00000]/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="mb-8 flex items-center gap-4 z-10">
        <div className="bg-[#C00000] p-3 rounded-2xl shadow-lg shadow-[#C00000]/20">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter uppercase">Flagstar <span className="text-[#C00000]">Admin</span></h1>
          <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase">Institutional Provisioning Gateway</p>
        </div>
      </div>

      <div className="z-10 w-full max-w-2xl">
        <CustomerWizard
          onComplete={() => navigate('/admin/dashboard', { replace: true })}
          onCancel={() => navigate('/admin/dashboard', { replace: true })}
        />
      </div>

      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mt-8 z-10 text-gray-400 hover:text-[#C00000] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
      >
        Skip to Dashboard <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default SetupWizardPage;
