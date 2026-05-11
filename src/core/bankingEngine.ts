export const BankingEngine = {
  /**
   * Simple balance validation for simulation
   */
  validateTransfer(currentBalance: number, amount: number): { allowed: boolean; error?: string } {
    if (amount <= 0) return { allowed: false, error: 'INVALID_AMOUNT' };
    if (amount > currentBalance) return { allowed: false, error: 'INSUFFICIENT_FUNDS' };
    return { allowed: true };
  },

  /**
   * Generate a random account number
   */
  generateAccountNumber(): string {
    return 'FS-' + Math.floor(100000 + Math.random() * 900000);
  }
};
