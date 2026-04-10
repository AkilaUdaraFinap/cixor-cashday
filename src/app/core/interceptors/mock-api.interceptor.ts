import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

const NOW_ISO = '2026-04-10T08:00:00Z';

const MOCK_USERS = [
  {
    email: 'admin@cixor.com',
    password: 'password123',
    user: {
      id: '1',
      name: 'Aaliyah Smith',
      firstName: 'Aaliyah',
      lastName: 'Smith',
      email: 'admin@cixor.com',
      role: 'Admin',
      businessId: 'biz-001',
      businessName: 'Cixor Finance',
    },
  },
  {
    email: 'accounts@cixor.com',
    password: 'password123',
    user: {
      id: '2',
      name: 'Marcus Dlamini',
      firstName: 'Marcus',
      lastName: 'Dlamini',
      email: 'accounts@cixor.com',
      role: 'AccountsManager',
      businessId: 'biz-001',
      businessName: 'Cixor Finance',
    },
  },
];

let mockUsers = [
  {
    id: '1',
    name: 'Aaliyah Smith',
    firstName: 'Aaliyah',
    lastName: 'Smith',
    email: 'admin@cixor.com',
    role: 'Admin',
    status: 'Active',
    avatarUrl: '',
    lastLoginAt: '2026-04-10T07:45:00Z',
    createdAt: '2025-01-05T09:00:00Z',
  },
  {
    id: '2',
    name: 'Marcus Dlamini',
    firstName: 'Marcus',
    lastName: 'Dlamini',
    email: 'accounts@cixor.com',
    role: 'AccountsManager',
    status: 'Active',
    avatarUrl: '',
    lastLoginAt: '2026-04-10T07:15:00Z',
    createdAt: '2025-02-11T09:00:00Z',
  },
  {
    id: '3',
    name: 'Lebo Naidoo',
    firstName: 'Lebo',
    lastName: 'Naidoo',
    email: 'operations@cixor.com',
    role: 'Viewer',
    status: 'Invited',
    avatarUrl: '',
    lastLoginAt: '',
    createdAt: '2026-03-22T13:30:00Z',
  },
];

let mockClients = [
  {
    id: 'cli-001',
    name: 'Acme Corporation',
    tradingName: 'Acme Capital',
    registrationNumber: '2020/000001/07',
    vatNumber: '4123456789',
    email: 'accounts@acme.co.za',
    phone: '+27 11 000 0000',
    website: 'https://acme.co.za',
    address: '12 Rivonia Road, Sandton',
    city: 'Johannesburg',
    country: 'South Africa',
    currency: 'ZAR',
    creditLimit: 500000,
    outstandingBalance: 118750,
    totalInvoiced: 860000,
    officers: [
      {
        id: 'off-001',
        clientId: 'cli-001',
        firstName: 'Jane',
        lastName: 'Mokoena',
        email: 'jane@acme.co.za',
        phone: '+27 82 000 0000',
        title: 'Finance Director',
        isPrimary: true,
        canAcceptInvoices: true,
        consentGiven: true,
        consentGivenAt: '2026-03-01T09:00:00Z',
      },
      {
        id: 'off-002',
        clientId: 'cli-001',
        firstName: 'Daniel',
        lastName: 'Khoza',
        email: 'daniel@acme.co.za',
        phone: '+27 83 111 2222',
        title: 'Managing Director',
        isPrimary: false,
        canAcceptInvoices: true,
        consentGiven: true,
      },
    ],
    authorisedOfficers: [],
    isActive: true,
    createdAt: '2025-07-12T08:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'cli-002',
    name: 'Bluewave Retail',
    registrationNumber: '2019/445512/07',
    vatNumber: '4987654321',
    email: 'finance@bluewave.co.za',
    phone: '+27 21 555 8899',
    website: 'https://bluewave.co.za',
    address: '88 Dock Road, Cape Town',
    city: 'Cape Town',
    country: 'South Africa',
    currency: 'ZAR',
    creditLimit: 325000,
    outstandingBalance: 68400,
    totalInvoiced: 510000,
    officers: [
      {
        id: 'off-003',
        clientId: 'cli-002',
        firstName: 'Ayesha',
        lastName: 'Pillay',
        email: 'ayesha@bluewave.co.za',
        phone: '+27 84 123 4567',
        title: 'Financial Controller',
        isPrimary: true,
        canAcceptInvoices: true,
        consentGiven: true,
      },
    ],
    authorisedOfficers: [],
    isActive: true,
    createdAt: '2025-08-04T10:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'cli-003',
    name: 'Northstar Logistics',
    registrationNumber: '2021/332214/07',
    vatNumber: '4019988776',
    email: 'ops@northstarlogistics.co.za',
    phone: '+27 31 777 4488',
    website: 'https://northstarlogistics.co.za',
    address: '41 Meridian Park, Durban',
    city: 'Durban',
    country: 'South Africa',
    currency: 'ZAR',
    creditLimit: 420000,
    outstandingBalance: 0,
    totalInvoiced: 297500,
    officers: [
      {
        id: 'off-004',
        clientId: 'cli-003',
        firstName: 'Themba',
        lastName: 'Zulu',
        email: 'themba@northstarlogistics.co.za',
        phone: '+27 76 456 9988',
        title: 'Operations Director',
        isPrimary: true,
        canAcceptInvoices: true,
        consentGiven: true,
      },
    ],
    authorisedOfficers: [],
    isActive: true,
    createdAt: '2025-10-18T08:00:00Z',
    updatedAt: NOW_ISO,
  },
].map(client => ({ ...client, authorisedOfficers: client.officers }));

