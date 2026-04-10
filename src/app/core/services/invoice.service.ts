import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, InvoiceFilter, InvoicePageResult } from '../models/invoice.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private url = `${environment.apiUrl}/invoices`;
  constructor(private http: HttpClient) {}

  getAll(filter: InvoiceFilter): Observable<InvoicePageResult> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 20);
    if (filter.status)   params = params.set('status', filter.status);
    if (filter.clientId) params = params.set('clientId', filter.clientId);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate)   params = params.set('toDate', filter.toDate);
    if (filter.search)   params = params.set('search', filter.search);
    return this.http.get<InvoicePageResult>(this.url, { params });
  }

  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.url}/${id}`);
  }

  create(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(this.url, invoice);
  }

  update(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.url}/${id}`, invoice);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  send(id: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.url}/${id}/send`, {});
  }

  requestFunding(id: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.url}/${id}/request-funding`, {});
  }

  markPaid(id: string, amount: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.url}/${id}/mark-paid`, { amount });
  }
}
