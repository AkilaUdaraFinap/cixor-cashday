import { createAction, props } from '@ngrx/store';
import { BankAccount, BankFilter, BankPageResult, CashFlowPoint } from '../../app/core/models/bank.models';

export const loadAccounts           = createAction('[Bank] Load Accounts');
export const loadAccountsSuccess    = createAction('[Bank] Load Accounts Success', props<{ accounts: BankAccount[] }>());
export const loadAccountsFailure    = createAction('[Bank] Load Accounts Failure', props<{ error: string }>());

export const loadTransactions        = createAction('[Bank] Load Txns', props<{ filter: BankFilter }>());
export const loadTransactionsSuccess = createAction('[Bank] Load Txns Success', props<{ result: BankPageResult }>());
export const loadTransactionsFailure = createAction('[Bank] Load Txns Failure', props<{ error: string }>());

export const loadCashFlow           = createAction('[Bank] Load CashFlow', props<{ from: string; to: string }>());
export const loadCashFlowSuccess    = createAction('[Bank] Load CashFlow Success', props<{ points: CashFlowPoint[] }>());
export const loadCashFlowFailure    = createAction('[Bank] Load CashFlow Failure', props<{ error: string }>());

export const setBankFilter = createAction('[Bank] Set Filter', props<{ filter: Partial<BankFilter> }>());
export const selectAccount = createAction('[Bank] Select Account', props<{ accountId: string | null }>());
