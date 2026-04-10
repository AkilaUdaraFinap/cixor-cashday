import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { BankTransaction, BankAccount, BankFilter, CashFlowPoint } from '../../app/core/models/bank.models';
import * as Actions from './bank.actions';

export interface BankFeatureState extends EntityState<BankTransaction> {
  accounts: BankAccount[];
  cashFlow: CashFlowPoint[];
  total: number;
  filter: BankFilter;
  selectedAccountId: string | null;
  loading: boolean;
  error: string | null;
}

const adapter: EntityAdapter<BankTransaction> = createEntityAdapter<BankTransaction>();

const initialState: BankFeatureState = adapter.getInitialState({
  accounts: [],
  cashFlow: [],
  total: 0,
  filter: { page: 1, pageSize: 30 },
  selectedAccountId: null,
  loading: false,
  error: null,
});

export const bankReducer = createReducer(
  initialState,
  on(Actions.loadAccounts, Actions.loadTransactions, Actions.loadCashFlow,
    state => ({ ...state, loading: true, error: null })),
  on(Actions.loadAccountsSuccess, (state, { accounts }) => ({ ...state, loading: false, accounts })),
  on(Actions.loadTransactionsSuccess, (state, { result }) =>
    adapter.setAll(result.items, { ...state, loading: false, total: result.total })),
  on(Actions.loadCashFlowSuccess, (state, { points }) => ({ ...state, loading: false, cashFlow: points })),
  on(Actions.loadAccountsFailure, Actions.loadTransactionsFailure, Actions.loadCashFlowFailure,
    (state, { error }) => ({ ...state, loading: false, error })),
  on(Actions.setBankFilter, (state, { filter }) => ({ ...state, filter: { ...state.filter, ...filter } })),
  on(Actions.selectAccount, (state, { accountId }) => ({ ...state, selectedAccountId: accountId })),
);

export const { selectAll: selectAllTransactions } = adapter.getSelectors();
