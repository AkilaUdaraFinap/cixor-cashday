import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { logout } from '../../store/auth/auth.actions';
import { CcdRoleDirective } from '../../app/shared/directives/ccd-role.directive';
import { LayoutService } from '../../app/core/services/layout.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'ccd-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, CcdRoleDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly user$ = this.store.select(selectAuthUser);

  readonly mainNav: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Invoices', icon: 'receipt_long', route: '/invoices' },
    { label: 'Clients', icon: 'people', route: '/clients' },
  ];

  readonly financeNav: NavItem[] = [
    { label: 'Expenses', icon: 'payments', route: '/expenses' },
    { label: 'Bank', icon: 'account_balance', route: '/bank' },
  ];

  readonly adminNav: NavItem[] = [
    { label: 'Users', icon: 'manage_accounts', route: '/users' },
    { label: 'Audit', icon: 'history', route: '/audit' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  constructor(
    private readonly store: Store,
    private readonly layout: LayoutService,
  ) {}

  onLogout(): void {
    this.layout.closeSidebar();
    this.store.dispatch(logout());
  }

  closeSidebar(): void {
    this.layout.closeSidebar();
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
}
