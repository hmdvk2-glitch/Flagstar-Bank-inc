export type Customer = {
  id: string;
  name: string;
  full_name?: string;
  email?: string;
  accountNumber: string;
  account_number?: string;
  balance: number;
  role: "customer";
  kycStatus?: string;
};

export type Transaction = {
  id: string;
  customer_id?: string;
  fromAccount?: string;
  toAccount?: string;
  amount: number;
  type: "credit" | "debit";
  transactionType?: string;
  stage: string;
  status: string;
  narration?: string;
  createdAt?: string;
  created_at?: string;
  referenceNumber?: string;
};