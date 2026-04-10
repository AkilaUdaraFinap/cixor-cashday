import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice } from '../models/invoice.models';

export interface AcceptancePortalData {
  invoice: Invoice;
  businessName: string;
  officerName: string;
  officerEmail: string;
  expiresAt: string;
}

export interface OtpVerifyRequest { token: string; otp: string; }
export interface AcceptanceRequest { token: string; otp: string; confidenceScore: number; notes?: string; }
export interface RejectionRequest  { token: string; otp: string; reason: string; }

@Injectable({ providedIn: 'root' })
export class AcceptancePortalService {
  private url = `${environment.apiUrl}/portal`;
  constructor(private http: HttpClient) {}

  getPortalData(token: string): Observable<AcceptancePortalData> {
    return this.http.get<AcceptancePortalData>(`${this.url}/accept/${token}`);
  }

  sendOtp(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/accept/${token}/send-otp`, {});
  }

  verifyOtp(req: OtpVerifyRequest): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.url}/otp/verify`, req);
  }

  accept(req: AcceptanceRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/accept/confirm`, req);
  }

  reject(req: RejectionRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/accept/reject`, req);
  }
}
