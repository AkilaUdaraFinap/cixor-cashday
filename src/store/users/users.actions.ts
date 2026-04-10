import { createAction, props } from '@ngrx/store';
import { User, CreateUserRequest, UpdateUserRequest, UserFilter, UserPageResult } from '../../app/core/models/user.models';

export const loadUsers        = createAction('[Users] Load', props<{ filter: UserFilter }>());
export const loadUsersSuccess = createAction('[Users] Load Success', props<{ result: UserPageResult }>());
export const loadUsersFailure = createAction('[Users] Load Failure', props<{ error: string }>());

export const createUser        = createAction('[Users] Create', props<{ data: CreateUserRequest }>());
export const createUserSuccess = createAction('[Users] Create Success', props<{ user: User }>());
export const createUserFailure = createAction('[Users] Create Failure', props<{ error: string }>());

export const updateUser        = createAction('[Users] Update', props<{ id: string; data: UpdateUserRequest }>());
export const updateUserSuccess = createAction('[Users] Update Success', props<{ user: User }>());
export const updateUserFailure = createAction('[Users] Update Failure', props<{ error: string }>());

export const deactivateUser        = createAction('[Users] Deactivate', props<{ id: string }>());
export const deactivateUserSuccess = createAction('[Users] Deactivate Success', props<{ id: string }>());
export const deactivateUserFailure = createAction('[Users] Deactivate Failure', props<{ error: string }>());

export const resendInvite        = createAction('[Users] Resend Invite', props<{ id: string }>());
export const resendInviteSuccess = createAction('[Users] Resend Invite Success');
export const resendInviteFailure = createAction('[Users] Resend Invite Failure', props<{ error: string }>());

export const setUserFilter = createAction('[Users] Set Filter', props<{ filter: Partial<UserFilter> }>());
export const openUserForm  = createAction('[Users] Open Form', props<{ user: User | null }>());
export const closeUserForm = createAction('[Users] Close Form');
