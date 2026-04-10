import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InvoicesFeatureState, selectAllInvoiceItems } from './invoices.reducer';

const selectFeature = createFeatureSelector<InvoicesFeatureState>('invoices');

export const selectInvoiceItems    = createSelector(selectFeature, selectAllInvoiceItems);
export const selectInvoicesTotal   = createSelector(selectFeature, s => s.total);
export const selectInvoicesLoading = createSelector(selectFeature, s => s.loading);
export const selectInvoicesSaving  = createSelector(selectFeature, s => s.saving);
export const selectInvoicesError   = createSelector(selectFeature, s => s.error);
export const selectInvoiceFilter   = createSelector(selectFeature, s => s.filter);
export const selectSelectedInvoice = createSelector(selectFeature, s => s.selectedInvoice);
