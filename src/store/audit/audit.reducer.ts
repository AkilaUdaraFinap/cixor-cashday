import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { AuditLog } from '../../app/core/models/audit.models';
import { loadAuditLogs, loadAuditLogsSuccess, loadAuditLogsFailure } from './audit.actions';

export interface AuditState extends EntityState<AuditLog> {
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
}

const adapter: EntityAdapter<AuditLog> = createEntityAdapter<AuditLog>();

const initialState: AuditState = adapter.getInitialState({
  loading: false,
  error: null,
  totalCount: 0,
  page: 1,
  pageSize: 30,
});

export const auditReducer = createReducer(
  initialState,
  on(loadAuditLogs, state => ({ ...state, loading: true, error: null })),
  on(loadAuditLogsSuccess, (state, { result }) =>
    adapter.setAll(result.items, { ...state, loading: false, totalCount: result.total, page: result.page, pageSize: result.pageSize }),
  ),
  on(loadAuditLogsFailure, (state, { error }) => ({ ...state, loading: false, error })),
);

export const { selectAll, selectEntities } = adapter.getSelectors();
