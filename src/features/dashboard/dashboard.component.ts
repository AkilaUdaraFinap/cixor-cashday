import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { loadDashboard } from '../../store/dashboard/dashboard.actions';
import {
  selectDashboardAging,
  selectDashboardData,
  selectDashboardLoading,
  selectDashboardRevenue,
  selectRecentActivity,
  selectTopClients,
} from '../../store/dashboard/dashboard.selectors';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { CurrencyFormatPipe } from '../../app/shared/pipes/currency-format.pipe';
import { LoadingOverlayComponent } from '../../app/shared/components/loading-overlay/loading-overlay.component';
import { PageHeaderComponent } from '../../app/shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../app/shared/components/ui-card/ui-card.component';
import { Dashboard, ForecastDay, VerifiedInvoice } from '../../app/core/models/dashboard.models';

interface SimulationSummaryView {
  totalRequested: number;
  totalFees: number;
  netInjection: number;
  affectedInvoices: number;
}

interface SimulationLineItemView {
  invoice: VerifiedInvoice;
  amount: number;
  fee: number;
  netToReceive: number;
}

@Component({
  selector: 'ccd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    MatIconModule,
    RouterLink,
    CurrencyFormatPipe,
    LoadingOverlayComponent,
    PageHeaderComponent,
    UiCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly loading$ = this.store.select(selectDashboardLoading);
  readonly dashboard$ = this.store.select(selectDashboardData);
  readonly revenue$ = this.store.select(selectDashboardRevenue);
  readonly aging$ = this.store.select(selectDashboardAging);
  readonly topClients$ = this.store.select(selectTopClients);
  readonly activity$ = this.store.select(selectRecentActivity);
  readonly user$ = this.store.select(selectAuthUser);

  simulationAmounts: Record<string, number | null> = {};
  hypotheticalForecast: ForecastDay[] | null = null;
  simulationSummary: SimulationSummaryView | null = null;
  confirmDialogOpen = false;
  liquidationPendingMessage = '';
  private readonly platformFeeRate = 0.025;
  private pendingInvoiceIds = new Set<string>();

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadDashboard());
  }

  getRevenueSeries(rev: { month: string; invoiced: number; collected: number; expenses: number }[]): any[] {
    return [
      { name: 'Invoiced', data: rev.map(r => r.invoiced) },
      { name: 'Collected', data: rev.map(r => r.collected) },
      { name: 'Expenses', data: rev.map(r => r.expenses) },
    ];
  }

  getRevenueXAxis(rev: { month: string }[]): any {
    return { categories: rev.map(r => r.month), labels: { style: { colors: '#8D96A0' } } };
  }

  getForecastSeries(dashboard: Dashboard): any[] {
    const actual = dashboard.forecast.map(point => point.projectedCash);
    const series = [{ name: 'Actual forecast', data: actual }];

    if (this.hypotheticalForecast?.length) {
      series.push({ name: 'With liquidation', data: this.hypotheticalForecast.map(point => point.projectedCash) });
    }

    return series;
  }

  getForecastXAxis(dashboard: Dashboard): any {
    return {
      categories: dashboard.forecast.map((point, index) => {
        if (index < 30) {
          return `D${point.day}`;
        }

        return index === 59 ? 'Day 60' : index === 89 ? 'Day 90' : '';
      }),
      labels: { style: { colors: '#8D96A0' } },
    };
  }

  getForecastStroke(): any {
    return {
      width: this.hypotheticalForecast?.length ? [3, 3] : [3],
      curve: 'smooth',
      dashArray: this.hypotheticalForecast?.length ? [0, 7] : [0],
    };
  }

  getForecastColors(): string[] {
    return this.hypotheticalForecast?.length ? ['#00C9A7', '#00BFFF'] : ['#00C9A7'];
  }

  totalAging(a: { current: { amount: number }; days1_30: { amount: number }; days31_60: { amount: number }; days61_90: { amount: number }; over90: { amount: number } }): number {
    return (a.current.amount + a.days1_30.amount + a.days31_60.amount + a.days61_90.amount + a.over90.amount) || 1;
  }

  totalAvailableToLiquidate(invoices: VerifiedInvoice[]): number {
    return invoices.reduce((sum, invoice) => sum + invoice.availableToLiquidate, 0);
  }

  setSimulationAmount(invoiceId: string, value: number | string | null): void {
    const numeric = value == null || value === '' ? null : Number(value);
    this.simulationAmounts[invoiceId] = numeric == null || Number.isNaN(numeric) ? null : numeric;
  }

  applySimulation(dashboard: Dashboard): void {
    const requestedInvoices = dashboard.verifiedInvoices
      .map(invoice => ({
        invoice,
        amount: this.clampAmount(this.simulationAmounts[invoice.id], invoice.availableToLiquidate),
      }))
      .filter(item => item.amount > 0);

    if (!requestedInvoices.length) {
      this.resetSimulation();
      return;
    }

    const totalRequested = requestedInvoices.reduce((sum, item) => sum + item.amount, 0);
    const totalFees = requestedInvoices.reduce((sum, item) => sum + item.amount * item.invoice.feePercent, 0);
    const netInjection = Math.round((totalRequested - totalFees) * 100) / 100;
    const firstSettlementIndex = 2;

    this.hypotheticalForecast = dashboard.forecast.map((day, index) => ({
      ...day,
      projectedCash: Math.round((day.projectedCash + (index >= firstSettlementIndex ? netInjection : 0)) * 100) / 100,
    }));

    this.simulationSummary = {
      totalRequested,
      totalFees,
      netInjection,
      affectedInvoices: requestedInvoices.length,
    };
    this.liquidationPendingMessage = '';
  }

  resetSimulation(): void {
    this.simulationAmounts = {};
    this.hypotheticalForecast = null;
    this.simulationSummary = null;
    this.confirmDialogOpen = false;
  }

  openConfirmation(): void {
    if (!this.simulationSummary) {
      return;
    }

    this.confirmDialogOpen = true;
  }

  closeConfirmation(): void {
    this.confirmDialogOpen = false;
  }

  confirmLiquidation(dashboard: Dashboard): void {
    const requestedIds = dashboard.verifiedInvoices
      .filter(invoice => this.clampAmount(this.simulationAmounts[invoice.id], invoice.availableToLiquidate) > 0)
      .map(invoice => invoice.id);

    this.pendingInvoiceIds = new Set(requestedIds);
    this.liquidationPendingMessage = `${requestedIds.length} liquidation request(s) submitted. Awaiting buyer consent within 48 hours.`;
    this.confirmDialogOpen = false;
    this.resetSimulation();
  }

  hasPendingIntent(invoice: VerifiedInvoice): boolean {
    return !!invoice.hasActiveIntent || this.pendingInvoiceIds.has(invoice.id);
  }

  suggestedAmount(invoice: VerifiedInvoice): number {
    return Math.round(invoice.availableToLiquidate * 0.65);
  }

  applySuggestedAmount(invoice: VerifiedInvoice, dashboard: Dashboard): void {
    this.simulationAmounts[invoice.id] = this.suggestedAmount(invoice);
    this.applySimulation(dashboard);
  }

  canRequestLiquidation(role?: string | null): boolean {
    return ['Admin', 'SuperAdmin', 'AccountsManager'].includes(role ?? '');
  }

  activityIcon(type: string): string {
    const map: Record<string, string> = {
      invoice_created: 'receipt_long',
      invoice_paid: 'check_circle',
      expense_submitted: 'payments',
      user_login: 'login',
      funding_approved: 'account_balance',
    };

    return map[type] ?? 'circle';
  }

  daysToMaturity(invoice: VerifiedInvoice): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / msPerDay);
  }

  selectedSimulationInvoices(dashboard: Dashboard): SimulationLineItemView[] {
    return dashboard.verifiedInvoices
      .map(invoice => {
        const amount = this.clampAmount(this.simulationAmounts[invoice.id], invoice.availableToLiquidate);
        const fee = Math.round(amount * invoice.feePercent * 100) / 100;

        return {
          invoice,
          amount,
          fee,
          netToReceive: Math.round((amount - fee) * 100) / 100,
        };
      })
      .filter(item => item.amount > 0);
  }

  lowestProjectedCash(dashboard: Dashboard, simulated = false): number {
    const points = simulated && this.hypotheticalForecast?.length ? this.hypotheticalForecast : dashboard.forecast;
    return points.reduce((min, point) => Math.min(min, point.projectedCash), Number.POSITIVE_INFINITY);
  }

  lowestProjectedCashDate(dashboard: Dashboard, simulated = false): string {
    const points = simulated && this.hypotheticalForecast?.length ? this.hypotheticalForecast : dashboard.forecast;
    const lowest = points.reduce((candidate, point) => point.projectedCash < candidate.projectedCash ? point : candidate, points[0]);
    return new Date(lowest.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  breakEvenText(dashboard: Dashboard, simulated = false): string {
    const points = simulated && this.hypotheticalForecast?.length ? this.hypotheticalForecast : dashboard.forecast;

    if (points.every(point => point.projectedCash >= 0)) {
      return 'Already positive ✓';
    }

    const breakEven = points.find(point => point.projectedCash >= 0);
    return breakEven
      ? new Date(breakEven.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Not within 90 days';
  }

  private clampAmount(value: number | null | undefined, max: number): number {
    if (value == null || Number.isNaN(Number(value))) {
      return 0;
    }

    return Math.max(0, Math.min(Number(value), max));
  }
}
