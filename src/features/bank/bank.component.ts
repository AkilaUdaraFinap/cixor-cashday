import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, startWith, take } from 'rxjs';
import { loadAccounts, loadTransactions, loadCashFlow, selectAccount } from '../../store/bank/bank.actions';
import {
  selectBankAccounts, selectSelectedBankAccountId, selectBankTransactions,
  selectBankLoading, selectBankCashFlow,
} from '../../store/bank/bank.selectors';
import { loadDashboard } from '../../store/dashboard/dashboard.actions';
import { selectDashboardData } from '../../store/dashboard/dashboard.selectors';
import { CashFlowPoint, BankTransaction } from '../../app/core/models/bank.models';
import { PageHeaderComponent } from '../../app/shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../app/shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../app/shared/components/empty-state/empty-state.component';
import { CurrencyFormatPipe } from '../../app/shared/pipes/currency-format.pipe';
import { UiCardComponent } from '../../app/shared/components/ui-card/ui-card.component';
import { UiInputComponent } from '../../app/shared/components/ui-input/ui-input.component';
import { UiTableComponent } from '../../app/shared/components/ui-table/ui-table.component';
import { WorkspacePreferencesService } from '../../app/core/services/workspace-preferences.service';

@Component({
  selector: 'ccd-bank',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    CurrencyFormatPipe,
    UiCardComponent,
    UiInputComponent,
    UiTableComponent,
  ],
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankComponent implements OnInit {
  readonly accounts$ = this.store.select(selectBankAccounts);
  readonly selectedId$ = this.store.select(selectSelectedBankAccountId);
  readonly transactions$ = this.store.select(selectBankTransactions);
  readonly loading$ = this.store.select(selectBankLoading);
  readonly cashFlow$ = this.store.select(selectBankCashFlow);
  readonly dashboard$ = this.store.select(selectDashboardData);
  readonly searchCtrl = new FormControl('', { nonNullable: true });

  readonly chartConfig = {
    type: 'area' as const,
    height: 220,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: 'var(--ccd-text-muted)',
  };
  readonly dataLabelsConfig = { enabled: false };
  readonly strokeConfig = { curve: 'smooth' as const, width: 2 };
  readonly chartColors = ['#10b981'];
  readonly fillConfig = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] } };
  readonly yAxisConfig = { labels: { formatter: (value: number) => this.formatAxisCurrency(value) } };
  readonly gridConfig = { borderColor: 'var(--ccd-chart-grid)' };
  readonly tooltipConfig = { theme: 'dark' as const };

  readonly filteredTx$ = combineLatest([
    this.transactions$,
    this.searchCtrl.valueChanges.pipe(startWith(this.searchCtrl.value), debounceTime(250), distinctUntilChanged()),
  ]).pipe(
    map(([transactions, query]: [BankTransaction[], string]) =>
      !query
        ? transactions
        : transactions.filter(transaction =>
            transaction.description?.toLowerCase().includes(query.toLowerCase()) ||
            transaction.reference?.toLowerCase().includes(query.toLowerCase()),
          ),
    ),
  );

  constructor(
    private readonly store: Store,
    private readonly preferences: WorkspacePreferencesService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadAccounts());
    this.store.dispatch(loadDashboard());

    this.accounts$
      .pipe(filter(accounts => accounts.length > 0), take(1))
      .subscribe(accounts => {
        this.onSelectAccount(accounts[0].id);
      });
  }

  onSelectAccount(id: string): void {
    const today = new Date().toISOString().split('T')[0];
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.store.dispatch(selectAccount({ accountId: id }));
    this.store.dispatch(loadTransactions({ filter: { accountId: id } }));
    this.store.dispatch(loadCashFlow({ from: ninetyDaysAgo, to: today }));
  }

  getCfSeries(cf: CashFlowPoint[]): { name: string; data: number[] }[] {
    return [{ name: 'Net flow', data: cf.map((point: CashFlowPoint) => point.net) }];
  }

  getCfXAxis(cf: CashFlowPoint[]): { categories: string[] } {
    return { categories: cf.map((point: CashFlowPoint) => point.date) };
  }

  private formatAxisCurrency(value: number): string {
    return `${this.preferences.currency()} ${Math.round(value).toLocaleString()}`;
  }
}
