import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditFilter, AuditPageResult } from '../models/audit.models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private url = `${environment.apiUrl}/audit`;
  constructor(private http: HttpClient) {}

  getAll(filter: AuditFilter): Observable<AuditPageResult> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 30);
    if (filter.action)     params = params.set('action', filter.action);
    if (filter.userId)     params = params.set('userId', filter.userId);
    if (filter.entityType) params = params.set('entityType', filter.entityType);
    if (filter.fromDate)   params = params.set('fromDate', filter.fromDate);
    if (filter.toDate)     params = params.set('toDate', filter.toDate);
    return this.http.get<AuditPageResult>(this.url, { params });
  }
}
