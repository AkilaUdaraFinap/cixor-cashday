import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BankAccount, BankFilter, BankPageResult, CashFlowPoint } from '../models/bank.models';

@Injectable({ providedIn: 'root' })
export class BankService {
  private url = `${environment.apiUrl}/bank`;
  constructor(private http: HttpClient) {}

  getAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.url}/accounts`);
  }

  getTransactions(filter: BankFilter): Observable<BankPageResult> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 20);
    if (filter.accountId) params = params.set('accountId', filter.accountId);
    if (filter.type)      params = params.set('type', filter.type);
    if (filter.category)  params = params.set('category', filter.category);
    if (filter.fromDate)  params = params.set('fromDate', filter.fromDate);
    if (filter.toDate)    params = params.set('toDate', filter.toDate);
    return this.http.get<BankPageResult>(`${this.url}/transactions`, { params });
  }

  getCashFlow(from: string, to: string): Observable<CashFlowPoint[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CashFlowPoint[]>(`${this.url}/cashflow`, { params });
  }
}
