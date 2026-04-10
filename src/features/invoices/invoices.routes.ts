import { Routes } from '@angular/router';
import { roleGuard } from '../../app/core/guards/role.guard';

export const INVOICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'SuperAdmin', 'AccountsManager'] },
    loadComponent: () => import('./invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'SuperAdmin', 'AccountsManager'] },
    loadComponent: () => import('./invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
  },
];
