import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { logout } from '../../store/auth/auth.actions';
import { ThemeService } from '../../app/core/services/theme.service';
import { LayoutService } from '../../app/core/services/layout.service';
import { CcdRoleDirective } from '../../app/shared/directives/ccd-role.directive';

@Component({
  selector: 'ccd-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule, MatTooltipModule, CcdRoleDirective],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent implements OnInit {
  readonly user$ = this.store.select(selectAuthUser);
  readonly notifications = [
    { id: 1, title: 'Buyer consent pending', body: '2 liquidation requests are awaiting debtor confirmation.', time: '5 min ago', unread: true, icon: 'mark_email_unread' },
    { id: 2, title: 'Low cash warning', body: 'Projected cash dips below the safety threshold in 18 days.', time: '22 min ago', unread: true, icon: 'warning' },
    { id: 3, title: 'Invoice accepted', body: 'INV-2026-004 was accepted with 92% payment confidence.', time: '1 hr ago', unread: false, icon: 'task_alt' },
  ];

  pageTitle = 'Dashboard';
  pageSubtitle = 'Operations workspace';

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    public readonly theme: ThemeService,
    public readonly layout: LayoutService,
  ) {}

  ngOnInit(): void {
    this.updateRouteContext(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const navigation = event as NavigationEnd;
        this.updateRouteContext(navigation.urlAfterRedirects);
      });
  }

  get unreadCount(): number {
    return this.notifications.filter(item => item.unread).length;
  }

  onLogout(): void {
    this.store.dispatch(logout());
  }

  userInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
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

  private updateRouteContext(url: string): void {
    const key = url.split('?')[0].split('/').filter(Boolean)[0] ?? 'dashboard';
    const labels: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: 'Dashboard', subtitle: 'Cash forecast and liquidation planning' },
      invoices: { title: 'Invoices', subtitle: 'Receivables, acceptance, and funding' },
      expenses: { title: 'Expenses', subtitle: 'Operational spend and approvals' },
      bank: { title: 'Bank', subtitle: 'Balance, overdraft, and cash movement' },
      clients: { title: 'Clients', subtitle: 'Debtors, officers, and credit health' },
      users: { title: 'Users', subtitle: 'Workspace access and roles' },
      settings: { title: 'Settings', subtitle: 'Company, templates, and notifications' },
      audit: { title: 'Audit', subtitle: 'Activity history and compliance trail' },
      auth: { title: 'Welcome', subtitle: 'Secure access to your workspace' },
      portal: { title: 'Secure portal', subtitle: 'Invoice review and consent' },
    };

    const resolved = labels[key] ?? labels['dashboard'];
    this.pageTitle = resolved.title;
    this.pageSubtitle = resolved.subtitle;
  }
}
