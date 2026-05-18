export interface ClearanceAttemptLog {
  id: string;
  type: 'CLEARANCE_ATTEMPT';
  customerId: string;
  customerName: string;
  codeType: 'COT' | 'TAX' | 'IRS';
  codeValue: string;
  success: boolean;
  timestamp: string;
}

export interface TransferAttemptLog {
  id: string;
  type: 'TRANSFER_ATTEMPT';
  customerId: string;
  customerName: string;
  amount: number;
  recipient: string;
  success: boolean;
  timestamp: string;
}

export type AuditLog = ClearanceAttemptLog | TransferAttemptLog;

const STORAGE_KEY = 'flagstar_audit_logs';

export const getAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error fetching audit logs:', e);
    return [];
  }
};

const saveAuditLog = (log: AuditLog) => {
  try {
    const logs = getAuditLogs();
    logs.unshift(log); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving audit log:', e);
  }
};

export const logClearanceAttempt = (
  customerId: string,
  customerName: string,
  codeType: 'COT' | 'TAX' | 'IRS',
  codeValue: string,
  success: boolean
) => {
  const log: ClearanceAttemptLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'CLEARANCE_ATTEMPT',
    customerId,
    customerName,
    codeType,
    codeValue,
    success,
    timestamp: new Date().toISOString()
  };
  saveAuditLog(log);
};

export const logTransferAttempt = (
  customerId: string,
  customerName: string,
  amount: number,
  recipient: string,
  success: boolean
) => {
  const log: TransferAttemptLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'TRANSFER_ATTEMPT',
    customerId,
    customerName,
    amount,
    recipient,
    success,
    timestamp: new Date().toISOString()
  };
  saveAuditLog(log);
};
