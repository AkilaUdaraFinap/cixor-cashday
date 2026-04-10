import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuditService } from '../../app/core/services/audit.service';
import { loadAuditLogs, loadAuditLogsSuccess, loadAuditLogsFailure } from './audit.actions';

@Injectable()
export class AuditEffects {
  loadLogs$ = createEffect(() => this.actions$.pipe(
    ofType(loadAuditLogs),
    switchMap(({ filter }) => this.auditService.getAll(filter).pipe(
      map(result => loadAuditLogsSuccess({ result })),
      catchError(err => of(loadAuditLogsFailure({ error: err.message ?? 'Failed to load audit logs' }))),
    )),
  ));

  constructor(private actions$: Actions, private auditService: AuditService) {}
}
