import { createReducer, on } from '@ngrx/store';
import { AuthUser, AuthTokens } from '../../app/core/models/auth.models';
import * as AuthActions from './auth.actions';

export interface AuthFeatureState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
  registerSuccess: boolean;
}

const initialState: AuthFeatureState = {
  user: null,
  tokens: null,
  loading: false,
  error: null,
  registerSuccess: false,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.register, AuthActions.setPassword, AuthActions.logout,
    state => ({ ...state, loading: true, error: null })),

  on(AuthActions.loginSuccess, AuthActions.setPasswordSuccess,
    (state, { user, tokens }) => ({ ...state, loading: false, user, tokens })),

  on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.setPasswordFailure,
    (state, { error }) => ({ ...state, loading: false, error })),

  on(AuthActions.registerSuccess, state => ({ ...state, loading: false, registerSuccess: true })),

  on(AuthActions.logoutSuccess, () => ({ ...initialState })),

  on(AuthActions.loadMeSuccess, (state, { user }) => ({ ...state, user })),
  on(AuthActions.loadMeFailure, () => ({ ...initialState })),

  on(AuthActions.clearAuthError, state => ({ ...state, error: null })),
);
