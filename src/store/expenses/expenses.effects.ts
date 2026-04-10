import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap, tap } from 'rxjs/operators';
import * as ExpActions from './expenses.actions';
import { ExpenseService } from '../../app/core/services/expense.service';
import { NotificationService } from '../../app/core/services/notification.service';
import { selectExpenseFilter } from './expenses.selectors';

@Injectable()
export class ExpensesEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.loadExpenses),
    exhaustMap(({ filter }) =>
      this.svc.getAll(filter).pipe(
        map(result => ExpActions.loadExpensesSuccess({ result })),
        catchError(err => of(ExpActions.loadExpensesFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  loadSummary$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.loadExpenseSummary),
    exhaustMap(() =>
      this.svc.getSummary().pipe(
        map(summary => ExpActions.loadExpenseSummarySuccess({ summary })),
        catchError(err => of(ExpActions.loadExpenseSummaryFailure({ error: err.error?.message ?? '' }))),
      ),
    ),
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.createExpense),
    exhaustMap(({ expense }) =>
      this.svc.create(expense).pipe(
        map(exp => ExpActions.createExpenseSuccess({ expense: exp })),
        catchError(err => of(ExpActions.createExpenseFailure({ error: err.error?.message ?? 'Create failed' }))),
      ),
    ),
  ));

  createSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.createExpenseSuccess),
    tap(() => this.notify.success('Expense submitted')),
  ), { dispatch: false });

  update$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.updateExpense),
    exhaustMap(({ id, expense }) =>
      this.svc.update(id, expense).pipe(
        map(exp => ExpActions.updateExpenseSuccess({ expense: exp })),
        catchError(err => of(ExpActions.updateExpenseFailure({ error: err.error?.message ?? 'Update failed' }))),
      ),
    ),
  ));

  approve$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.approveExpense),
    exhaustMap(({ id }) =>
      this.svc.approve(id).pipe(
        map(exp => ExpActions.approveExpenseSuccess({ expense: exp })),
        catchError(err => of(ExpActions.approveExpenseFailure({ error: err.error?.message ?? 'Approve failed' }))),
      ),
    ),
  ));

  approveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.approveExpenseSuccess),
    tap(() => this.notify.success('Expense approved')),
  ), { dispatch: false });

  rejectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.rejectExpenseSuccess),
    tap(() => this.notify.success('Expense rejected')),
  ), { dispatch: false });

  deleteSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.deleteExpenseSuccess),
    tap(() => this.notify.success('Expense deleted')),
  ), { dispatch: false });

  reject$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.rejectExpense),
    exhaustMap(({ id, reason }) =>
      this.svc.reject(id, reason).pipe(
        map(exp => ExpActions.rejectExpenseSuccess({ expense: exp })),
        catchError(err => of(ExpActions.rejectExpenseFailure({ error: err.error?.message ?? 'Reject failed' }))),
      ),
    ),
  ));

  delete$ = createEffect(() => this.actions$.pipe(
    ofType(ExpActions.deleteExpense),
    exhaustMap(({ id }) =>
      this.svc.delete(id).pipe(
        map(() => ExpActions.deleteExpenseSuccess({ id })),
        catchError(err => of(ExpActions.deleteExpenseFailure({ error: err.error?.message ?? 'Delete failed' }))),
      ),
    ),
  ));

  refreshAfterMutation$ = createEffect(() => this.actions$.pipe(
    ofType(
      ExpActions.createExpenseSuccess,
      ExpActions.updateExpenseSuccess,
      ExpActions.approveExpenseSuccess,
      ExpActions.rejectExpenseSuccess,
      ExpActions.deleteExpenseSuccess,
    ),
    concatLatestFrom(() => this.store.select(selectExpenseFilter)),
    mergeMap(([, filter]) => [
      ExpActions.loadExpenses({ filter }),
      ExpActions.loadExpenseSummary(),
    ]),
  ));

  constructor(
    private actions$: Actions,
    private svc: ExpenseService,
    private notify: NotificationService,
    private store: Store,
  ) {}
}