let mockExpenses = [
  {
    id: 'exp-001',
    description: 'April office rent',
    category: 'Rent',
    amount: 42000,
    currency: 'ZAR',
    date: '2026-04-01',
    status: 'Approved',
    notes: 'Main headquarters',
    submittedBy: 'Aaliyah Smith',
    approvedBy: 'Marcus Dlamini',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'exp-002',
    description: 'Cloud platform licences',
    category: 'Software',
    amount: 18500,
    currency: 'ZAR',
    date: '2026-04-04',
    status: 'Pending',
    notes: 'Annual renewals',
    submittedBy: 'Marcus Dlamini',
    createdAt: '2026-04-04T10:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'exp-003',
    description: 'Sales travel to Durban',
    category: 'Travel',
    amount: 9300,
    currency: 'ZAR',
    date: '2026-03-20',
    status: 'Paid',
    submittedBy: 'Marcus Dlamini',
    approvedBy: 'Aaliyah Smith',
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: NOW_ISO,
  },
];

let mockInvoices = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    clientId: 'cli-001',
    clientName: 'Acme Corporation',
    issueDate: '2026-04-01',
    dueDate: '2026-04-30',
    poNumber: 'PO-1044',
    serviceMonth: '2026-03',
    paymentTerms: 'Payment due within 30 days of invoice date.',
    status: 'Sent',
    fundingStatus: 'Requested',
    lineItems: [
      { id: 'line-001', description: 'Receivables processing', quantity: 1, unitPrice: 95000, taxRate: 15, amount: 95000, taxAmount: 14250, lineTotal: 109250 },
      { id: 'line-002', description: 'Advisory retainer', quantity: 1, unitPrice: 30000, taxRate: 15, amount: 30000, taxAmount: 4500, lineTotal: 34500 },
    ],
    subtotal: 125000,
    taxTotal: 18750,
    totalAmount: 143750,
    amountPaid: 25000,
    amountDue: 118750,
    notes: 'Monthly working capital facility support.',
    waterfall: { gross: 125000, discount: 0, tax: 18750, net: 143750, funded: 90000, platformFee: 9000, clientRepayment: 0, netPayable: 44750 },
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-002',
    clientId: 'cli-002',
    clientName: 'Bluewave Retail',
    issueDate: '2026-03-18',
    dueDate: '2026-04-05',
    poNumber: 'BW-776',
    serviceMonth: '2026-03',
    paymentTerms: 'Due on receipt.',
    status: 'Overdue',
    fundingStatus: 'Funded',
    lineItems: [
      { id: 'line-003', description: 'Inventory bridge financing fee', quantity: 1, unitPrice: 59500, taxRate: 15, amount: 59500, taxAmount: 8925, lineTotal: 68425 },
    ],
    subtotal: 59500,
    taxTotal: 8925,
    totalAmount: 68425,
    amountPaid: 25,
    amountDue: 68400,
    notes: 'Final reminder issued.',
    waterfall: { gross: 59500, discount: 0, tax: 8925, net: 68425, funded: 45000, platformFee: 4200, clientRepayment: 0, netPayable: 19225 },
    createdAt: '2026-03-18T08:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-003',
    clientId: 'cli-003',
    clientName: 'Northstar Logistics',
    issueDate: '2026-03-10',
    dueDate: '2026-03-30',
    poNumber: 'NS-155',
    serviceMonth: '2026-03',
    paymentTerms: 'Payment due within 20 days.',
    status: 'Paid',
    fundingStatus: 'None',
    lineItems: [
      { id: 'line-004', description: 'Freight reconciliation project', quantity: 1, unitPrice: 42000, taxRate: 15, amount: 42000, taxAmount: 6300, lineTotal: 48300 },
    ],
    subtotal: 42000,
    taxTotal: 6300,
    totalAmount: 48300,
    amountPaid: 48300,
    amountDue: 0,
    notes: 'Settled in full.',
    waterfall: { gross: 42000, discount: 0, tax: 6300, net: 48300, funded: 0, platformFee: 0, clientRepayment: 0, netPayable: 48300 },
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2026-004',
    clientId: 'cli-001',
    clientName: 'Acme Corporation',
    issueDate: '2026-04-04',
    dueDate: '2026-04-25',
    poNumber: 'PO-1058',
    serviceMonth: '2026-04',
    paymentTerms: 'Payment due within 21 days.',
    status: 'Accepted',
    fundingStatus: 'None',
    confidenceScore: 92,
    acceptedOfficerName: 'Jane Mokoena',
    acceptedAt: '2026-04-06T09:30:00Z',
    lineItems: [
      { id: 'line-005', description: 'Treasury optimisation sprint', quantity: 1, unitPrice: 84000, taxRate: 15, amount: 84000, taxAmount: 12600, lineTotal: 96600 },
      { id: 'line-006', description: 'Collections reporting', quantity: 1, unitPrice: 26000, taxRate: 15, amount: 26000, taxAmount: 3900, lineTotal: 29900 },
    ],
    subtotal: 110000,
    taxTotal: 16500,
    totalAmount: 126500,
    amountPaid: 0,
    amountDue: 126500,
    notes: 'Buyer verified and ready for optional liquidation.',
    waterfall: { gross: 110000, discount: 0, tax: 16500, net: 126500, funded: 0, platformFee: 0, clientRepayment: 0, netPayable: 126500 },
    createdAt: '2026-04-04T08:00:00Z',
    updatedAt: NOW_ISO,
  },
  {
    id: 'inv-005',
    invoiceNumber: 'INV-2026-005',
    clientId: 'cli-002',
    clientName: 'Bluewave Retail',
    issueDate: '2026-04-02',
    dueDate: '2026-04-22',
    poNumber: 'BW-801',
    serviceMonth: '2026-04',
    paymentTerms: 'Due within 20 days.',
    status: 'Accepted',
    fundingStatus: 'None',
    confidenceScore: 84,
    acceptedOfficerName: 'Ayesha Pillay',
    acceptedAt: '2026-04-07T11:15:00Z',
    lineItems: [
      { id: 'line-007', description: 'Stock visibility dashboard', quantity: 1, unitPrice: 70000, taxRate: 15, amount: 70000, taxAmount: 10500, lineTotal: 80500 },
      { id: 'line-008', description: 'Store rollout support', quantity: 1, unitPrice: 10000, taxRate: 15, amount: 10000, taxAmount: 1500, lineTotal: 11500 },
    ],
    subtotal: 80000,
    taxTotal: 12000,
    totalAmount: 92000,
    amountPaid: 0,
    amountDue: 92000,
    notes: 'Approved by buyer for the verified receivables programme.',
    waterfall: { gross: 80000, discount: 0, tax: 12000, net: 92000, funded: 0, platformFee: 0, clientRepayment: 0, netPayable: 92000 },
    createdAt: '2026-04-02T08:00:00Z',
    updatedAt: NOW_ISO,
  },
];

