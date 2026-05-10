import { supabase } from '../../supabase/client';
import { TransactionEvent } from './eventTypes';

export const EventStore = {
  /**
   * Append a new event to the immutable ledger
   */
  async append(event: TransactionEvent) {
    const { error } = await supabase.from('ledger').insert({
      transaction_id: event.transactionId,
      type: event.type,
      payload: event.payload,
      actor: event.actor,
      created_at: new Date(event.timestamp).toISOString(),
    });

    if (error) {
      console.error('[EVENT_STORE] Failed to append event:', error);
      throw error;
    }
  },

  /**
   * Fetch all events for a specific transaction to replay state
   */
  async getEvents(transactionId: string): Promise<TransactionEvent[]> {
    const { data, error } = await supabase
      .from('ledger')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      transactionId: row.transaction_id,
      type: row.type as any,
      payload: row.payload,
      timestamp: new Date(row.created_at).getTime(),
      actor: row.actor
    }));
  }
};
