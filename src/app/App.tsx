import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, authStore } from '../store/authStore';
import { hydrateSession } from '../auth/session';
import { supabase } from '../supabase/client';
import Login from '../customer/Login';
import Home from './Home';
import Dashboard from '../customer/Dashboard';
import AdminDashboard from '../admin/AdminDashboard';
import SetupWizardPage from '../admin/SetupWizardPage';
import Footer from '../components/Footer';
import { AdminRoute, CustomerRoute } from '../guards/RoleGuards';
import { Shield } from 'lucide-react';

/**
 * APP BOOT CONTROLLER (v5.0 Deterministic)
 * 
 * Boot Sequence:
 *   1. App mounts → BOOTING phase
 *   2. hydrateSession() → resolves identity
 *   3. onAuthStateChange → listens for future transitions
 *   4. Route resolves based on phase
 */
const App: React.FC = () => {
  const { isBooting } = useAuthStore();

  useEffect(() => {
    // BOOT: Initial session hydration
    hydrateSession();

    // LISTENER: React to future auth changes (login/logout from other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await hydrateSession();
        }
        if (event === 'SIGNED_OUT') {
          authStore.reset();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // BOOTING: Show institutional splash while state machine initializes
  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-6">
        <div className="bg-[#C00000]/5 p-8 rounded-[3rem] border border-[#C00000]/10 shadow-2xl shadow-[#C00000]/5 animate-pulse">
          <Shield size={48} className="text-[#C00000]" />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
          Initializing Secure Environment
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans selection:bg-[#C00000]/10">
        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />

            {/* Admin Shield (Hardened) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/setup-wizard" element={<SetupWizardPage />} />
            </Route>

            {/* Customer Terminal (Hardened) */}
            <Route element={<CustomerRoute />}>
              <Route path="/customer/dashboard" element={<Dashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
