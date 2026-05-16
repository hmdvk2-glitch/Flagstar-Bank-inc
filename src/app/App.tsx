import React, { useEffect, useState } from 'react';
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

/**
 * APP BOOT CONTROLLER (v5.1 — Non-Blocking)
 * 
 * The boot sequence runs in the background.
 * The app renders immediately — no blocking splash.
 * If hydration fails or times out, defaults to ANONYMOUS.
 */
const BOOT_TIMEOUT_MS = 3000;

const App: React.FC = () => {
  const { phase } = useAuthStore();

  useEffect(() => {
    // Race: hydration vs timeout — whichever finishes first wins
    let didResolve = false;

    const bootWithTimeout = async () => {
      const timeout = setTimeout(() => {
        if (!didResolve) {
          didResolve = true;
          authStore.reset(); // → ANONYMOUS
        }
      }, BOOT_TIMEOUT_MS);

      try {
        await hydrateSession();
        didResolve = true;
      } catch {
        authStore.reset(); // → ANONYMOUS
        didResolve = true;
      } finally {
        clearTimeout(timeout);
      }
    };

    bootWithTimeout();

    // LISTENER: React to future auth changes
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

  // During BOOTING, render the Home page anyway (non-blocking)
  // The state machine will redirect once identity resolves
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
