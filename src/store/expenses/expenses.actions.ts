import { createAction, props } from '@ngrx/store';
import { Expense, ExpenseFilter, ExpensePageResult, ExpenseSummary } from '../../app/core/models/expense.models';

export const loadExpenses        = createAction('[Expenses] Load', props<{ filter: ExpenseFilter }>());
export const loadExpensesSuccess = createAction('[Expenses] Load Success', props<{ result: ExpensePageResult }>());
export const loadExpensesFailure = createAction('[Expenses] Load Failure', props<{ error: string }>());

export const loadExpenseSummary        = createAction('[Expenses] Load Summary');
export const loadExpenseSummarySuccess = createAction('[Expenses] Load Summary Success', props<{ summary: ExpenseSummary }>());
export const loadExpenseSummaryFailure = createAction('[Expenses] Load Summary Failure', props<{ error: string }>());

export const createExpense        = createAction('[Expenses] Create', props<{ expense: Partial<Expense> }>());
export const createExpenseSuccess = createAction('[Expenses] Create Success', props<{ expense: Expense }>());
export const createExpenseFailure = createAction('[Expenses] Create Failure', props<{ error: string }>());

export const updateExpense        = createAction('[Expenses] Update', props<{ id: string; expense: Partial<Expense> }>());
export const updateExpenseSuccess = createAction('[Expenses] Update Success', props<{ expense: Expense }>());
export const updateExpenseFailure = createAction('[Expenses] Update Failure', props<{ error: string }>());

export const approveExpense        = createAction('[Expenses] Approve', props<{ id: string }>());
export const approveExpenseSuccess = createAction('[Expenses] Approve Success', props<{ expense: Expense }>());
export const approveExpenseFailure = createAction('[Expenses] Approve Failure', props<{ error: string }>());

export const rejectExpense        = createAction('[Expenses] Reject', props<{ id: string; reason?: string }>());
export const rejectExpenseSuccess = createAction('[Expenses] Reject Success', props<{ expense: Expense }>());
export const rejectExpenseFailure = createAction('[Expenses] Reject Failure', props<{ error: string }>());

export const deleteExpense        = createAction('[Expenses] Delete', props<{ id: string }>());
export const deleteExpenseSuccess = createAction('[Expenses] Delete Success', props<{ id: string }>());
export const deleteExpenseFailure = createAction('[Expenses] Delete Failure', props<{ error: string }>());

export const setExpenseFilter = createAction('[Expenses] Set Filter', props<{ filter: Partial<ExpenseFilter> }>());
export const openExpenseForm  = createAction('[Expenses] Open Form', props<{ expense: Expense | null }>());
export const closeExpenseForm = createAction('[Expenses] Close Form');
