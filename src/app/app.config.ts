import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { reducers } from '../store';
import { AuthEffects } from '../store/auth/auth.effects';
import { DashboardEffects } from '../store/dashboard/dashboard.effects';
import { InvoicesEffects } from '../store/invoices/invoices.effects';
import { ExpensesEffects } from '../store/expenses/expenses.effects';
import { BankEffects } from '../store/bank/bank.effects';
import { ClientsEffects } from '../store/clients/clients.effects';
import { UsersEffects } from '../store/users/users.effects';
import { AuditEffects } from '../store/audit/audit.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([mockApiInterceptor, authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideStore(reducers),
    provideEffects([AuthEffects, DashboardEffects, InvoicesEffects, ExpensesEffects, BankEffects, ClientsEffects, UsersEffects, AuditEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
