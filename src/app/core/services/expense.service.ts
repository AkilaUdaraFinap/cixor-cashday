import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Expense, ExpenseFilter, ExpensePageResult, ExpenseSummary } from '../models/expense.models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private url = `${environment.apiUrl}/expenses`;
  constructor(private http: HttpClient) {}

  getAll(filter: ExpenseFilter): Observable<ExpensePageResult> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 20);
    if (filter.status)   params = params.set('status', filter.status);
    if (filter.category) params = params.set('category', filter.category);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate)   params = params.set('toDate', filter.toDate);
    if (filter.search)   params = params.set('search', filter.search);
    return this.http.get<ExpensePageResult>(this.url, { params });
  }

  getById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.url}/${id}`);
  }

  getSummary(): Observable<ExpenseSummary> {
    return this.http.get<ExpenseSummary>(`${this.url}/summary`);
  }

  create(expense: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(this.url, expense);
  }

  update(id: string, expense: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.url}/${id}`, expense);
  }

  approve(id: string): Observable<Expense> {
    return this.http.post<Expense>(`${this.url}/${id}/approve`, {});
  }

  reject(id: string, reason?: string): Observable<Expense> {
    return this.http.post<Expense>(`${this.url}/${id}/reject`, { reason });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
