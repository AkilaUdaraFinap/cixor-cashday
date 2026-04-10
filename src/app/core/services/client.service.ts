import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ClientFilter, ClientPageResult, AuthorisedOfficer } from '../models/client.models';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private url = `${environment.apiUrl}/clients`;
  constructor(private http: HttpClient) {}

  getAll(filter: ClientFilter): Observable<ClientPageResult> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 20);
    if (filter.search !== undefined) params = params.set('search', filter.search);
    if (filter.isActive !== undefined) params = params.set('isActive', String(filter.isActive));
    return this.http.get<ClientPageResult>(this.url, { params });
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.url}/${id}`);
  }

  create(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.url, client);
  }

  update(id: string, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.url}/${id}`, client);
  }

  addOfficer(clientId: string, officer: Partial<AuthorisedOfficer>): Observable<AuthorisedOfficer> {
    return this.http.post<AuthorisedOfficer>(`${this.url}/${clientId}/officers`, officer);
  }

  updateOfficer(clientId: string, officerId: string, data: Partial<AuthorisedOfficer>): Observable<AuthorisedOfficer> {
    return this.http.put<AuthorisedOfficer>(`${this.url}/${clientId}/officers/${officerId}`, data);
  }

  removeOfficer(clientId: string, officerId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${clientId}/officers/${officerId}`);
  }
}
