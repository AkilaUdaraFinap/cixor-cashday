import { createAction, props } from '@ngrx/store';
import { Dashboard } from '../../app/core/models/dashboard.models';

export const loadDashboard        = createAction('[Dashboard] Load');
export const loadDashboardSuccess = createAction('[Dashboard] Load Success', props<{ data: Dashboard }>());
export const loadDashboardFailure = createAction('[Dashboard] Load Failure', props<{ error: string }>());
