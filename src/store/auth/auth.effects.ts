import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../app/core/services/auth.service';
import { NotificationService } from '../../app/core/services/notification.service';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    exhaustMap(({ request }) =>
      this.authSvc.login(request).pipe(
        map(res => AuthActions.loginSuccess({ user: res.user, tokens: res.tokens })),
        catchError(err => of(AuthActions.loginFailure({ error: err.error?.message ?? 'Login failed' }))),
      ),
    ),
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(() => this.router.navigate(['/dashboard'])),
  ), { dispatch: false });

  register$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.register),
    exhaustMap(({ request }) =>
      this.authSvc.register(request).pipe(
        map(() => AuthActions.registerSuccess()),
        catchError(err => of(AuthActions.registerFailure({ error: err.error?.message ?? 'Registration failed' }))),
      ),
    ),
  ));

  registerSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.registerSuccess),
    tap(() => this.notify.success('Registration successful! Check your email to set up your password.')),
  ), { dispatch: false });

  setPassword$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.setPassword),
    exhaustMap(({ request }) =>
      this.authSvc.setPassword(request).pipe(
        map(res => AuthActions.setPasswordSuccess({ user: res.user, tokens: res.tokens })),
        catchError(err => of(AuthActions.setPasswordFailure({ error: err.error?.message ?? 'Failed to set password' }))),
      ),
    ),
  ));

  setPasswordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.setPasswordSuccess),
    tap(() => this.router.navigate(['/dashboard'])),
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    switchMap(() =>
      this.authSvc.logout().pipe(
        map(() => AuthActions.logoutSuccess()),
        catchError(() => of(AuthActions.logoutSuccess())),
      ),
    ),
  ));

  logoutSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logoutSuccess),
    tap(() => this.router.navigate(['/auth/login'])),
  ), { dispatch: false });

  loadMe$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loadMe),
    switchMap(() =>
      this.authSvc.me().pipe(
        map(user => AuthActions.loadMeSuccess({ user })),
        catchError(() => of(AuthActions.loadMeFailure())),
      ),
    ),
  ));

  constructor(
    private actions$: Actions,
    private authSvc: AuthService,
    private notify: NotificationService,
    private router: Router,
  ) {}
}
