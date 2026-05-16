import React, { useEffect, useState } from 'react';
import { useAuthStore, authStore } from '../store/authStore';
import { hydrateSession } from '../auth/session';
import { supabase } from '../supabase/client';
import { StateMachine } from '../engine/StateMachine';
import { useAppState } from '../engine/UIEngine';

// Screens
import Login from '../customer/Login';
import Home from './Home';
import Dashboard from '../customer/Dashboard';
import AdminDashboard from '../admin/AdminDashboard';
import SetupWizardPage from '../admin/SetupWizardPage';
import Footer from '../components/Footer';

/**
 * APP BOOT CONTROLLER & ROUTER (v6.0 — Single Control Point)
 * 
 * The single source of truth for all application routing and rendering.
 * No react-router-dom allowed.
 */
const BOOT_TIMEOUT_MS = 3000;

// 1. SINGLE BOOTSTRAP DISPATCHER
function activateStateFlow() {
  const path = window.location.hash.replace('#', '') || '/';
  const state = StateMachine.resolveRoute(path);
  StateMachine.transition(state || 'PUBLIC_HOME');
}

// 2. SINGLE ROUTE LISTENER
window.addEventListener('hashchange', () => {
  const path = window.location.hash.replace('#', '');
  const state = StateMachine.resolveRoute(path);
  if (state) StateMachine.transition(state);
});

const App: React.FC = () => {
  const { phase } = useAuthStore();
  const appState = useAppState();

  useEffect(() => {
    // Initialize routing engine
    activateStateFlow();

    // Race: hydration vs timeout
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

  // Sync Auth Phase -> State Machine (Enforce Route Guards natively)
  useEffect(() => {
    // If not booted yet, we allow rendering whatever state we are in (non-blocking)
    if (phase === 'BOOTING') return;

    // Guard: Admin Routes
    if (appState === 'ADMIN_DASHBOARD' || appState === 'ADMIN_SETUP_WIZARD') {
      if (phase !== 'ADMIN_READY') {
        StateMachine.transition(phase === 'CUSTOMER_READY' ? 'CUSTOMER_DASHBOARD' : 'AUTH_LOGIN');
      }
    }

    // Guard: Customer Routes
    if (appState === 'CUSTOMER_DASHBOARD') {
      if (phase !== 'CUSTOMER_READY') {
        StateMachine.transition(phase === 'ADMIN_READY' ? 'ADMIN_DASHBOARD' : 'AUTH_LOGIN');
      }
    }

    // Guard: Login Route (Redirect away if already logged in)
    if (appState === 'AUTH_LOGIN') {
      if (phase === 'ADMIN_READY') StateMachine.transition('ADMIN_DASHBOARD');
      if (phase === 'CUSTOMER_READY') StateMachine.transition('CUSTOMER_DASHBOARD');
    }
  }, [appState, phase]);

  const renderCurrentState = () => {
    switch (appState) {
      case 'PUBLIC_HOME':
        return <Home />;
      case 'AUTH_LOGIN':
        return <Login />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard />;
      case 'ADMIN_SETUP_WIZARD':
        return <SetupWizardPage />;
      case 'CUSTOMER_DASHBOARD':
        return <Dashboard />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans selection:bg-[#C00000]/10">
      <div className="flex-1">
        {renderCurrentState()}
      </div>
      <Footer />
    </div>
  );
};

export default App;
