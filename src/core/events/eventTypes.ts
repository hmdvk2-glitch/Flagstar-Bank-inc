export type TransactionEventType =
  | 'TRANSACTION_CREATED'
  | 'COT_VERIFIED'
  | 'TAX_VERIFIED'
  | 'IRS_VERIFIED'
  | 'COMPLETED'
  | 'REJECTED';

export interface TransactionEvent {
  id?: string;
  transactionId: string;
  type: TransactionEventType;
  payload?: any;
  timestamp: number;
  actor: 'SYSTEM' | 'ADMIN' | 'CUSTOMER';
}
