import { createAction, props } from '@ngrx/store';
import { LoginRequest, AuthUser, AuthTokens } from '../../app/core/models/auth.models';
import { RegisterRequest, SetPasswordRequest } from '../../app/core/models/auth.models';

export const login            = createAction('[Auth] Login', props<{ request: LoginRequest }>());
export const loginSuccess     = createAction('[Auth] Login Success', props<{ user: AuthUser; tokens: AuthTokens }>());
export const loginFailure     = createAction('[Auth] Login Failure', props<{ error: string }>());

export const register         = createAction('[Auth] Register', props<{ request: RegisterRequest }>());
export const registerSuccess  = createAction('[Auth] Register Success');
export const registerFailure  = createAction('[Auth] Register Failure', props<{ error: string }>());

export const setPassword      = createAction('[Auth] Set Password', props<{ request: SetPasswordRequest }>());
export const setPasswordSuccess = createAction('[Auth] Set Password Success', props<{ user: AuthUser; tokens: AuthTokens }>());
export const setPasswordFailure = createAction('[Auth] Set Password Failure', props<{ error: string }>());

export const logout           = createAction('[Auth] Logout');
export const logoutSuccess    = createAction('[Auth] Logout Success');

export const loadMe           = createAction('[Auth] Load Me');
export const loadMeSuccess    = createAction('[Auth] Load Me Success', props<{ user: AuthUser }>());
export const loadMeFailure    = createAction('[Auth] Load Me Failure');

export const clearAuthError   = createAction('[Auth] Clear Error');
