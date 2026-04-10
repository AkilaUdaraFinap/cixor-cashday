import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {
  loadClient, addOfficer, removeOfficer,
} from '../../../store/clients/clients.actions';
import { selectSelectedClient, selectClientsLoading } from '../../../store/clients/clients.selectors';
import { PageHeaderComponent } from '../../../app/shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../../app/shared/components/loading-overlay/loading-overlay.component';
import { CurrencyFormatPipe } from '../../../app/shared/pipes/currency-format.pipe';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../app/shared/components/confirm-dialog/confirm-dialog.component';
import { OfficerFormModalComponent } from '../officer-form-modal/officer-form-modal.component';
import { ClientFormModalComponent } from '../client-form-modal/client-form-modal.component';

@Component({
  selector: 'ccd-client-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule,
    PageHeaderComponent, LoadingOverlayComponent, CurrencyFormatPipe,
  ],
  template: `
    @if (loading$ | async) {
      <ccd-loading [loading]="true" />
    }
    @if (client$ | async; as client) {
      <ccd-page-header [title]="client.name" [subtitle]="client.registrationNumber" backRoute="/clients">
        <button class="ccd-btn btn-ghost" (click)="openEdit(client)">
          <mat-icon>edit</mat-icon> Edit Client
        </button>
      </ccd-page-header>

      <div class="detail-grid">
        <!-- Info card -->
        <div>
          <div class="ccd-card mb-4">
            <div class="card-title mb-4">Contact Information</div>
            <div class="info-list">
              <div class="info-row"><mat-icon class="info-icon">email</mat-icon><span>{{ client.email }}</span></div>
              @if (client.phone) { <div class="info-row"><mat-icon class="info-icon">phone</mat-icon><span>{{ client.phone }}</span></div> }
              @if (client.website) { <div class="info-row"><mat-icon class="info-icon">language</mat-icon><span>{{ client.website }}</span></div> }
              @if (client.address) { <div class="info-row"><mat-icon class="info-icon">location_on</mat-icon><span>{{ client.address }}</span></div> }
              @if (client.vatNumber) { <div class="info-row"><mat-icon class="info-icon">receipt</mat-icon><span>VAT: {{ client.vatNumber }}</span></div> }
            </div>
          </div>

          <!-- Stats -->
          <div class="ccd-card mb-4">
            <div class="card-title mb-4">Financial Summary</div>
            <div class="stats-grid">
              <div class="stat-block"><div class="stat-label">Total Invoiced</div><div class="stat-num">{{ client.totalInvoiced | ccdCurrency }}</div></div>
              <div class="stat-block"><div class="stat-label">Outstanding</div><div class="stat-num danger">{{ client.outstandingBalance | ccdCurrency }}</div></div>
              <div class="stat-block"><div class="stat-label">Total Invoices</div><div class="stat-num">{{ client.totalInvoiced }}</div></div>
              <div class="stat-block"><div class="stat-label">Credit Limit</div><div class="stat-num">{{ client.creditLimit ? (client.creditLimit | ccdCurrency) : '—' }}</div></div>
            </div>
          </div>

          <!-- Quick links -->
          <div class="ccd-card">
            <div class="card-title mb-3">Quick Links</div>
            <a [routerLink]="['/invoices']" [queryParams]="{ clientId: client.id }" class="ccd-btn btn-ghost btn-sm mb-2">
              <mat-icon>receipt_long</mat-icon> View Invoices
            </a>
          </div>
        </div>

        <!-- Authorised Officers -->
        <div class="ccd-card">
          <div class="flex justify-between items-center mb-4">
            <div class="card-title">Authorised Officers</div>
            <button class="ccd-btn btn-ghost btn-sm" (click)="openAddOfficer(client.id)">
              <mat-icon>add</mat-icon> Add Officer
            </button>
          </div>
          @if (client.authorisedOfficers?.length === 0) {
            <p class="text-muted text-sm">No authorised officers added.</p>
          } @else {
            @for (officer of client.authorisedOfficers; track officer.id) {
              <div class="officer-row">
                <div class="officer-avatar">{{ officer.firstName[0] }}{{ officer.lastName[0] }}</div>
                <div class="flex-1">
                  <div class="officer-name">{{ officer.firstName }} {{ officer.lastName }}</div>
                  <div class="officer-title">{{ officer.title || 'Officer' }}</div>
                  <div class="text-xs text-muted">{{ officer.email }}</div>
                  @if (officer.phone) { <div class="text-xs text-muted">{{ officer.phone }}</div> }
                </div>
                <div class="flex gap-2">
                  <button class="icon-btn" (click)="openEditOfficer(client.id, officer)"><mat-icon>edit</mat-icon></button>
                  <button class="icon-btn danger" (click)="onRemoveOfficer(client.id, officer)"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
    .info-list { display: flex; flex-direction: column; gap: 10px; }
    .info-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--ccd-text); }
    .info-icon { font-size: 18px; width: 18px; height: 18px; color: var(--ccd-text-muted); flex-shrink: 0; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .stat-block { padding: 12px; background: var(--ccd-surface-2); border-radius: var(--radius-md); }
    .stat-label { font-size: 11px; color: var(--ccd-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .stat-num { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--ccd-text); &.danger { color: var(--ccd-danger); } }
    .officer-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--ccd-border); &:last-child { border-bottom: none; } }
    .officer-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--ccd-surface-2); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--ccd-text); flex-shrink: 0; }
    .officer-name { font-size: 14px; font-weight: 600; color: var(--ccd-text); }
    .officer-title { font-size: 12px; color: var(--ccd-text-muted); margin-bottom: 2px; }
    .icon-btn { background: none; border: none; cursor: pointer; color: var(--ccd-text-muted); display: flex; align-items: center; padding: 4px; border-radius: var(--radius-sm); &:hover { color: var(--ccd-text); background: var(--ccd-surface-2); } &.danger:hover { color: var(--ccd-danger); } }
    @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent implements OnInit {
  client$  = this.store.select(selectSelectedClient);
  loading$ = this.store.select(selectClientsLoading);

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    public router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.dispatch(loadClient({ id }));
  }

  openEdit(client: any): void {
    this.dialog.open(ClientFormModalComponent, {
      width: '580px', panelClass: 'ccd-dialog', data: { client },
    });
  }

  openAddOfficer(clientId: string): void {
    this.dialog.open(OfficerFormModalComponent, {
      width: '520px', panelClass: 'ccd-dialog', data: { clientId },
    });
  }

  openEditOfficer(clientId: string, officer: any): void {
    this.dialog.open(OfficerFormModalComponent, {
      width: '520px', panelClass: 'ccd-dialog', data: { clientId, officer },
    });
  }

  onRemoveOfficer(clientId: string, officer: any): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Remove Officer', message: `Remove ${officer.firstName} ${officer.lastName} as an authorised officer?`, danger: true } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => {
      if (ok) this.store.dispatch(removeOfficer({ clientId, officerId: officer.id }));
    });
  }
}
