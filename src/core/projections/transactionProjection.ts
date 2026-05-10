import { TransactionReducer, TransactionState } from '../reducers/transactionReducer';
import { TransactionEvent } from '../events/eventTypes';
import { EventStore } from '../events/eventStore';

export const TransactionProjection = {
  /**
   * Build UI-ready state for a single transaction
   */
  async build(transactionId: string): Promise<TransactionState> {
    const events = await EventStore.getEvents(transactionId);
    return TransactionReducer.reduce(events);
  },

  /**
   * Build projection from a provided event stream (offline/local)
   */
  buildFromStream(events: TransactionEvent[]): TransactionState {
    return TransactionReducer.reduce(events);
  }
};
