import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { loadUsers, deactivateUser, resendInvite, openUserForm } from '../../store/users/users.actions';
import { selectUsers, selectUsersLoading } from '../../store/users/users.selectors';
import { User } from '../../app/core/models/user.models';
import { PageHeaderComponent } from '../../app/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../app/shared/components/status-badge/status-badge.component';
import { LoadingOverlayComponent } from '../../app/shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../app/shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../app/shared/components/confirm-dialog/confirm-dialog.component';
import { UiButtonComponent } from '../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../app/shared/components/ui-input/ui-input.component';
import { UiTableComponent } from '../../app/shared/components/ui-table/ui-table.component';
import { UserFormModalComponent } from './user-form-modal/user-form-modal.component';

@Component({
  selector: 'ccd-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    UiButtonComponent,
    UiInputComponent,
    UiTableComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly users$ = this.store.select(selectUsers);
  readonly loading$ = this.store.select(selectUsersLoading);
  readonly searchCtrl = new FormControl('', { nonNullable: true });

  constructor(
    private readonly store: Store,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadUsers({ filter: {} }));
    this.searchCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.store.dispatch(loadUsers({ filter: { search: query || undefined } }));
      });
  }

  openInvite(): void {
    this.store.dispatch(openUserForm({ user: null }));
    this.dialog.open(UserFormModalComponent, { width: '520px', panelClass: 'ccd-dialog' });
  }

  onEdit(user: User): void {
    this.store.dispatch(openUserForm({ user }));
    this.dialog.open(UserFormModalComponent, { width: '520px', panelClass: 'ccd-dialog' });
  }

  onDeactivate(user: User): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Deactivate User', message: `Deactivate ${user.firstName} ${user.lastName}? They will lose access immediately.`, danger: true } as ConfirmDialogData,
    }).afterClosed().subscribe(ok => { if (ok) this.store.dispatch(deactivateUser({ id: user.id })); });
  }

  onResendInvite(user: User): void {
    this.store.dispatch(resendInvite({ id: user.id }));
  }

  roleClass(role: string): string {
    return role
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  displayRole(role: string): string {
    const labels: Record<string, string> = {
      SuperAdmin: 'Admin',
      Admin: 'Admin',
      AccountsManager: 'Finance',
      Viewer: 'Sales',
    };

    return labels[role] ?? role;
  }
}
