import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  loadExpenses, loadExpenseSummary, approveExpense, rejectExpense, deleteExpense, openExpenseForm,
} from '../../../store/expenses/expenses.actions';
import {
  selectExpenses, selectExpensesLoading, selectExpenseSummary,
} from '../../../store/expenses/expenses.selectors';
import { ExpenseStatus } from '../../../app/core/models/expense.models';
import { StatusBadgeComponent } from '../../../app/shared/components/status-badge/status-badge.component';
import { LoadingOverlayComponent } from '../../../app/shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../../app/shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../app/shared/components/page-header/page-header.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../app/shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyFormatPipe } from '../../../app/shared/pipes/currency-format.pipe';
import { UiButtonComponent } from '../../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';
import { UiTableComponent } from '../../../app/shared/components/ui-table/ui-table.component';
import { ExpenseFormModalComponent } from '../expense-form-modal/expense-form-modal.component';
import { CcdRoleDirective } from '../../../app/shared/directives/ccd-role.directive';

@Component({
  selector: 'ccd-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    StatusBadgeComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    CurrencyFormatPipe,
    UiButtonComponent,
    UiInputComponent,
    UiTableComponent,
    CcdRoleDirective,
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly expenses$ = this.store.select(selectExpenses);
  readonly loading$ = this.store.select(selectExpensesLoading);
  readonly summary$ = this.store.select(selectExpenseSummary);
  readonly searchCtrl = new FormControl('', { nonNullable: true });
  activeStatus: ExpenseStatus | undefined;

  readonly statusOptions: { value: ExpenseStatus | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  constructor(
    private readonly store: Store,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadExpenses({ filter: {} }));
    this.store.dispatch(loadExpenseSummary());
    this.searchCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.store.dispatch(loadExpenses({ filter: { search: query || undefined } }));
      });
  }

  setStatus(status: ExpenseStatus | undefined): void {
    this.activeStatus = status;
    this.store.dispatch(loadExpenses({ filter: { status } }));
  }

  openForm(): void {
    this.store.dispatch(openExpenseForm({ expense: null }));
    this.dialog.open(ExpenseFormModalComponent, { width: '560px', panelClass: 'ccd-dialog' });
  }

  canApprove(expense: { status: ExpenseStatus }): boolean {
    return !['Approved', 'Paid'].includes(expense.status);
  }

  canReject(expense: { status: ExpenseStatus }): boolean {
    return !['Rejected', 'Paid'].includes(expense.status);
  }

  onEdit(expense: any): void {
    this.store.dispatch(openExpenseForm({ expense }));
    this.dialog.open(ExpenseFormModalComponent, { width: '560px', panelClass: 'ccd-dialog' });
  }

  onApprove(expense: any): void {
    if (!this.canApprove(expense)) {
      return;
    }

    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Approve Expense', message: `Approve expense "${expense.description}"?` } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(approveExpense({ id: expense.id })); });
  }

  onReject(expense: any): void {
    if (!this.canReject(expense)) {
      return;
    }

    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Reject Expense', message: `Reject expense "${expense.description}"?`, danger: true } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(rejectExpense({ id: expense.id })); });
  }

  onDelete(expense: any): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Expense', message: `Permanently delete "${expense.description}"?`, danger: true } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(deleteExpense({ id: expense.id })); });
  }
}
