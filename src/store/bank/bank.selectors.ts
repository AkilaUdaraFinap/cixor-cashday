import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BankFeatureState, selectAllTransactions } from './bank.reducer';

const selectFeature = createFeatureSelector<BankFeatureState>('bank');

export const selectBankAccounts           = createSelector(selectFeature, s => s.accounts);
export const selectBankTransactions       = createSelector(selectFeature, selectAllTransactions);
export const selectBankCashFlow           = createSelector(selectFeature, s => s.cashFlow);
export const selectBankTotal              = createSelector(selectFeature, s => s.total);
export const selectBankLoading            = createSelector(selectFeature, s => s.loading);
export const selectBankFilter             = createSelector(selectFeature, s => s.filter);
export const selectSelectedBankAccountId  = createSelector(selectFeature, s => s.selectedAccountId);
export const selectSelectedBankAccount    = createSelector(
  selectFeature, s => s.accounts.find(a => a.id === s.selectedAccountId) ?? s.accounts[0] ?? null,
);
