import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { loadMe } from '../../store/auth/auth.actions';
import { LayoutService } from '../../app/core/services/layout.service';

@Component({
  selector: 'ccd-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
  constructor(
    private readonly store: Store,
    public readonly layout: LayoutService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadMe());
  }
}
