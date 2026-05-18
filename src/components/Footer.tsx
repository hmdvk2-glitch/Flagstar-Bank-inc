import React from 'react';
import { Shield, Lock, Globe, Cpu, ShieldAlert, BadgeCheck } from 'lucide-react';
import AdminShield from './AdminShield';
import FlagstarLogo from './FlagstarLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-flagstar-slate border-t border-[#003B49] py-16 px-8 relative overflow-visible mt-auto text-white/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <FlagstarLogo className="h-8 w-8" textSize="text-xl" light={true} />
          </div>
          <p className="text-gray-400 text-xs leading-relaxed font-medium">
            Flagstar Bank, N.A. is a subsidiary of Flagstar Financial, Inc. Authorized under Federal Banking Charter Protocol 442-A.
          </p>
        </div>

        {/* Security & Support */}
        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F15A24]">Security Core</h5>
          <ul className="space-y-3 text-xs text-gray-300 font-semibold">
            <li className="flex items-center gap-2 hover:text-[#F15A24] cursor-pointer transition-colors">
              <Globe size={14} className="text-[#FFB81C]" /> 
              Global Clearing Networks
            </li>
            <li className="flex items-center gap-2 hover:text-[#F15A24] cursor-pointer transition-colors">
              <Cpu size={14} className="text-[#FFB81C]" /> 
              256-Bit SSL Encryption
            </li>
            <li className="flex items-center gap-2 hover:text-[#F15A24] cursor-pointer transition-colors">
              <Lock size={14} className="text-[#FFB81C]" /> 
              Secure Multi-Factor Gate
            </li>
          </ul>
        </div>

        {/* Quick Utilities */}
        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F15A24]">Mortgage Support</h5>
          <ul className="space-y-3 text-xs text-gray-300 font-semibold">
            <li className="hover:text-[#F15A24] cursor-pointer transition-colors">MyLoans Direct: 800-968-7700</li>
            <li className="hover:text-[#F15A24] cursor-pointer transition-colors">Paperless Enrollment Options</li>
            <li className="hover:text-[#F15A24] cursor-pointer transition-colors">Annual Tax Center (Form 1098)</li>
          </ul>
        </div>

        {/* Regulatory/FDIC Disclosures */}
        <div className="space-y-6">
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F15A24]">Legal Compliance</h5>
          <div className="text-[10px] text-gray-400 leading-relaxed font-black uppercase tracking-widest space-y-2">
            <p>Member FDIC. Equal Housing Lender.</p>
            <p className="normal-case tracking-normal font-medium text-gray-400">
              © 2026 Flagstar Financial, Inc. All rights reserved. Flagstar Bank, N.A.
            </p>
            <p className="normal-case tracking-normal font-semibold text-[#FFB81C] flex items-center gap-1.5 mt-1">
              <BadgeCheck size={12} /> Digital Assets Secured by Enterprise Shield v5.1
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 border-t border-[#003B49] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-gray-400">
          <span className="hover:text-[#F15A24] cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-[#F15A24] cursor-pointer transition-colors">Security Disclosures</span>
          <span className="hover:text-[#F15A24] cursor-pointer transition-colors">Terms & Accessibility</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-flagstar-green shadow-[0_0_10px_rgba(132,189,0,0.4)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Integrity: 100% Deterministic</span>
        </div>
      </div>

      {/* FIXED CONTROL NODE FORrestricted ACCESS SYSTEM */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AdminShield />
      </div>
    </footer>
  );
};

export default Footer;
