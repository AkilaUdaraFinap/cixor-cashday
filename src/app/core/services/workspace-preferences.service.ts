import { Injectable, computed, signal } from '@angular/core';

export interface WorkspacePreferences {
  country: string;
  currency: string;
  locale: string;
}

const DEFAULT_PREFERENCES: WorkspacePreferences = {
  country: 'South Africa',
  currency: 'ZAR',
  locale: 'en-ZA',
};

@Injectable({ providedIn: 'root' })
export class WorkspacePreferencesService {
  private readonly storageKey = 'ccd-workspace-preferences';
  readonly preferences = signal<WorkspacePreferences>(this.load());
  readonly country = computed(() => this.preferences().country);
  readonly currency = computed(() => this.preferences().currency);
  readonly locale = computed(() => this.preferences().locale);

  updateCompanyPreferences(preferences: Partial<WorkspacePreferences>): void {
    const next = { ...this.preferences(), ...preferences };
    this.preferences.set(next);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(next));
    }
  }

  private load(): WorkspacePreferences {
    if (typeof window === 'undefined') {
      return DEFAULT_PREFERENCES;
    }

    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } as WorkspacePreferences;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
}
