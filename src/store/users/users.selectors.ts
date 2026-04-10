import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersFeatureState, selectAllUsers } from './users.reducer';

const selectFeature = createFeatureSelector<UsersFeatureState>('users');

export const selectUsers        = createSelector(selectFeature, selectAllUsers);
export const selectUsersTotal   = createSelector(selectFeature, s => s.total);
export const selectUsersLoading = createSelector(selectFeature, s => s.loading);
export const selectUsersSaving  = createSelector(selectFeature, s => s.saving);
export const selectUserFilter   = createSelector(selectFeature, s => s.filter);
export const selectUserFormOpen = createSelector(selectFeature, s => s.formOpen);
export const selectEditingUser  = createSelector(selectFeature, s => s.editingUser);
