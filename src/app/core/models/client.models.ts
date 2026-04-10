export interface AuthorisedOfficer {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary: boolean;
  canAcceptInvoices: boolean;
  consentGiven: boolean;
  consentGivenAt?: string;
}

export interface Client {
  id: string;
  name: string;
  tradingName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  currency: string;
  creditLimit?: number;
  outstandingBalance: number;
  totalInvoiced: number;
  officers: AuthorisedOfficer[];
  authorisedOfficers?: AuthorisedOfficer[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  outstandingBalance: number;
  totalInvoiced: number;
  officerCount: number;
  isActive: boolean;
}

export interface ClientFilter {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ClientPageResult {
  items: ClientListItem[];
  total: number;
  page: number;
  pageSize: number;
}
