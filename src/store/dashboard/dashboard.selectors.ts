import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardFeatureState } from './dashboard.reducer';

const selectFeature = createFeatureSelector<DashboardFeatureState>('dashboard');

export const selectDashboardData    = createSelector(selectFeature, s => s.data);
export const selectDashboardLoading = createSelector(selectFeature, s => s.loading);
export const selectDashboardKPI     = createSelector(selectFeature, s => s.data?.kpi ?? null);
export const selectDashboardAging   = createSelector(selectFeature, s => s.data?.aging ?? null);
export const selectDashboardRevenue = createSelector(selectFeature, s => s.data?.revenueByMonth ?? []);
export const selectTopClients       = createSelector(selectFeature, s => s.data?.topClients ?? []);
export const selectRecentActivity   = createSelector(selectFeature, s => s.data?.recentActivity ?? []);
