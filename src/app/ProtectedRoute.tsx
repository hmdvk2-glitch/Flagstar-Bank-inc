import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute — Guards routes based on auth state.
 *
 * Usage:
 *   <ProtectedRoute>              — requires authentication
 *   <ProtectedRoute requireAdmin> — requires admin role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // Not authenticated — show login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
        <div className="bg-red-600/10 p-10 rounded-[3.5rem] border border-red-600/20 mb-10 shadow-2xl shadow-red-600/10">
          <Lock className="h-24 w-24 text-red-600" />
        </div>
        <h1 className="text-6xl font-bold tracking-tighter mb-4">401</h1>
        <p className="text-xl font-medium text-gray-500 mb-12 uppercase tracking-[0.2em]">Authentication Required</p>
        <button
          onClick={() => window.location.hash = '#/'}
          className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-red-600/30"
        >
          Return to Gateway
        </button>
      </div>
    );
  }

  // Admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
        <div className="bg-red-600/10 p-10 rounded-[3.5rem] border border-red-600/20 mb-10 shadow-2xl shadow-red-600/10">
          <Lock className="h-24 w-24 text-red-600" />
        </div>
        <h1 className="text-6xl font-bold tracking-tighter mb-4">403</h1>
        <p className="text-xl font-medium text-gray-500 mb-12 uppercase tracking-[0.2em]">Restricted Administrative Area</p>
        <button
          onClick={() => window.location.hash = '#/'}
          className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-red-600/30"
        >
          Return to Terminal
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