let mockBankAccounts = [
  {
    id: 'acc-001',
    name: 'Operating Account',
    accountNumber: '****4521',
    bankName: 'First National Bank',
    currency: 'ZAR',
    balance: 245000,
    isDefault: true,
  },
  {
    id: 'acc-002',
    name: 'Reserve Account',
    accountNumber: '****8833',
    bankName: 'Nedbank',
    currency: 'ZAR',
    balance: 120000,
    isDefault: false,
  },
];

let mockBankTransactions = [
  {
    id: 'tx-001',
    accountId: 'acc-001',
    type: 'Credit',
    category: 'InvoicePayment',
    amount: 48300,
    runningBalance: 245000,
    description: 'Northstar Logistics payment',
    reference: 'INV-2026-003',
    valueDate: '2026-04-08',
    createdAt: '2026-04-08T08:00:00Z',
  },
  {
    id: 'tx-002',
    accountId: 'acc-001',
    type: 'Debit',
    category: 'ExpensePayment',
    amount: 42000,
    runningBalance: 196700,
    description: 'April office rent',
    reference: 'EXP-001',
    valueDate: '2026-04-01',
    createdAt: '2026-04-01T08:00:00Z',
  },
  {
    id: 'tx-003',
    accountId: 'acc-002',
    type: 'Credit',
    category: 'FundingAdvance',
    amount: 90000,
    runningBalance: 120000,
    description: 'Funding drawdown for Acme invoice',
    reference: 'INV-2026-001',
    valueDate: '2026-04-03',
    createdAt: '2026-04-03T08:00:00Z',
  },
];

let mockAuditItems = [
  { id: 'aud-001', action: 'LOGIN', entityType: 'User', entityLabel: 'admin@cixor.com', userEmail: 'admin@cixor.com', createdAt: '2026-04-10T08:00:00Z' },
  { id: 'aud-002', action: 'CREATE', entityType: 'Invoice', entityLabel: 'INV-2026-001', userEmail: 'admin@cixor.com', createdAt: '2026-04-09T10:30:00Z', amount: 143750 },
  { id: 'aud-003', action: 'APPROVE', entityType: 'Expense', entityLabel: 'April office rent', userEmail: 'accounts@cixor.com', createdAt: '2026-04-08T15:20:00Z', amount: 42000 },
  { id: 'aud-004', action: 'UPDATE', entityType: 'Client', entityLabel: 'Acme Corporation', userEmail: 'admin@cixor.com', createdAt: '2026-04-08T11:05:00Z' },
];

function makeTokens() {
  return {
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expiresIn: 3600,
  };
}

function getPath(url: string): string {
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch {
    return url.split('?')[0] ?? url;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function pushAudit(action: string, entityType: string, entityLabel: string, amount?: number): void {
  mockAuditItems = [
    {
      id: createId('aud'),
      action,
      entityType,
      entityLabel,
      userEmail: 'admin@cixor.com',
      createdAt: new Date().toISOString(),
      ...(amount !== undefined ? { amount } : {}),
    },
    ...mockAuditItems,
  ].slice(0, 20);
}

function normaliseLineItems(lineItems: any[] = []): any[] {
  return lineItems.map((line, index) => {
    const quantity = Number(line.quantity ?? 0);
    const unitPrice = Number(line.unitPrice ?? 0);
    const taxRate = Number(line.taxRate ?? 15);
    const amount = quantity * unitPrice;
    const taxAmount = amount * (taxRate / 100);

    return {
      id: line.id ?? createId(`line${index + 1}`),
      description: line.description ?? `Line item ${index + 1}`,
      quantity,
      unitPrice,
      taxRate,
      amount,
      taxAmount,
      lineTotal: amount + taxAmount,
    };
  });
}

function buildWaterfall(subtotal: number, taxTotal: number, totalAmount: number) {
  return {
    gross: subtotal,
    discount: 0,
    tax: taxTotal,
    net: totalAmount,
    funded: 0,
    platformFee: 0,
    clientRepayment: 0,
    netPayable: totalAmount,
  };
}

function listClientItems() {
  return mockClients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.email,
    outstandingBalance: client.outstandingBalance,
    totalInvoiced: client.totalInvoiced,
    officerCount: client.officers.length,
    isActive: client.isActive,
  }));
}

