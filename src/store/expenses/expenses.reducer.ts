import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Expense, ExpenseFilter, ExpenseSummary } from '../../app/core/models/expense.models';
import * as Actions from './expenses.actions';

export interface ExpensesFeatureState extends EntityState<Expense> {
  summary: ExpenseSummary | null;
  total: number;
  filter: ExpenseFilter;
  loading: boolean;
  saving: boolean;
  error: string | null;
  formOpen: boolean;
  editingExpense: Expense | null;
}

const adapter: EntityAdapter<Expense> = createEntityAdapter<Expense>();

const initialState: ExpensesFeatureState = adapter.getInitialState({
  summary: null,
  total: 0,
  filter: { page: 1, pageSize: 20 },
  loading: false,
  saving: false,
  error: null,
  formOpen: false,
  editingExpense: null,
});

export const expensesReducer = createReducer(
  initialState,
  on(Actions.loadExpenses, state => ({ ...state, loading: true, error: null })),
  on(Actions.loadExpensesSuccess, (state, { result }) =>
    adapter.setAll(result.items, { ...state, loading: false, total: result.total })),
  on(Actions.loadExpensesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(Actions.loadExpenseSummarySuccess, (state, { summary }) => ({ ...state, summary })),

  on(Actions.createExpense, Actions.updateExpense, Actions.approveExpense, Actions.rejectExpense, Actions.deleteExpense,
    state => ({ ...state, saving: true, error: null })),

  on(Actions.createExpenseSuccess, (state, { expense }) =>
    adapter.addOne(expense, { ...state, saving: false, formOpen: false, editingExpense: null })),
  on(Actions.updateExpenseSuccess, Actions.approveExpenseSuccess, Actions.rejectExpenseSuccess,
    (state, { expense }) => adapter.updateOne({ id: expense.id, changes: expense }, { ...state, saving: false, formOpen: false })),
  on(Actions.deleteExpenseSuccess, (state, { id }) =>
    adapter.removeOne(id, { ...state, saving: false })),

  on(Actions.createExpenseFailure, Actions.updateExpenseFailure, Actions.approveExpenseFailure,
    Actions.rejectExpenseFailure, Actions.deleteExpenseFailure,
    (state, { error }) => ({ ...state, saving: false, error })),

  on(Actions.setExpenseFilter, (state, { filter }) => ({ ...state, filter: { ...state.filter, ...filter } })),
  on(Actions.openExpenseForm,  (state, { expense }) => ({ ...state, formOpen: true, editingExpense: expense })),
  on(Actions.closeExpenseForm, state => ({ ...state, formOpen: false, editingExpense: null })),
);

export const { selectAll: selectAllExpenses } = adapter.getSelectors();
