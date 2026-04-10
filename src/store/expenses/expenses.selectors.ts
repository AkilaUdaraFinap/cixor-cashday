import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExpensesFeatureState, selectAllExpenses } from './expenses.reducer';

const selectFeature = createFeatureSelector<ExpensesFeatureState>('expenses');

export const selectExpenses        = createSelector(selectFeature, selectAllExpenses);
export const selectExpensesTotal   = createSelector(selectFeature, s => s.total);
export const selectExpensesLoading = createSelector(selectFeature, s => s.loading);
export const selectExpensesSaving  = createSelector(selectFeature, s => s.saving);
export const selectExpenseSummary  = createSelector(selectFeature, s => s.summary);
export const selectExpenseFilter   = createSelector(selectFeature, s => s.filter);
export const selectExpenseFormOpen = createSelector(selectFeature, s => s.formOpen);
export const selectEditingExpense  = createSelector(selectFeature, s => s.editingExpense);
