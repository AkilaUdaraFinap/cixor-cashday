import { UserRole } from './auth.models';
export { UserRole } from './auth.models';

export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Invited';

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UserPageResult {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}
