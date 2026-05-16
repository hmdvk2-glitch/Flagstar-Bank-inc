import React from 'react';
import { Shield, Lock, Globe, Cpu } from 'lucide-react';
import AdminShield from '../admin/AdminShield';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 px-8 relative overflow-visible mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#C00000] p-2 rounded-xl text-white">
              <Shield size={20} />
            </div>
            <h4 className="text-xl font-bold tracking-tighter uppercase text-[#111827]">Flagstar <span className="text-[#C00000]">Bank</span></h4>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed font-medium">
            Global Liquidity Provisioning and Asset Management Core. Authorized by Federal Banking Protocol 442-A.
          </p>
        </div>

        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Infrastructure</h5>
          <ul className="space-y-3 text-xs text-gray-500 font-bold">
            <li className="flex items-center gap-2 hover:text-[#C00000] cursor-pointer transition-colors"><Globe size={14} className="text-[#C00000]" /> Global Network</li>
            <li className="flex items-center gap-2 hover:text-[#C00000] cursor-pointer transition-colors"><Cpu size={14} className="text-[#C00000]" /> Vault Security</li>
            <li className="flex items-center gap-2 hover:text-[#C00000] cursor-pointer transition-colors"><Lock size={14} className="text-[#C00000]" /> AES-256 Protocol</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Verification Engine</h5>
          <ul className="space-y-3 text-xs text-gray-500 font-bold">
            <li className="hover:text-[#C00000] cursor-pointer transition-colors">COT Compliance</li>
            <li className="hover:text-[#C00000] cursor-pointer transition-colors">TAX Verification</li>
            <li className="hover:text-[#C00000] cursor-pointer transition-colors">IRS Clearing</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Legal Compliance</h5>
          <p className="text-[10px] text-gray-400 leading-relaxed font-black uppercase tracking-widest">
            Member FDIC. Equal Housing Lender. © 2026 Flagstar Financial Inc. All rights reserved. 
            Digital Asset protection via Enterprise Shield.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-gray-400">
          <span className="hover:text-[#C00000] cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-[#C00000] cursor-pointer transition-colors">Security Statement</span>
          <span className="hover:text-[#C00000] cursor-pointer transition-colors">Accessibility</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Integrity: 100% Deterministic</span>
        </div>
      </div>

      {/* ENTERPRISE ADMIN SHIELD — FIXED CONTROL NODE (v5.0) */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AdminShield />
      </div>
    </footer>
  );
};

export default Footer;
