import { createAction, props } from '@ngrx/store';
import { AuditLog, AuditFilter, AuditPageResult } from '../../app/core/models/audit.models';

export const loadAuditLogs = createAction('[Audit] Load Logs', props<{ filter: AuditFilter }>());
export const loadAuditLogsSuccess = createAction('[Audit] Load Logs Success', props<{ result: AuditPageResult }>());
export const loadAuditLogsFailure = createAction('[Audit] Load Logs Failure', props<{ error: string }>());
