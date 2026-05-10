export interface BalanceCheck {
  isAllowed: boolean;
  remainingBalance: number;
  error?: string;
}

export const BankingEngine = {
  /**
   * Validate if a withdrawal/transfer is allowed
   */
  validateTransaction(currentBalance: number, amount: number, minBalance: number = 0): BalanceCheck {
    if (amount <= 0) {
      return { isAllowed: false, remainingBalance: currentBalance, error: 'INVALID_AMOUNT' };
    }

    const projectedBalance = currentBalance - amount;
    
    if (projectedBalance < minBalance) {
      return { 
        isAllowed: false, 
        remainingBalance: currentBalance, 
        error: 'INSUFFICIENT_FUNDS' 
      };
    }

    return { 
      isAllowed: true, 
      remainingBalance: projectedBalance 
    };
  },

  /**
   * Calculate interest (simulation placeholder)
   */
  calculateInterest(balance: number, rate: number): number {
    return balance * (rate / 100);
  }
};
