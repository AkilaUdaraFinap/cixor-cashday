export type TransactionType = 'Credit' | 'Debit';
export type TransactionCategory =
  | 'InvoicePayment' | 'ExpensePayment' | 'FundingAdvance'
  | 'FundingRepayment' | 'Transfer' | 'Other';

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  balance: number;
  isDefault: boolean;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  runningBalance: number;
  description: string;
  reference?: string;
  valueDate: string;
  createdAt: string;
}

export interface BankFilter {
  accountId?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface BankPageResult {
  items: BankTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}
