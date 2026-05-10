export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number;
  type: 'credit' | 'debit';
  balanceAfter: number;
  hash: string;
  createdAt: string;
}

export const LedgerEngine = {
  /**
   * Seal a transaction into the ledger format
   */
  seal(transaction: any, previousHash: string = '0'): LedgerEntry {
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      transactionId: transaction.id,
      accountId: transaction.account_id,
      amount: transaction.amount,
      type: transaction.type,
      balanceAfter: transaction.balanceAfter,
      createdAt: new Date().toISOString(),
      hash: ''
    };

    // Deterministic hashing simulation
    entry.hash = this.calculateHash(entry, previousHash);
    return entry;
  },

  calculateHash(entry: Partial<LedgerEntry>, previousHash: string): string {
    const data = JSON.stringify(entry) + previousHash;
    // Simple numeric hash for simulation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
};
