import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ClientListItem, ClientFilter, Client } from '../../app/core/models/client.models';
import * as Actions from './clients.actions';

export interface ClientsFeatureState extends EntityState<ClientListItem> {
  selectedClient: Client | null;
  total: number;
  filter: ClientFilter;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const adapter: EntityAdapter<ClientListItem> = createEntityAdapter<ClientListItem>();

const initialState: ClientsFeatureState = adapter.getInitialState({
  selectedClient: null,
  total: 0,
  filter: { page: 1, pageSize: 20 },
  loading: false,
  saving: false,
  error: null,
});

export const clientsReducer = createReducer(
  initialState,
  on(Actions.loadClients, state => ({ ...state, loading: true, error: null })),
  on(Actions.loadClientsSuccess, (state, { result }) =>
    adapter.setAll(result.items, { ...state, loading: false, total: result.total })),
  on(Actions.loadClientsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(Actions.loadClient, state => ({ ...state, loading: true })),
  on(Actions.loadClientSuccess, (state, { client }) => ({ ...state, loading: false, selectedClient: client })),
  on(Actions.loadClientFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(Actions.createClient, Actions.updateClient, Actions.addOfficer, Actions.updateOfficer, Actions.removeOfficer,
    state => ({ ...state, saving: true, error: null })),

  on(Actions.createClientSuccess, (state, { client }) =>
    adapter.addOne({ ...client } as unknown as ClientListItem, { ...state, saving: false })),
  on(Actions.updateClientSuccess, (state, { client }) => ({
    ...adapter.updateOne({ id: client.id, changes: { ...client } as Partial<ClientListItem> }, state),
    saving: false,
    selectedClient: state.selectedClient?.id === client.id ? client : state.selectedClient,
  })),

  on(Actions.addOfficerSuccess, (state, { clientId, officer }) => {
    if (state.selectedClient?.id !== clientId) return { ...state, saving: false };
    return {
      ...state,
      saving: false,
      selectedClient: {
        ...state.selectedClient!,
        officers: [...state.selectedClient!.officers, officer],
      },
    };
  }),
  on(Actions.updateOfficerSuccess, (state, { clientId, officer }) => {
    if (state.selectedClient?.id !== clientId) return { ...state, saving: false };
    return {
      ...state,
      saving: false,
      selectedClient: {
        ...state.selectedClient!,
        officers: state.selectedClient!.officers.map(o => o.id === officer.id ? officer : o),
      },
    };
  }),
  on(Actions.removeOfficerSuccess, (state, { clientId, officerId }) => {
    if (state.selectedClient?.id !== clientId) return { ...state, saving: false };
    return {
      ...state,
      saving: false,
      selectedClient: {
        ...state.selectedClient!,
        officers: state.selectedClient!.officers.filter(o => o.id !== officerId),
      },
    };
  }),
  on(Actions.createClientFailure, Actions.updateClientFailure, Actions.addOfficerFailure,
    Actions.updateOfficerFailure, Actions.removeOfficerFailure,
    (state, { error }) => ({ ...state, saving: false, error })),

  on(Actions.setClientFilter, (state, { filter }) => ({ ...state, filter: { ...state.filter, ...filter } })),
  on(Actions.clearSelectedClient, state => ({ ...state, selectedClient: null })),
);

export const { selectAll: selectAllClientItems } = adapter.getSelectors();
