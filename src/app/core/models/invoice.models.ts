export type InvoiceStatus =
  | 'Draft' | 'Pending' | 'Sent' | 'Viewed'
  | 'Accepted' | 'Rejected' | 'PartiallyPaid'
  | 'Paid' | 'Overdue' | 'Cancelled';

export type FundingStatus = 'None' | 'Requested' | 'Approved' | 'Funded' | 'Repaid';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
  taxAmount?: number;
  lineTotal?: number;
}

export interface WaterfallBreakdown {
  gross: number;
  discount: number;
  tax: number;
  net: number;
  funded: number;
  platformFee: number;
  clientRepayment: number;
  netPayable: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  poNumber?: string;
  serviceMonth?: string;
  paymentTerms?: string;
  status: InvoiceStatus;
  fundingStatus: FundingStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  terms?: string;
  waterfall?: WaterfallBreakdown;
  acceptedAt?: string;
  acceptedOfficerName?: string;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  amountDue: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  fundingStatus: FundingStatus;
  createdAt: string;
}

export interface InvoiceFilter {
  status?: InvoiceStatus;
  clientId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface InvoicePageResult {
  items: InvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
}