function listInvoiceItems() {
  return mockInvoices.map(invoice => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.clientName,
    totalAmount: invoice.totalAmount,
    amountDue: invoice.amountDue,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    fundingStatus: invoice.fundingStatus,
    createdAt: invoice.createdAt,
  }));
}

function buildExpenseSummary() {
  const totalThisMonth = mockExpenses
    .filter(expense => expense.date.startsWith('2026-04'))
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalLastMonth = mockExpenses
    .filter(expense => expense.date.startsWith('2026-03'))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals = new Map<string, number>();
  mockExpenses.forEach(expense => {
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + expense.amount);
  });

  return {
    totalThisMonth,
    totalLastMonth,
    byCategory: Array.from(categoryTotals.entries()).map(([category, amount]) => ({ category, amount })),
  };
}

function buildAging() {
  const report = {
    current: { label: 'Current', amount: 0, count: 0 },
    days1_30: { label: '1-30 days', amount: 0, count: 0 },
    days31_60: { label: '31-60 days', amount: 0, count: 0 },
    days61_90: { label: '61-90 days', amount: 0, count: 0 },
    over90: { label: '90+ days', amount: 0, count: 0 },
  };

  mockInvoices.forEach(invoice => {
    if (!invoice.amountDue) {
      return;
    }

    const daysOverdue = Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000);
    const bucket = daysOverdue <= 0
      ? report.current
      : daysOverdue <= 30
        ? report.days1_30
        : daysOverdue <= 60
          ? report.days31_60
          : daysOverdue <= 90
            ? report.days61_90
            : report.over90;

    bucket.amount += invoice.amountDue;
    bucket.count += 1;
  });

  return report;
}

function buildForecast(cashBalance: number, availableOverdraft: number) {
  const baseDate = new Date('2026-04-10T00:00:00Z');
  let runningCash = cashBalance + availableOverdraft;

  return Array.from({ length: 90 }, (_, index) => {
    const day = index + 1;
    const date = new Date(baseDate);
    date.setUTCDate(date.getUTCDate() + index);

    const receivables = day % 15 === 0 ? 62000 : day % 7 === 0 ? 28000 : 0;
    const payables = day % 10 === 0 ? 18000 : 0;
    const expenses = day % 14 === 0 ? 22000 : day % 5 === 0 ? 8500 : 0;
    runningCash += receivables - payables - expenses;

    const events = [];
    if (receivables) {
      events.push({ label: 'Receivable inflow', amount: receivables, type: 'inflow' });
    }
    if (payables + expenses) {
      events.push({ label: 'Committed outflow', amount: payables + expenses, type: 'outflow' });
    }
    if (runningCash < 100000) {
      events.push({ label: 'Low cash warning', amount: runningCash, type: 'warning' });
    }

    return {
      day,
      date: date.toISOString(),
      projectedCash: Math.round(runningCash),
      receivables,
      payables,
      expenses,
      events,
    };
  });
}

function buildVerifiedInvoices() {
  const ivrPercent = 0.85;

  return mockInvoices
    .filter(invoice => invoice.status === 'Accepted' && !['Funded', 'Repaid'].includes(invoice.fundingStatus) && invoice.amountDue > 0)
    .map(invoice => {
      const netOfTax = Math.max(invoice.totalAmount - invoice.taxTotal, 0);
      const confidenceScore = Number(invoice.confidenceScore ?? 80);
      const eligibleLiquidationValue = Math.round(netOfTax * (confidenceScore / 100));
      const availableToLiquidate = Math.round(eligibleLiquidationValue * ivrPercent);

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        dueDate: invoice.dueDate,
        grossAmount: invoice.totalAmount,
        taxAmount: invoice.taxTotal,
        netOfTax,
        confidenceScore,
        eligibleLiquidationValue,
        availableToLiquidate,
        feePercent: 0.025,
        hasActiveIntent: false,
      };
    });
}

function buildDashboard() {
  const totalReceivables = mockInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
  const totalPayables = mockExpenses
    .filter(expense => expense.status !== 'Paid')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const cashBalance = mockBankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const overdraftLimit = 180000;
  const overdraftUsed = 45000;
  const availableOverdraft = overdraftLimit - overdraftUsed;
  const availableCashToday = cashBalance + availableOverdraft;
  const overdueInvoices = mockInvoices.filter(invoice => invoice.amountDue > 0 && new Date(invoice.dueDate).getTime() < Date.now()).length;
  const overdueAmount = mockInvoices
    .filter(invoice => invoice.amountDue > 0 && new Date(invoice.dueDate).getTime() < Date.now())
    .reduce((sum, invoice) => sum + invoice.amountDue, 0);
  const fundedAmount = mockInvoices
    .filter(invoice => ['Approved', 'Funded'].includes(invoice.fundingStatus))
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const pendingInvoices = mockInvoices.filter(invoice => ['Draft', 'Pending', 'Sent', 'Viewed'].includes(invoice.status)).length;

  return {
    kpi: {
      totalReceivables,
      totalPayables,
      cashBalance,
      overdueAmount,
      fundedAmount,
      pendingInvoices,
      overdueInvoices,
    },
    aging: buildAging(),
    availableCashToday,
    overdraftLimit,
    overdraftUsed,
    availableOverdraft,
    forecast: buildForecast(cashBalance, availableOverdraft),
    verifiedInvoices: buildVerifiedInvoices(),
    simulation: null,
    revenueByMonth: [
      { month: 'Jan', invoiced: 185000, collected: 152000, expenses: 84000 },
      { month: 'Feb', invoiced: 214000, collected: 198000, expenses: 91000 },
      { month: 'Mar', invoiced: 267000, collected: 238000, expenses: 103000 },
      { month: 'Apr', invoiced: 251000, collected: 212000, expenses: 60500 },
    ],
    topClients: listClientItems()
      .sort((left, right) => right.totalInvoiced - left.totalInvoiced)
      .slice(0, 3)
      .map(client => ({
        clientId: client.id,
        clientName: client.name,
        totalInvoiced: client.totalInvoiced,
        outstanding: client.outstandingBalance,
      })),
    recentActivity: mockAuditItems.slice(0, 6).map(item => ({
      id: item.id,
      type:
        item.entityType === 'Invoice' && item.action === 'CREATE' ? 'invoice_created'
        : item.entityType === 'Invoice' && item.action === 'MARK_PAID' ? 'invoice_paid'
        : item.entityType === 'Expense' ? 'expense_submitted'
        : item.entityType === 'Funding' ? 'funding_approved'
        : 'user_login',
      description: `${item.action} ${item.entityType}: ${item.entityLabel}`,
      amount: item.amount,
      timestamp: item.createdAt,
      userName: item.userEmail,
    })),
  };
}

