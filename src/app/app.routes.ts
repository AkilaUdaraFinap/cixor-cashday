import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    loadComponent: () => import('../layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: 'login',    loadComponent: () => import('../features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('../features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'set-password', loadComponent: () => import('../features/auth/set-password/set-password.component').then(m => m.SetPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  // Public acceptance portal (no login)
  {
    path: 'portal/accept/:token',
    loadComponent: () => import('../features/acceptance-portal/acceptance-portal.component').then(m => m.AcceptancePortalComponent),
  },
  {
    path: 'acceptance/portal/:token',
    loadComponent: () => import('../features/acceptance-portal/acceptance-portal.component').then(m => m.AcceptancePortalComponent),
  },
  {
    path: 'portal/consent/:token',
    loadComponent: () => import('../features/consent-portal/consent-portal.component').then(m => m.ConsentPortalComponent),
  },
  {
    path: 'consent/portal/:token',
    loadComponent: () => import('../features/consent-portal/consent-portal.component').then(m => m.ConsentPortalComponent),
  },
  // Protected app shell
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('../layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('../features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'forbidden', loadComponent: () => import('../features/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
      { path: 'invoices',  loadChildren: () => import('../features/invoices/invoices.routes').then(m => m.INVOICE_ROUTES) },
      {
        path: 'expenses',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin', 'AccountsManager'] },
        loadChildren: () => import('../features/expenses/expenses.routes').then(m => m.EXPENSE_ROUTES),
      },
      {
        path: 'bank',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin', 'AccountsManager'] },
        loadComponent: () => import('../features/bank/bank.component').then(m => m.BankComponent),
      },
      { path: 'clients',   loadChildren: () => import('../features/clients/clients.routes').then(m => m.CLIENT_ROUTES) },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
        loadComponent: () => import('../features/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
        loadComponent: () => import('../features/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'audit',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
        loadComponent: () => import('../features/audit/audit.component').then(m => m.AuditComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
