import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, AuthTokens, LoginRequest, RegisterRequest, SetPasswordRequest } from '../models/auth.models';

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, body).pipe(
      tap(res => this.storeTokens(res.tokens)),
    );
  }

  register(body: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/register`, body);
  }

  setPassword(body: SetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/set-password`, body).pipe(
      tap(res => this.storeTokens(res.tokens)),
    );
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('ccd_refresh_token');
    this.clearTokens();
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, { refreshToken: token });
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = localStorage.getItem('ccd_refresh_token');
    return this.http.post<AuthTokens>(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(tokens => this.storeTokens(tokens)),
    );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/auth/me`);
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('ccd_access_token', tokens.accessToken);
    localStorage.setItem('ccd_refresh_token', tokens.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('ccd_access_token');
    localStorage.removeItem('ccd_refresh_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('ccd_access_token');
  }
}
