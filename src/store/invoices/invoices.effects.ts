import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import * as InvActions from './invoices.actions';
import { InvoiceService } from '../../app/core/services/invoice.service';
import { NotificationService } from '../../app/core/services/notification.service';

@Injectable()
export class InvoicesEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.loadInvoices),
    exhaustMap(({ filter }) =>
      this.svc.getAll(filter).pipe(
        map(result => InvActions.loadInvoicesSuccess({ result })),
        catchError(err => of(InvActions.loadInvoicesFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  loadOne$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.loadInvoice),
    exhaustMap(({ id }) =>
      this.svc.getById(id).pipe(
        map(invoice => InvActions.loadInvoiceSuccess({ invoice })),
        catchError(err => of(InvActions.loadInvoiceFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.createInvoice),
    exhaustMap(({ invoice }) =>
      this.svc.create(invoice).pipe(
        map(inv => InvActions.createInvoiceSuccess({ invoice: inv })),
        catchError(err => of(InvActions.createInvoiceFailure({ error: err.error?.message ?? 'Create failed' }))),
      ),
    ),
  ));

  createSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.createInvoiceSuccess),
    tap(({ invoice }) => {
      this.notify.success('Invoice created successfully');
      this.router.navigate(['/invoices', invoice.id]);
    }),
  ), { dispatch: false });

  update$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.updateInvoice),
    exhaustMap(({ id, invoice }) =>
      this.svc.update(id, invoice).pipe(
        map(inv => InvActions.updateInvoiceSuccess({ invoice: inv })),
        catchError(err => of(InvActions.updateInvoiceFailure({ error: err.error?.message ?? 'Update failed' }))),
      ),
    ),
  ));

  updateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.updateInvoiceSuccess),
    tap(() => this.notify.success('Invoice updated')),
  ), { dispatch: false });

  delete$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.deleteInvoice),
    exhaustMap(({ id }) =>
      this.svc.delete(id).pipe(
        map(() => InvActions.deleteInvoiceSuccess({ id })),
        catchError(err => of(InvActions.deleteInvoiceFailure({ error: err.error?.message ?? 'Delete failed' }))),
      ),
    ),
  ));

  deleteSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.deleteInvoiceSuccess),
    tap(() => {
      this.notify.success('Invoice deleted');
      this.router.navigate(['/invoices']);
    }),
  ), { dispatch: false });

  send$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.sendInvoice),
    exhaustMap(({ id }) =>
      this.svc.send(id).pipe(
        map(invoice => InvActions.sendInvoiceSuccess({ invoice })),
        catchError(err => of(InvActions.sendInvoiceFailure({ error: err.error?.message ?? 'Send failed' }))),
      ),
    ),
  ));

  sendSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.sendInvoiceSuccess),
    tap(() => this.notify.success('Invoice sent to client')),
  ), { dispatch: false });

  requestFunding$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.requestFunding),
    exhaustMap(({ id }) =>
      this.svc.requestFunding(id).pipe(
        map(invoice => InvActions.requestFundingSuccess({ invoice })),
        catchError(err => of(InvActions.requestFundingFailure({ error: err.error?.message ?? 'Funding request failed' }))),
      ),
    ),
  ));

  requestFundingSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(InvActions.requestFundingSuccess),
    tap(() => this.notify.success('Funding requested successfully')),
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private svc: InvoiceService,
    private notify: NotificationService,
    private router: Router,
  ) {}
}
