export type ExpenseCategory =
  | 'Salaries' | 'Rent' | 'Utilities' | 'Marketing'
  | 'Software' | 'Travel' | 'Equipment' | 'Professional'
  | 'Insurance' | 'Other';

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  notes?: string;
  submittedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilter {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ExpensePageResult {
  items: Expense[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExpenseSummary {
  totalThisMonth: number;
  totalLastMonth: number;
  byCategory: { category: ExpenseCategory; amount: number }[];
}
