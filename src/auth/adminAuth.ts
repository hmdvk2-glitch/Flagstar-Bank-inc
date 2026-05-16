import { supabase } from '../supabase/client';
import { clearSession, hydrateSession } from './session';
import { authStore } from '../store/authStore';

export const adminAuth = {
  login: async (email: string, pin: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
    if (error) throw error;
    await hydrateSession();
  },
  
  setup: async (email: string, pin: string, name: string) => {
    // Check if system is already initialized (Admin exists)
    const { count } = await supabase.from('admins').select('*', { count: 'exact', head: true });
    if (count && count > 0) throw new Error("System is already initialized.");

    // Create Supabase Auth user
    const { data, error } = await supabase.auth.signUp({ email, password: pin });
    if (error) throw error;
    
    if (data.user) {
      // Create admin record in admins table (Authorization Truth)
      const { error: insertError } = await supabase.from('admins').insert({
        auth_user_id: data.user.id,
        email,
        full_name: name,
        permissions: { super_admin: true }
      });
      if (insertError) throw insertError;
      
      await hydrateSession();
    }
  },

  logout: async () => {
    await clearSession();
  }
};
