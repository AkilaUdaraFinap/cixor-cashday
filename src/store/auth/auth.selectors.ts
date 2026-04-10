import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthFeatureState } from './auth.reducer';

const selectFeature = createFeatureSelector<AuthFeatureState>('auth');

export const selectAuthUser         = createSelector(selectFeature, s => s.user);
export const selectAuthTokens       = createSelector(selectFeature, s => s.tokens);
export const selectAuthLoading      = createSelector(selectFeature, s => s.loading);
export const selectAuthError        = createSelector(selectFeature, s => s.error);
export const selectRegisterSuccess  = createSelector(selectFeature, s => s.registerSuccess);
export const selectIsAuthenticated  = createSelector(selectFeature, s => !!s.user);
export const selectUserRole         = createSelector(selectFeature, s => s.user?.role);
