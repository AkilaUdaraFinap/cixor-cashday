import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import * as DashboardActions from './dashboard.actions';
import { DashboardService } from '../../app/core/services/dashboard.service';

@Injectable()
export class DashboardEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardActions.loadDashboard),
    exhaustMap(() =>
      this.dashSvc.getSummary().pipe(
        map(data => DashboardActions.loadDashboardSuccess({ data })),
        catchError(err => of(DashboardActions.loadDashboardFailure({ error: err.error?.message ?? 'Failed to load dashboard' }))),
      ),
    ),
  ));

  constructor(private actions$: Actions, private dashSvc: DashboardService) {}
}
