import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthFeatureState } from './auth/auth.reducer';
import { dashboardReducer, DashboardFeatureState } from './dashboard/dashboard.reducer';
import { invoicesReducer, InvoicesFeatureState } from './invoices/invoices.reducer';
import { expensesReducer, ExpensesFeatureState } from './expenses/expenses.reducer';
import { bankReducer, BankFeatureState } from './bank/bank.reducer';
import { clientsReducer, ClientsFeatureState } from './clients/clients.reducer';
import { usersReducer, UsersFeatureState } from './users/users.reducer';
import { auditReducer, AuditState } from './audit/audit.reducer';

export interface AppState {
  auth:      AuthFeatureState;
  dashboard: DashboardFeatureState;
  invoices:  InvoicesFeatureState;
  expenses:  ExpensesFeatureState;
  bank:      BankFeatureState;
  clients:   ClientsFeatureState;
  users:     UsersFeatureState;
  audit:     AuditState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth:      authReducer,
  dashboard: dashboardReducer,
  invoices:  invoicesReducer,
  expenses:  expensesReducer,
  bank:      bankReducer,
  clients:   clientsReducer,
  users:     usersReducer,
  audit:     auditReducer,
};
