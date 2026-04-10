import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import * as BankActions from './bank.actions';
import { BankService } from '../../app/core/services/bank.service';

@Injectable()
export class BankEffects {
  loadAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(BankActions.loadAccounts),
    exhaustMap(() =>
      this.svc.getAccounts().pipe(
        map(accounts => BankActions.loadAccountsSuccess({ accounts })),
        catchError(err => of(BankActions.loadAccountsFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  loadTxns$ = createEffect(() => this.actions$.pipe(
    ofType(BankActions.loadTransactions),
    exhaustMap(({ filter }) =>
      this.svc.getTransactions(filter).pipe(
        map(result => BankActions.loadTransactionsSuccess({ result })),
        catchError(err => of(BankActions.loadTransactionsFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  loadCashFlow$ = createEffect(() => this.actions$.pipe(
    ofType(BankActions.loadCashFlow),
    exhaustMap(({ from, to }) =>
      this.svc.getCashFlow(from, to).pipe(
        map(points => BankActions.loadCashFlowSuccess({ points })),
        catchError(err => of(BankActions.loadCashFlowFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  constructor(private actions$: Actions, private svc: BankService) {}
}
