import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, computed, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark' | 'cashday-classic';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'ccd-theme';
  readonly theme = signal<AppTheme>(this.getInitialTheme());
  readonly isDark = computed(() => this.theme() === 'dark');
  readonly isCashdayClassic = computed(() => this.theme() === 'cashday-classic');

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.applyTheme(this.theme());
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  private getInitialTheme(): AppTheme {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const savedTheme = window.localStorage.getItem(this.storageKey);
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'cashday-classic') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
    this.document.body.classList.toggle('theme-dark', theme === 'dark');
    this.document.body.classList.toggle('theme-light', theme === 'light');
    this.document.body.classList.toggle('theme-cashday-classic', theme === 'cashday-classic');

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, theme);
    }
  }
}
