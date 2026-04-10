import { createAction, props } from '@ngrx/store';
import { Invoice, InvoiceFilter, InvoicePageResult } from '../../app/core/models/invoice.models';

export const loadInvoices        = createAction('[Invoices] Load', props<{ filter: InvoiceFilter }>());
export const loadInvoicesSuccess = createAction('[Invoices] Load Success', props<{ result: InvoicePageResult }>());
export const loadInvoicesFailure = createAction('[Invoices] Load Failure', props<{ error: string }>());

export const loadInvoice        = createAction('[Invoices] Load One', props<{ id: string }>());
export const loadInvoiceSuccess = createAction('[Invoices] Load One Success', props<{ invoice: Invoice }>());
export const loadInvoiceFailure = createAction('[Invoices] Load One Failure', props<{ error: string }>());

export const createInvoice        = createAction('[Invoices] Create', props<{ invoice: Partial<Invoice> }>());
export const createInvoiceSuccess = createAction('[Invoices] Create Success', props<{ invoice: Invoice }>());
export const createInvoiceFailure = createAction('[Invoices] Create Failure', props<{ error: string }>());

export const updateInvoice        = createAction('[Invoices] Update', props<{ id: string; invoice: Partial<Invoice> }>());
export const updateInvoiceSuccess = createAction('[Invoices] Update Success', props<{ invoice: Invoice }>());
export const updateInvoiceFailure = createAction('[Invoices] Update Failure', props<{ error: string }>());

export const deleteInvoice        = createAction('[Invoices] Delete', props<{ id: string }>());
export const deleteInvoiceSuccess = createAction('[Invoices] Delete Success', props<{ id: string }>());
export const deleteInvoiceFailure = createAction('[Invoices] Delete Failure', props<{ error: string }>());

export const sendInvoice          = createAction('[Invoices] Send', props<{ id: string }>());
export const sendInvoiceSuccess   = createAction('[Invoices] Send Success', props<{ invoice: Invoice }>());
export const sendInvoiceFailure   = createAction('[Invoices] Send Failure', props<{ error: string }>());

export const requestFunding        = createAction('[Invoices] Request Funding', props<{ id: string }>());
export const requestFundingSuccess = createAction('[Invoices] Request Funding Success', props<{ invoice: Invoice }>());
export const requestFundingFailure = createAction('[Invoices] Request Funding Failure', props<{ error: string }>());

export const setInvoiceFilter = createAction('[Invoices] Set Filter', props<{ filter: Partial<InvoiceFilter> }>());
export const clearSelectedInvoice = createAction('[Invoices] Clear Selected');
