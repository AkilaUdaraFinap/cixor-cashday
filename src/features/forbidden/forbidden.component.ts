import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../app/shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../app/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'ccd-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, EmptyStateComponent],
  template: `
    <ccd-page-header title="Access restricted" subtitle="You do not have permission to view this area" />

    <ccd-empty-state
      icon="lock"
      title="Permission required"
      description="Your current role does not allow access to this page or action. Contact an administrator if you need additional permissions."
      actionLabel="Go to dashboard"
      (action)="false"
    />

    <div class="forbidden-actions">
      <a routerLink="/dashboard" class="ccd-btn btn-primary">Return to dashboard</a>
    </div>
  `,
  styles: [`
    .forbidden-actions {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenComponent {}
