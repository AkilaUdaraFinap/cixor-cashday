import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import * as UserActions from './users.actions';
import { UserService } from '../../app/core/services/user.service';
import { NotificationService } from '../../app/core/services/notification.service';

@Injectable()
export class UsersEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.loadUsers),
    exhaustMap(({ filter }) =>
      this.svc.getAll(filter).pipe(
        map(result => UserActions.loadUsersSuccess({ result })),
        catchError(err => of(UserActions.loadUsersFailure({ error: err.error?.message ?? 'Load failed' }))),
      ),
    ),
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.createUser),
    exhaustMap(({ data }) =>
      this.svc.create(data).pipe(
        map(user => UserActions.createUserSuccess({ user })),
        catchError(err => of(UserActions.createUserFailure({ error: err.error?.message ?? 'Create failed' }))),
      ),
    ),
  ));

  createSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.createUserSuccess),
    tap(() => this.notify.success('User invited successfully. An email has been sent.')),
  ), { dispatch: false });

  update$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.updateUser),
    exhaustMap(({ id, data }) =>
      this.svc.update(id, data).pipe(
        map(user => UserActions.updateUserSuccess({ user })),
        catchError(err => of(UserActions.updateUserFailure({ error: err.error?.message ?? 'Update failed' }))),
      ),
    ),
  ));

  deactivate$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.deactivateUser),
    exhaustMap(({ id }) =>
      this.svc.deactivate(id).pipe(
        map(() => UserActions.deactivateUserSuccess({ id })),
        catchError(err => of(UserActions.deactivateUserFailure({ error: err.error?.message ?? 'Deactivate failed' }))),
      ),
    ),
  ));

  deactivateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.deactivateUserSuccess),
    tap(() => this.notify.success('User deactivated')),
  ), { dispatch: false });

  resendInvite$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.resendInvite),
    exhaustMap(({ id }) =>
      this.svc.resendInvite(id).pipe(
        map(() => UserActions.resendInviteSuccess()),
        catchError(err => of(UserActions.resendInviteFailure({ error: err.error?.message ?? 'Resend failed' }))),
      ),
    ),
  ));

  resendSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.resendInviteSuccess),
    tap(() => this.notify.success('Invite email resent')),
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private svc: UserService,
    private notify: NotificationService,
  ) {}
}
