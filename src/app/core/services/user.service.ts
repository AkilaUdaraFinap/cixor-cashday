import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest, UserFilter, UserPageResult } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getAll(filter: UserFilter): Observable<UserPageResult> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 20);
    if (filter.role)   params = params.set('role', filter.role);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.search) params = params.set('search', filter.search);
    return this.http.get<UserPageResult>(this.url, { params });
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.url, data);
  }

  update(id: string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, data);
  }

  deactivate(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/deactivate`, {});
  }

  resendInvite(id: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/resend-invite`, {});
  }
}