function upsertInvoice(body: any, existing?: any) {
  const lineItems = normaliseLineItems(body.lineItems ?? existing?.lineItems ?? []);
  const subtotal = lineItems.reduce((sum, line) => sum + line.amount, 0);
  const taxTotal = lineItems.reduce((sum, line) => sum + (line.taxAmount ?? 0), 0);
  const totalAmount = subtotal + taxTotal;
  const amountPaid = Number(body.amountPaid ?? existing?.amountPaid ?? 0);
  const clientId = body.clientId ?? existing?.clientId ?? mockClients[0].id;
  const clientName = mockClients.find(client => client.id === clientId)?.name ?? existing?.clientName ?? 'Client';

  return {
    ...(existing ?? {}),
    ...body,
    id: existing?.id ?? createId('inv'),
    invoiceNumber: body.invoiceNumber ?? existing?.invoiceNumber ?? `INV-${Date.now().toString().slice(-6)}`,
    clientId,
    clientName,
    issueDate: body.issueDate ?? existing?.issueDate ?? '2026-04-10',
    dueDate: body.dueDate ?? existing?.dueDate ?? '2026-05-10',
    status: body.status ?? existing?.status ?? 'Draft',
    fundingStatus: body.fundingStatus ?? existing?.fundingStatus ?? 'None',
    lineItems,
    subtotal,
    taxTotal,
    totalAmount,
    amountPaid,
    amountDue: Math.max(totalAmount - amountPaid, 0),
    createdAt: existing?.createdAt ?? NOW_ISO,
    updatedAt: NOW_ISO,
    waterfall: buildWaterfall(subtotal, taxTotal, totalAmount),
  };
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  const path = getPath(url);

  if (req.method === 'POST' && path.endsWith('/auth/login')) {
    const body = req.body as { email: string; password: string };
    const match = MOCK_USERS.find(user => user.email === body?.email && user.password === body?.password);

    if (match) {
      return of(new HttpResponse({ status: 200, body: { user: match.user, tokens: makeTokens() } })).pipe(delay(250));
    }

    return throwError(() => ({ status: 401, error: { message: 'Invalid email or password' } }));
  }

  if (req.method === 'POST' && path.endsWith('/auth/register')) {
    return of(new HttpResponse({ status: 201, body: { message: 'Registration successful. Check your email.' } })).pipe(delay(250));
  }

  if (req.method === 'POST' && path.endsWith('/auth/refresh')) {
    return of(new HttpResponse({ status: 200, body: makeTokens() })).pipe(delay(200));
  }

  if (req.method === 'POST' && path.endsWith('/auth/logout')) {
    return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(120));
  }

  if (req.method === 'GET' && path.endsWith('/auth/me')) {
    return of(new HttpResponse({ status: 200, body: MOCK_USERS[0].user })).pipe(delay(180));
  }

  const portalAcceptMatch = path.match(/\/portal\/accept\/([^/]+)$/);
  if (req.method === 'GET' && portalAcceptMatch) {
    const invoice = clone(mockInvoices.find(item => item.status === 'Accepted') ?? mockInvoices[0]);
    return of(new HttpResponse({
      status: 200,
      body: {
        invoice,
        businessName: 'Cixor Finance',
        sellerName: 'Cixor Finance',
        officerName: invoice.acceptedOfficerName ?? 'Jane Mokoena',
        officerEmail: 'officer@buyer.com',
        maskedPhone: '+27 82 *** 1122',
        maskedEmail: 'ja***@buyer.com',
        expiresAt: '2026-04-12T23:59:00Z',
        fundedAmount: 68000,
        fundingFee: 1700,
        netAdvance: 66300,
        repaymentDate: invoice.dueDate,
      },
    })).pipe(delay(220));
  }

  if (req.method === 'POST' && /\/portal\/accept\/[^/]+\/send-otp$/.test(path)) {
    return of(new HttpResponse({ status: 200, body: { message: 'OTP sent successfully' } })).pipe(delay(180));
  }

  if (req.method === 'POST' && path.endsWith('/portal/otp/verify')) {
    const body = req.body as { otp?: string };
    if (body?.otp === '123456') {
      return of(new HttpResponse({ status: 200, body: { valid: true } })).pipe(delay(160));
    }

    return throwError(() => ({ status: 400, error: { message: 'Invalid OTP' } }));
  }

  if (req.method === 'POST' && path.endsWith('/portal/accept/confirm')) {
    return of(new HttpResponse({
      status: 200,
      body: { message: 'Confirmation submitted', referenceNumber: `CCD-${Date.now().toString().slice(-6)}` },
    })).pipe(delay(220));
  }

  if (req.method === 'POST' && path.endsWith('/portal/accept/reject')) {
    return of(new HttpResponse({ status: 200, body: { message: 'Rejection submitted' } })).pipe(delay(200));
  }

  if (req.method === 'GET' && path.includes('/dashboard')) {
    return of(new HttpResponse({ status: 200, body: buildDashboard() })).pipe(delay(220));
  }

  const clientOfficerMatch = path.match(/\/clients\/([^/]+)\/officers(?:\/([^/]+))?$/);
  if (clientOfficerMatch) {
    const [, clientId, officerId] = clientOfficerMatch;
    const client = mockClients.find(item => item.id === clientId);

    if (!client) {
      return throwError(() => ({ status: 404, error: { message: 'Client not found' } }));
    }

    if (req.method === 'POST' && !officerId) {
      const body = req.body as any;
      const officer = {
        id: createId('off'),
        clientId,
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        email: body.email ?? '',
        phone: body.phone ?? '',
        title: body.title ?? '',
        idNumber: body.idNumber ?? '',
        isPrimary: client.officers.length === 0,
        canAcceptInvoices: true,
        consentGiven: false,
      };
      client.officers = [officer, ...client.officers];
      client.authorisedOfficers = client.officers;
      client.updatedAt = NOW_ISO;
      pushAudit('CREATE', 'Officer', `${officer.firstName} ${officer.lastName}`.trim());
      return of(new HttpResponse({ status: 201, body: clone(officer) })).pipe(delay(180));
    }

    if (req.method === 'PUT' && officerId) {
      client.officers = client.officers.map(officer => officer.id === officerId ? { ...officer, ...(req.body as any) } : officer);
      client.authorisedOfficers = client.officers;
      client.updatedAt = NOW_ISO;
      const updated = client.officers.find(officer => officer.id === officerId);
      pushAudit('UPDATE', 'Officer', `${updated?.firstName ?? ''} ${updated?.lastName ?? ''}`.trim());
      return of(new HttpResponse({ status: 200, body: clone(updated) })).pipe(delay(180));
    }

    if (req.method === 'DELETE' && officerId) {
      client.officers = client.officers.filter(officer => officer.id !== officerId);
      client.authorisedOfficers = client.officers;
      client.updatedAt = NOW_ISO;
      pushAudit('DELETE', 'Officer', officerId);
      return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(160));
    }
  }

  const clientDetailMatch = path.match(/\/clients\/([^/]+)$/);
  if (req.method === 'GET' && clientDetailMatch) {
    const client = mockClients.find(item => item.id === clientDetailMatch[1]);
    if (!client) {
      return throwError(() => ({ status: 404, error: { message: 'Client not found' } }));
    }
    return of(new HttpResponse({ status: 200, body: clone(client) })).pipe(delay(220));
  }

  if (req.method === 'GET' && path.endsWith('/clients')) {
    return of(new HttpResponse({
      status: 200,
      body: { items: listClientItems(), total: mockClients.length, page: 1, pageSize: 20 },
    })).pipe(delay(220));
  }

  if (req.method === 'POST' && path.endsWith('/clients')) {
    const body = req.body as any;
    const newClient = {
      id: createId('cli'),
      name: body.name ?? 'New Client',
      tradingName: body.tradingName ?? '',
      registrationNumber: body.registrationNumber ?? '',
      vatNumber: body.vatNumber ?? '',
      email: body.email ?? '',
      phone: body.phone ?? '',
      website: body.website ?? '',
      address: body.address ?? '',
      city: body.city ?? 'Johannesburg',
      country: body.country ?? 'South Africa',
      currency: 'ZAR',
      creditLimit: Number(body.creditLimit ?? 0),
      outstandingBalance: 0,
      totalInvoiced: 0,
      officers: [],
      authorisedOfficers: [],
      isActive: true,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    };
    mockClients = [newClient, ...mockClients];
    pushAudit('CREATE', 'Client', newClient.name);
    return of(new HttpResponse({ status: 201, body: clone(newClient) })).pipe(delay(180));
  }

  if (req.method === 'PUT' && clientDetailMatch) {
    const clientId = clientDetailMatch[1];
    mockClients = mockClients.map(client => client.id === clientId ? { ...client, ...(req.body as any), updatedAt: NOW_ISO } : client);
    const updatedClient = mockClients.find(client => client.id === clientId);
    pushAudit('UPDATE', 'Client', updatedClient?.name ?? clientId);
    return of(new HttpResponse({ status: 200, body: clone(updatedClient) })).pipe(delay(180));
  }

  const userDetailMatch = path.match(/\/users\/([^/]+)$/);
  if (req.method === 'GET' && path.endsWith('/users')) {
    return of(new HttpResponse({
      status: 200,
      body: { items: clone(mockUsers), total: mockUsers.length, page: 1, pageSize: 20 },
    })).pipe(delay(200));
  }

  if (req.method === 'GET' && userDetailMatch) {
    const user = mockUsers.find(item => item.id === userDetailMatch[1]);
    return of(new HttpResponse({ status: 200, body: clone(user) })).pipe(delay(180));
  }

  if (req.method === 'POST' && path.endsWith('/users')) {
    const body = req.body as any;
    const newUser = {
      id: createId('usr'),
      name: `${body.firstName ?? ''} ${body.lastName ?? ''}`.trim(),
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      email: body.email ?? '',
      role: body.role ?? 'Viewer',
      status: 'Invited',
      avatarUrl: '',
      lastLoginAt: '',
      createdAt: NOW_ISO,
    };
    mockUsers = [newUser, ...mockUsers];
    pushAudit('CREATE', 'User', newUser.email);
    return of(new HttpResponse({ status: 201, body: clone(newUser) })).pipe(delay(180));
  }

  if (req.method === 'PUT' && userDetailMatch) {
    const userId = userDetailMatch[1];
    mockUsers = mockUsers.map(user => {
      if (user.id !== userId) {
        return user;
      }
      const body = req.body as any;
      const firstName = body.firstName ?? user.firstName;
      const lastName = body.lastName ?? user.lastName;
      return { ...user, ...body, firstName, lastName, name: `${firstName} ${lastName}`.trim() };
    });
    const updatedUser = mockUsers.find(user => user.id === userId);
    pushAudit('UPDATE', 'User', updatedUser?.email ?? userId);
    return of(new HttpResponse({ status: 200, body: clone(updatedUser) })).pipe(delay(180));
  }

  if (req.method === 'POST' && path.endsWith('/deactivate')) {
    const userId = path.split('/').slice(-2)[0];
    mockUsers = mockUsers.map(user => user.id === userId ? { ...user, status: 'Inactive' } : user);
    const updatedUser = mockUsers.find(user => user.id === userId);
    pushAudit('DEACTIVATE', 'User', updatedUser?.email ?? userId);
    return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(160));
  }

  if (req.method === 'POST' && path.endsWith('/resend-invite')) {
    const userId = path.split('/').slice(-2)[0];
    const updatedUser = mockUsers.find(user => user.id === userId);
    pushAudit('RESEND_INVITE', 'User', updatedUser?.email ?? userId);
    return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(160));
  }

  const expenseDetailMatch = path.match(/\/expenses\/([^/]+)$/);
  if (req.method === 'GET' && path.endsWith('/expenses/summary')) {
    return of(new HttpResponse({ status: 200, body: buildExpenseSummary() })).pipe(delay(180));
  }

  if (req.method === 'GET' && path.endsWith('/expenses')) {
    const status = req.params.get('status');
    const category = req.params.get('category');
    const fromDate = req.params.get('fromDate');
    const toDate = req.params.get('toDate');
    const search = (req.params.get('search') ?? '').toLowerCase();

    const items = clone(mockExpenses).filter(expense => {
      const matchesStatus = !status || expense.status === status;
      const matchesCategory = !category || expense.category === category;
      const matchesFrom = !fromDate || expense.date >= fromDate;
      const matchesTo = !toDate || expense.date <= toDate;
      const matchesSearch = !search
        || expense.description.toLowerCase().includes(search)
        || expense.category.toLowerCase().includes(search)
        || expense.submittedBy.toLowerCase().includes(search);

      return matchesStatus && matchesCategory && matchesFrom && matchesTo && matchesSearch;
    });

    return of(new HttpResponse({
      status: 200,
      body: { items, total: items.length, page: 1, pageSize: 20 },
    })).pipe(delay(220));
  }

  if (req.method === 'GET' && expenseDetailMatch) {
    const expense = mockExpenses.find(item => item.id === expenseDetailMatch[1]);
    return of(new HttpResponse({ status: 200, body: clone(expense) })).pipe(delay(180));
  }

  if (req.method === 'POST' && path.endsWith('/expenses')) {
    const body = req.body as any;
    const newExpense = {
      id: createId('exp'),
      description: body.description ?? 'New expense',
      category: body.category ?? 'Other',
      amount: Number(body.amount ?? 0),
      currency: 'ZAR',
      date: body.date ?? '2026-04-10',
      status: 'Pending',
      receiptUrl: body.receiptUrl ?? '',
      notes: body.notes ?? '',
      submittedBy: 'Aaliyah Smith',
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
    };
    mockExpenses = [newExpense, ...mockExpenses];
    pushAudit('CREATE', 'Expense', newExpense.description, newExpense.amount);
    return of(new HttpResponse({ status: 201, body: clone(newExpense) })).pipe(delay(180));
  }

  if (req.method === 'PUT' && expenseDetailMatch) {
    const expenseId = expenseDetailMatch[1];
    mockExpenses = mockExpenses.map(expense => expense.id === expenseId ? { ...expense, ...(req.body as any), updatedAt: NOW_ISO } : expense);
    const updatedExpense = mockExpenses.find(expense => expense.id === expenseId);
    pushAudit('UPDATE', 'Expense', updatedExpense?.description ?? expenseId, updatedExpense?.amount);
    return of(new HttpResponse({ status: 200, body: clone(updatedExpense) })).pipe(delay(180));
  }

  if (req.method === 'POST' && path.endsWith('/approve')) {
    const expenseId = path.split('/').slice(-2)[0];
    mockExpenses = mockExpenses.map(expense => expense.id === expenseId ? { ...expense, status: 'Approved', approvedBy: 'Aaliyah Smith', updatedAt: NOW_ISO } : expense);
    const approvedExpense = mockExpenses.find(expense => expense.id === expenseId);
    pushAudit('APPROVE', 'Expense', approvedExpense?.description ?? expenseId, approvedExpense?.amount);
    return of(new HttpResponse({ status: 200, body: clone(approvedExpense) })).pipe(delay(160));
  }

  if (req.method === 'POST' && path.endsWith('/reject')) {
    const expenseId = path.split('/').slice(-2)[0];
    mockExpenses = mockExpenses.map(expense => expense.id === expenseId ? { ...expense, status: 'Rejected', updatedAt: NOW_ISO } : expense);
    const rejectedExpense = mockExpenses.find(expense => expense.id === expenseId);
    pushAudit('REJECT', 'Expense', rejectedExpense?.description ?? expenseId, rejectedExpense?.amount);
    return of(new HttpResponse({ status: 200, body: clone(rejectedExpense) })).pipe(delay(160));
  }

  if (req.method === 'DELETE' && expenseDetailMatch) {
    const expenseId = expenseDetailMatch[1];
    mockExpenses = mockExpenses.filter(expense => expense.id !== expenseId);
    pushAudit('DELETE', 'Expense', expenseId);
    return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(160));
  }

  const invoiceActionMatch = path.match(/\/invoices\/([^/]+)\/(send|request-funding|mark-paid)$/);
  if (invoiceActionMatch && req.method === 'POST') {
    const [, invoiceId, action] = invoiceActionMatch;
    mockInvoices = mockInvoices.map(invoice => {
      if (invoice.id !== invoiceId) {
        return invoice;
      }

      if (action === 'send') {
        return { ...invoice, status: 'Sent', updatedAt: NOW_ISO };
      }

      if (action === 'request-funding') {
        return { ...invoice, fundingStatus: 'Requested', updatedAt: NOW_ISO };
      }

      const amount = Number((req.body as any)?.amount ?? invoice.amountDue);
      const amountPaid = invoice.amountPaid + amount;
      const amountDue = Math.max(invoice.totalAmount - amountPaid, 0);
      return {
        ...invoice,
        amountPaid,
        amountDue,
        status: amountDue === 0 ? 'Paid' : 'PartiallyPaid',
        updatedAt: NOW_ISO,
      };
    });

    const updatedInvoice = mockInvoices.find(invoice => invoice.id === invoiceId);
    pushAudit(action === 'mark-paid' ? 'MARK_PAID' : 'UPDATE', 'Invoice', updatedInvoice?.invoiceNumber ?? invoiceId, updatedInvoice?.totalAmount);
    return of(new HttpResponse({ status: 200, body: clone(updatedInvoice) })).pipe(delay(180));
  }

  const invoiceDetailMatch = path.match(/\/invoices\/([^/]+)$/);
  if (req.method === 'GET' && path.endsWith('/invoices')) {
    return of(new HttpResponse({
      status: 200,
      body: { items: listInvoiceItems(), total: mockInvoices.length, page: 1, pageSize: 20 },
    })).pipe(delay(220));
  }

  if (req.method === 'GET' && invoiceDetailMatch) {
    const invoice = mockInvoices.find(item => item.id === invoiceDetailMatch[1]);
    return of(new HttpResponse({ status: 200, body: clone(invoice) })).pipe(delay(180));
  }

  if (req.method === 'POST' && path.endsWith('/invoices')) {
    const newInvoice = upsertInvoice(req.body as any);
    mockInvoices = [newInvoice, ...mockInvoices];
    pushAudit('CREATE', 'Invoice', newInvoice.invoiceNumber, newInvoice.totalAmount);
    return of(new HttpResponse({ status: 201, body: clone(newInvoice) })).pipe(delay(180));
  }

  if (req.method === 'PUT' && invoiceDetailMatch) {
    const invoiceId = invoiceDetailMatch[1];
    const existing = mockInvoices.find(invoice => invoice.id === invoiceId);
    const updatedInvoice = upsertInvoice(req.body as any, existing);
    mockInvoices = mockInvoices.map(invoice => invoice.id === invoiceId ? updatedInvoice : invoice);
    pushAudit('UPDATE', 'Invoice', updatedInvoice.invoiceNumber, updatedInvoice.totalAmount);
    return of(new HttpResponse({ status: 200, body: clone(updatedInvoice) })).pipe(delay(180));
  }

  if (req.method === 'DELETE' && invoiceDetailMatch) {
    const invoiceId = invoiceDetailMatch[1];
    mockInvoices = mockInvoices.filter(invoice => invoice.id !== invoiceId);
    pushAudit('DELETE', 'Invoice', invoiceId);
    return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(160));
  }

  if (req.method === 'GET' && path.endsWith('/bank/accounts')) {
    return of(new HttpResponse({ status: 200, body: clone(mockBankAccounts) })).pipe(delay(200));
  }

  if (req.method === 'GET' && path.endsWith('/bank/cashflow')) {
    return of(new HttpResponse({
      status: 200,
      body: [
        { date: '2026-03-01', inflow: 45000, outflow: 32000, net: 13000 },
        { date: '2026-03-08', inflow: 62000, outflow: 28000, net: 34000 },
        { date: '2026-03-15', inflow: 38000, outflow: 41000, net: -3000 },
        { date: '2026-03-22', inflow: 55000, outflow: 25000, net: 30000 },
        { date: '2026-03-29', inflow: 71000, outflow: 36000, net: 35000 },
      ],
    })).pipe(delay(200));
  }

  if (req.method === 'GET' && path.endsWith('/bank/transactions')) {
    return of(new HttpResponse({
      status: 200,
      body: { items: clone(mockBankTransactions), total: mockBankTransactions.length, page: 1, pageSize: 20 },
    })).pipe(delay(200));
  }

  if (req.method === 'GET' && path.endsWith('/audit')) {
    return of(new HttpResponse({
      status: 200,
      body: { items: clone(mockAuditItems), total: mockAuditItems.length, page: 1, pageSize: 20 },
    })).pipe(delay(180));
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(160));
  }

  return next(req);
};
