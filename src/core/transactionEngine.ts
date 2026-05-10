import { BankingEngine } from './bankingEngine';

export type TransactionType = 'credit' | 'debit' | 'transfer';

export interface TransactionPacket {
  type: TransactionType;
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
  description: string;
  category: string;
}

export const TransactionEngine = {
  /**
   * Process a transaction packet and return the required mutations
   */
  process(packet: TransactionPacket, currentBalance: number) {
    if (packet.type === 'debit' || packet.type === 'transfer') {
      const check = BankingEngine.validateTransaction(currentBalance, packet.amount);
      if (!check.isAllowed) throw new Error(check.error);
    }

    // Logic for ledger entry and balance update
    return {
      success: true,
      timestamp: new Date().toISOString(),
      ...packet
    };
  }
};
