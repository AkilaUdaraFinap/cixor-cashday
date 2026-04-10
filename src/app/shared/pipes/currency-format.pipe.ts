import { Pipe, PipeTransform, inject } from '@angular/core';
import { WorkspacePreferencesService } from '../../core/services/workspace-preferences.service';

@Pipe({ name: 'ccdCurrency', standalone: true, pure: false })
export class CurrencyFormatPipe implements PipeTransform {
  private readonly preferences = inject(WorkspacePreferencesService);

  transform(value: number | null | undefined, currency?: string, decimals = 2, locale?: string): string {
    if (value == null) return '—';

    const resolvedCurrency = currency || this.preferences.currency();
    const resolvedLocale = locale || this.preferences.locale();

    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency: resolvedCurrency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
