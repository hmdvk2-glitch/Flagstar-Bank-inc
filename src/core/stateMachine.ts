export type TransactionStage = 'PENDING' | 'COT VERIFIED' | 'TAX VERIFIED' | 'IRS VERIFIED' | 'COMPLETED' | 'REJECTED';

export interface StateTransition {
  from: TransactionStage;
  to: TransactionStage;
  label: string;
}

export const TRANSACTION_LIFECYCLE: StateTransition[] = [
  { from: 'PENDING', to: 'COT VERIFIED', label: 'Verify COT' },
  { from: 'COT VERIFIED', to: 'TAX VERIFIED', label: 'Verify TAX' },
  { from: 'TAX VERIFIED', to: 'IRS VERIFIED', label: 'Verify IRS' },
  { from: 'IRS VERIFIED', to: 'COMPLETED', label: 'Complete Transaction' },
];

export const StateMachine = {
  /**
   * Get the next logical stage for a transaction
   */
  getNextStage(currentStage: TransactionStage): TransactionStage {
    const transition = TRANSACTION_LIFECYCLE.find(t => t.from === currentStage);
    if (!transition) {
      if (currentStage === 'COMPLETED') throw new Error('TRANSACTION_ALREADY_COMPLETED');
      throw new Error(`NO_VALID_TRANSITION_FROM_${currentStage}`);
    }
    return transition.to;
  },

  /**
   * Validate if a transition is allowed (for manual overrides)
   */
  isValidTransition(from: TransactionStage, to: TransactionStage): boolean {
    if (to === 'REJECTED') return true;
    const transition = TRANSACTION_LIFECYCLE.find(t => t.from === from && t.to === to);
    return !!transition;
  },

  /**
   * Determine the status based on the stage
   */
  getStatusForStage(stage: TransactionStage): 'PENDING' | 'APPROVED' | 'REJECTED' {
    if (stage === 'COMPLETED') return 'APPROVED';
    if (stage === 'REJECTED') return 'REJECTED';
    return 'PENDING';
  }
};
