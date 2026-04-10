import { createReducer, on } from '@ngrx/store';
import { Dashboard } from '../../app/core/models/dashboard.models';
import * as DashboardActions from './dashboard.actions';

export interface DashboardFeatureState {
  data: Dashboard | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardFeatureState = { data: null, loading: false, error: null };

export const dashboardReducer = createReducer(
  initialState,
  on(DashboardActions.loadDashboard,        state => ({ ...state, loading: true, error: null })),
  on(DashboardActions.loadDashboardSuccess, (state, { data }) => ({ ...state, loading: false, data })),
  on(DashboardActions.loadDashboardFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
