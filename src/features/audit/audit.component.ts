import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime } from 'rxjs/operators';
import { loadAuditLogs } from '../../store/audit/audit.actions';
import { selectAllAuditLogs, selectAuditLoading, selectAuditPagination } from '../../store/audit/audit.selectors';
import { PageHeaderComponent } from '../../app/shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../app/shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../app/shared/components/empty-state/empty-state.component';
import { UiButtonComponent } from '../../app/shared/components/ui-button/ui-button.component';
import { UiCardComponent } from '../../app/shared/components/ui-card/ui-card.component';
import { UiTableComponent } from '../../app/shared/components/ui-table/ui-table.component';

@Component({
  selector: 'ccd-audit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    UiButtonComponent,
    UiCardComponent,
    UiTableComponent,
  ],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly logs$ = this.store.select(selectAllAuditLogs);
  readonly loading$ = this.store.select(selectAuditLoading);
  readonly pagination$ = this.store.select(selectAuditPagination);
  readonly filterForm: FormGroup = this.fb.group({ userId: [''], action: [''], dateFrom: [''], dateTo: [''] });

  readonly actionOptions = ['Login', 'Logout', 'Create', 'Update', 'Delete', 'Send', 'Approve', 'Reject'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadAuditLogs({ filter: { page: 1, pageSize: 30 } }));
    this.filterForm.valueChanges
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.store.dispatch(loadAuditLogs({
          filter: {
            userId: value.userId || undefined,
            action: value.action || undefined,
            fromDate: value.dateFrom || undefined,
            toDate: value.dateTo || undefined,
            page: 1,
            pageSize: 30,
          },
        }));
      });
  }

  clearFilters(): void {
    this.filterForm.reset({ userId: '', action: '', dateFrom: '', dateTo: '' });
    this.store.dispatch(loadAuditLogs({ filter: { page: 1, pageSize: 30 } }));
  }

  actionClass(action: string): string {
    const lower = action.toLowerCase();
    if (lower.includes('create') || lower.includes('add')) return 'create';
    if (lower.includes('update') || lower.includes('edit')) return 'update';
    if (lower.includes('delete') || lower.includes('remove')) return 'delete';
    if (lower.includes('login')) return 'login';
    return '';
  }

  prevPage(page: number, pageSize: number): void {
    this.store.dispatch(loadAuditLogs({ filter: { page: page - 1, pageSize } }));
  }

  nextPage(page: number, pageSize: number): void {
    this.store.dispatch(loadAuditLogs({ filter: { page: page + 1, pageSize } }));
  }

  total(pg: { totalCount: number; pageSize: number }): number {
    return Math.max(1, Math.ceil(pg.totalCount / pg.pageSize));
  }
}
