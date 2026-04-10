import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectUserRole } from '../../../store/auth/auth.selectors';
import { UserRole } from '../../core/models/auth.models';

@Directive({ selector: '[ccdRole]', standalone: true })
export class CcdRoleDirective implements OnInit, OnDestroy {
  @Input('ccdRole') roles: UserRole | UserRole[] = [];
  private sub?: Subscription;
  private hasView = false;

  constructor(
    private tpl: TemplateRef<unknown>,
    private vcr: ViewContainerRef,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.sub = this.store.select(selectUserRole).subscribe(role => {
      const allowed = Array.isArray(this.roles) ? this.roles : [this.roles];
      const show = role != null && (allowed.length === 0 || allowed.includes(role));
      if (show && !this.hasView) { this.vcr.createEmbeddedView(this.tpl); this.hasView = true; }
      else if (!show && this.hasView) { this.vcr.clear(); this.hasView = false; }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
