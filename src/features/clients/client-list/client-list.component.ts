import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { loadClients } from '../../../store/clients/clients.actions';
import { selectClientItems, selectClientsLoading } from '../../../store/clients/clients.selectors';
import { PageHeaderComponent } from '../../../app/shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../../app/shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../../app/shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../../app/shared/pipes/currency-format.pipe';
import { UiButtonComponent } from '../../../app/shared/components/ui-button/ui-button.component';
import { UiInputComponent } from '../../../app/shared/components/ui-input/ui-input.component';
import { CcdRoleDirective } from '../../../app/shared/directives/ccd-role.directive';
import { ClientFormModalComponent } from '../client-form-modal/client-form-modal.component';

@Component({
  selector: 'ccd-client-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    CurrencyFormatPipe,
    UiButtonComponent,
    UiInputComponent,
    CcdRoleDirective,
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly clients$ = this.store.select(selectClientItems);
  readonly loading$ = this.store.select(selectClientsLoading);
  readonly searchCtrl = new FormControl('', { nonNullable: true });

  constructor(
    private readonly store: Store,
    public readonly router: Router,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadClients({ filter: {} }));

    this.searchCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.store.dispatch(loadClients({ filter: { search: query || undefined } }));
      });
  }

  openNewClient(): void {
    this.dialog.open(ClientFormModalComponent, { width: '580px', panelClass: 'ccd-dialog' });
  }

  openClient(clientId: string): void {
    this.router.navigate(['/clients', clientId]);
  }
}
