import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { User, UserFilter } from '../../app/core/models/user.models';
import * as Actions from './users.actions';

export interface UsersFeatureState extends EntityState<User> {
  total: number;
  filter: UserFilter;
  loading: boolean;
  saving: boolean;
  error: string | null;
  formOpen: boolean;
  editingUser: User | null;
}

const adapter: EntityAdapter<User> = createEntityAdapter<User>();

const initialState: UsersFeatureState = adapter.getInitialState({
  total: 0,
  filter: { page: 1, pageSize: 20 },
  loading: false,
  saving: false,
  error: null,
  formOpen: false,
  editingUser: null,
});

export const usersReducer = createReducer(
  initialState,
  on(Actions.loadUsers, state => ({ ...state, loading: true, error: null })),
  on(Actions.loadUsersSuccess, (state, { result }) =>
    adapter.setAll(result.items, { ...state, loading: false, total: result.total })),
  on(Actions.loadUsersFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(Actions.createUser, Actions.updateUser, Actions.deactivateUser, Actions.resendInvite,
    state => ({ ...state, saving: true, error: null })),

  on(Actions.createUserSuccess, (state, { user }) =>
    adapter.addOne(user, { ...state, saving: false, formOpen: false, editingUser: null })),
  on(Actions.updateUserSuccess, (state, { user }) =>
    adapter.updateOne({ id: user.id, changes: user }, { ...state, saving: false, formOpen: false })),
  on(Actions.deactivateUserSuccess, (state, { id }) =>
    adapter.updateOne({ id, changes: { status: 'Inactive' } }, { ...state, saving: false })),
  on(Actions.resendInviteSuccess, state => ({ ...state, saving: false })),

  on(Actions.createUserFailure, Actions.updateUserFailure, Actions.deactivateUserFailure, Actions.resendInviteFailure,
    (state, { error }) => ({ ...state, saving: false, error })),

  on(Actions.setUserFilter, (state, { filter }) => ({ ...state, filter: { ...state.filter, ...filter } })),
  on(Actions.openUserForm,  (state, { user }) => ({ ...state, formOpen: true, editingUser: user })),
  on(Actions.closeUserForm, state => ({ ...state, formOpen: false, editingUser: null })),
);

export const { selectAll: selectAllUsers } = adapter.getSelectors();
