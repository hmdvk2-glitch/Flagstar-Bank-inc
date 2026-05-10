import { EventStore } from './eventStore';
import { TransactionEvent } from './eventTypes';

export const EventBus = {
  /**
   * Emit an event: Persist to store and notify listeners
   */
  async emit(event: TransactionEvent) {
    console.log(`[EVENT_BUS] Emitting: ${event.type}`, event);
    
    // 1. Persist to immutable store
    await EventStore.append(event);
    
    // 2. Trigger downstream side-effects (e.g., updating transaction table for faster reads)
    // This part bridges the Event Sourcing with the existing Projection tables
    console.log(`[EVENT_BUS] Persisted: ${event.type}`);
  },

  /**
   * Batch emit for complex operations
   */
  async emitAll(events: TransactionEvent[]) {
    for (const event of events) {
      await this.emit(event);
    }
  }
};
