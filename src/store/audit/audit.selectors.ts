import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuditState, selectAll } from './audit.reducer';

const selectAuditState = createFeatureSelector<AuditState>('audit');

export const selectAllAuditLogs = createSelector(selectAuditState, selectAll);
export const selectAuditLoading = createSelector(selectAuditState, s => s.loading);
export const selectAuditError   = createSelector(selectAuditState, s => s.error);
export const selectAuditPagination = createSelector(selectAuditState, s => ({
  totalCount: s.totalCount, page: s.page, pageSize: s.pageSize,
}));
