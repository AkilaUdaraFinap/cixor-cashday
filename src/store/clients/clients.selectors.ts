import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientsFeatureState, selectAllClientItems } from './clients.reducer';

const selectFeature = createFeatureSelector<ClientsFeatureState>('clients');

export const selectClientItems     = createSelector(selectFeature, selectAllClientItems);
export const selectClientsTotal    = createSelector(selectFeature, s => s.total);
export const selectClientsLoading  = createSelector(selectFeature, s => s.loading);
export const selectClientsSaving   = createSelector(selectFeature, s => s.saving);
export const selectClientFilter    = createSelector(selectFeature, s => s.filter);
export const selectSelectedClient  = createSelector(selectFeature, s => s.selectedClient);
