export interface DashboardKPI {
  totalReceivables: number;
  totalPayables: number;
  cashBalance: number;
  overdueAmount: number;
  fundedAmount: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}

export interface AgingReport {
  current: AgingBucket;
  days1_30: AgingBucket;
  days31_60: AgingBucket;
  days61_90: AgingBucket;
  over90: AgingBucket;
}

export interface RevenuePoint {
  month: string;
  invoiced: number;
  collected: number;
  expenses: number;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  totalInvoiced: number;
  outstanding: number;
}

export interface ForecastEvent {
  label: string;
  amount: number;
  type: 'inflow' | 'outflow' | 'warning';
}

export interface ForecastDay {
  day: number;
  date: string;
  projectedCash: number;
  receivables: number;
  payables: number;
  expenses: number;
  events: ForecastEvent[];
}

export interface VerifiedInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  grossAmount: number;
  taxAmount: number;
  netOfTax: number;
  confidenceScore: number;
  eligibleLiquidationValue: number;
  availableToLiquidate: number;
  feePercent: number;
  hasActiveIntent?: boolean;
}

export interface DashboardSimulation {
  totalRequested: number;
  totalFees: number;
  netInjection: number;
}

export interface Dashboard {
  kpi: DashboardKPI;
  aging: AgingReport;
  revenueByMonth: RevenuePoint[];
  topClients: TopClient[];
  recentActivity: ActivityItem[];
  availableCashToday: number;
  overdraftLimit: number;
  overdraftUsed: number;
  availableOverdraft: number;
  forecast: ForecastDay[];
  verifiedInvoices: VerifiedInvoice[];
  simulation?: DashboardSimulation | null;
}

export interface ActivityItem {
  id: string;
  type: 'invoice_created' | 'invoice_paid' | 'expense_submitted' | 'user_login' | 'funding_approved';
  description: string;
  amount?: number;
  timestamp: string;
  userId?: string;
  userName?: string;
}
