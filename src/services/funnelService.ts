import { supabase } from '../supabase/client';

export const saveFunnelInteraction = async (customerId: string | null, funnelName: string, interactionData: any) => {
  if (customerId) {
    const { data, error } = await supabase.rpc('save_funnel_interaction', {
      p_customer_id: customerId,
      p_funnel_name: funnelName,
      p_interaction_data: interactionData
    });
    if (error) throw error;
    return data;
  } else {
    // Store in localStorage for non-logged in users
    const existing = localStorage.getItem('funnel_interactions');
    const list = existing ? JSON.parse(existing) : [];
    list.push({ funnelName, interactionData, timestamp: new Date().toISOString() });
    localStorage.setItem('funnel_interactions', JSON.stringify(list));
    return 'local_success';
  }
};

export const fetchAllFunnelInteractions = async () => {
  const { data, error } = await supabase
    .from('funnel_interactions')
    .select('*, customers(name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
