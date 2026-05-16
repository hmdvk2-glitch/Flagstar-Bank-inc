import { useContext } from 'react';
import { AuthContext, AuthState } from '../context/AuthContext';

/**
 * useAuth() — The ONLY way components should access auth state.
 *
 * Usage:
 *   const { user, isAdmin, isAuthenticated, login, logout } = useAuth();
 *
 * Rules:
 *   - NEVER read localStorage in components
 *   - NEVER query Supabase auth directly
 *   - NEVER infer roles from email or other fields
 */
export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
