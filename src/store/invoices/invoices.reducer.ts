import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { InvoiceListItem, InvoiceFilter, Invoice } from '../../app/core/models/invoice.models';
import * as Actions from './invoices.actions';

export interface InvoicesFeatureState extends EntityState<InvoiceListItem> {
  selectedInvoice: Invoice | null;
  total: number;
  filter: InvoiceFilter;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const adapter: EntityAdapter<InvoiceListItem> = createEntityAdapter<InvoiceListItem>();

const initialFilter: InvoiceFilter = { page: 1, pageSize: 20 };

const initialState: InvoicesFeatureState = adapter.getInitialState({
  selectedInvoice: null,
  total: 0,
  filter: initialFilter,
  loading: false,
  saving: false,
  error: null,
});

export const invoicesReducer = createReducer(
  initialState,
  on(Actions.loadInvoices, state => ({ ...state, loading: true, error: null })),
  on(Actions.loadInvoicesSuccess, (state, { result }) =>
    adapter.setAll(result.items, { ...state, loading: false, total: result.total })),
  on(Actions.loadInvoicesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(Actions.loadInvoice, state => ({ ...state, loading: true })),
  on(Actions.loadInvoiceSuccess, (state, { invoice }) => ({ ...state, loading: false, selectedInvoice: invoice })),
  on(Actions.loadInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(Actions.createInvoice, Actions.updateInvoice, Actions.deleteInvoice,
    Actions.sendInvoice, Actions.requestFunding,
    state => ({ ...state, saving: true, error: null })),

  on(Actions.createInvoiceSuccess, (state, { invoice }) =>
    adapter.addOne({ ...invoice } as unknown as InvoiceListItem, { ...state, saving: false })),

  on(Actions.updateInvoiceSuccess, Actions.sendInvoiceSuccess, Actions.requestFundingSuccess,
    (state, { invoice }) => ({
      ...adapter.updateOne({ id: invoice.id, changes: { ...invoice } as Partial<InvoiceListItem> }, state),
      saving: false,
      selectedInvoice: state.selectedInvoice?.id === invoice.id ? invoice : state.selectedInvoice,
    })),

  on(Actions.deleteInvoiceSuccess, (state, { id }) =>
    adapter.removeOne(id, { ...state, saving: false })),

  on(Actions.createInvoiceFailure, Actions.updateInvoiceFailure, Actions.deleteInvoiceFailure,
    Actions.sendInvoiceFailure, Actions.requestFundingFailure,
    (state, { error }) => ({ ...state, saving: false, error })),

  on(Actions.setInvoiceFilter, (state, { filter }) => ({ ...state, filter: { ...state.filter, ...filter } })),
  on(Actions.clearSelectedInvoice, state => ({ ...state, selectedInvoice: null })),
);

export const { selectAll: selectAllInvoiceItems, selectEntities } = adapter.getSelectors();
