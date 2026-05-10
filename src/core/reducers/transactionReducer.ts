import { TransactionEvent, TransactionEventType } from '../events/eventTypes';

export type TransactionStage =
  | 'PENDING'
  | 'COT_VERIFIED'
  | 'TAX_VERIFIED'
  | 'IRS_VERIFIED'
  | 'COMPLETED'
  | 'REJECTED';

export interface TransactionState {
  id: string;
  stage: TransactionStage;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  metadata: any;
  lastUpdate: number;
}

export const TransactionReducer = {
  /**
   * Derive current state from an event stream
   */
  reduce(events: TransactionEvent[]): TransactionState {
    let state: TransactionState = {
      id: '',
      stage: 'PENDING',
      status: 'PENDING',
      metadata: {},
      lastUpdate: 0
    };

    // Sort events by timestamp to ensure correct replay sequence
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

    for (const event of sortedEvents) {
      state.lastUpdate = event.timestamp;

      switch (event.type) {
        case 'TRANSACTION_CREATED':
          state.id = event.transactionId;
          state.stage = 'PENDING';
          state.status = 'PENDING';
          state.metadata = event.payload || {};
          break;

        case 'COT_VERIFIED':
          state.stage = 'COT_VERIFIED';
          break;

        case 'TAX_VERIFIED':
          state.stage = 'TAX_VERIFIED';
          break;

        case 'IRS_VERIFIED':
          state.stage = 'IRS_VERIFIED';
          break;

        case 'COMPLETED':
          state.stage = 'COMPLETED';
          state.status = 'APPROVED';
          break;

        case 'REJECTED':
          state.stage = 'REJECTED';
          state.status = 'REJECTED';
          break;
      }
    }

    return state;
  },
};
