export type AuditAction =
  | 'Login' | 'Logout' | 'InvoiceCreated' | 'InvoiceUpdated' | 'InvoiceDeleted'
  | 'InvoiceSent' | 'InvoiceAccepted' | 'InvoiceRejected'
  | 'ExpenseSubmitted' | 'ExpenseApproved' | 'ExpenseRejected'
  | 'UserCreated' | 'UserUpdated' | 'UserDeactivated'
  | 'ClientCreated' | 'ClientUpdated'
  | 'PasswordChanged' | 'SettingsChanged' | 'FundingRequested';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  entityLabel?: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditFilter {
  action?: AuditAction;
  userId?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditPageResult {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}
