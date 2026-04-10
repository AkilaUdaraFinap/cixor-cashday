import { createAction, props } from '@ngrx/store';
import { Client, ClientFilter, ClientPageResult, AuthorisedOfficer } from '../../app/core/models/client.models';

export const loadClients        = createAction('[Clients] Load', props<{ filter: ClientFilter }>());
export const loadClientsSuccess = createAction('[Clients] Load Success', props<{ result: ClientPageResult }>());
export const loadClientsFailure = createAction('[Clients] Load Failure', props<{ error: string }>());

export const loadClient        = createAction('[Clients] Load One', props<{ id: string }>());
export const loadClientSuccess = createAction('[Clients] Load One Success', props<{ client: Client }>());
export const loadClientFailure = createAction('[Clients] Load One Failure', props<{ error: string }>());

export const createClient        = createAction('[Clients] Create', props<{ client: Partial<Client> }>());
export const createClientSuccess = createAction('[Clients] Create Success', props<{ client: Client }>());
export const createClientFailure = createAction('[Clients] Create Failure', props<{ error: string }>());

export const updateClient        = createAction('[Clients] Update', props<{ id: string; client: Partial<Client> }>());
export const updateClientSuccess = createAction('[Clients] Update Success', props<{ client: Client }>());
export const updateClientFailure = createAction('[Clients] Update Failure', props<{ error: string }>());

export const addOfficer        = createAction('[Clients] Add Officer', props<{ clientId: string; officer: Partial<AuthorisedOfficer> }>());
export const addOfficerSuccess = createAction('[Clients] Add Officer Success', props<{ clientId: string; officer: AuthorisedOfficer }>());
export const addOfficerFailure = createAction('[Clients] Add Officer Failure', props<{ error: string }>());

export const updateOfficer        = createAction('[Clients] Update Officer', props<{ clientId: string; officerId: string; data: Partial<AuthorisedOfficer> }>());
export const updateOfficerSuccess = createAction('[Clients] Update Officer Success', props<{ clientId: string; officer: AuthorisedOfficer }>());
export const updateOfficerFailure = createAction('[Clients] Update Officer Failure', props<{ error: string }>());

export const removeOfficer        = createAction('[Clients] Remove Officer', props<{ clientId: string; officerId: string }>());
export const removeOfficerSuccess = createAction('[Clients] Remove Officer Success', props<{ clientId: string; officerId: string }>());
export const removeOfficerFailure = createAction('[Clients] Remove Officer Failure', props<{ error: string }>());

export const setClientFilter = createAction('[Clients] Set Filter', props<{ filter: Partial<ClientFilter> }>());
export const clearSelectedClient = createAction('[Clients] Clear Selected');
