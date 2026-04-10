import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import * as ClientActions from './clients.actions';
import { ClientService } from '../../app/core/services/client.service';
import { NotificationService } from '../../app/core/services/notification.service';

@Injectable()
export class ClientsEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.loadClients),
    exhaustMap(({ filter }) =>
      this.svc.getAll(filter).pipe(
        map(result => ClientActions.loadClientsSuccess({ result })),
        catchError(err => of(ClientActions.loadClientsFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  loadOne$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.loadClient),
    exhaustMap(({ id }) =>
      this.svc.getById(id).pipe(
        map(client => ClientActions.loadClientSuccess({ client })),
        catchError(err => of(ClientActions.loadClientFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.createClient),
    exhaustMap(({ client }) =>
      this.svc.create(client).pipe(
        map(c => ClientActions.createClientSuccess({ client: c })),
        catchError(err => of(ClientActions.createClientFailure({ error: err.error?.message ?? 'Create failed' }))),
      ),
    ),
  ));

  createSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.createClientSuccess),
    tap(({ client }) => {
      this.notify.success('Client created');
      this.router.navigate(['/clients', client.id]);
    }),
  ), { dispatch: false });

  update$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.updateClient),
    exhaustMap(({ id, client }) =>
      this.svc.update(id, client).pipe(
        map(c => ClientActions.updateClientSuccess({ client: c })),
        catchError(err => of(ClientActions.updateClientFailure({ error: err.error?.message ?? 'Update failed' }))),
      ),
    ),
  ));

  updateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.updateClientSuccess),
    tap(() => this.notify.success('Client updated')),
  ), { dispatch: false });

  addOfficer$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.addOfficer),
    exhaustMap(({ clientId, officer }) =>
      this.svc.addOfficer(clientId, officer).pipe(
        map(o => ClientActions.addOfficerSuccess({ clientId, officer: o })),
        catchError(err => of(ClientActions.addOfficerFailure({ error: err.error?.message ?? 'Add officer failed' }))),
      ),
    ),
  ));

  addOfficerSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.addOfficerSuccess),
    tap(() => this.notify.success('Officer added')),
  ), { dispatch: false });

  updateOfficer$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.updateOfficer),
    exhaustMap(({ clientId, officerId, data }) =>
      this.svc.updateOfficer(clientId, officerId, data).pipe(
        map(o => ClientActions.updateOfficerSuccess({ clientId, officer: o })),
        catchError(err => of(ClientActions.updateOfficerFailure({ error: err.error?.message ?? 'Update officer failed' }))),
      ),
    ),
  ));

  removeOfficer$ = createEffect(() => this.actions$.pipe(
    ofType(ClientActions.removeOfficer),
    exhaustMap(({ clientId, officerId }) =>
      this.svc.removeOfficer(clientId, officerId).pipe(
        map(() => ClientActions.removeOfficerSuccess({ clientId, officerId })),
        catchError(err => of(ClientActions.removeOfficerFailure({ error: err.error?.message ?? 'Remove officer failed' }))),
      ),
    ),
  ));

  constructor(
    private actions$: Actions,
    private svc: ClientService,
    private notify: NotificationService,
    private router: Router,
  ) {}
}
