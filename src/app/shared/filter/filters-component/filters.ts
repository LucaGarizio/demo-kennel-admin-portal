import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FilterConfig } from '../types/filter.types';
import { InputTextModule } from 'primeng/inputtext';
import { toPocketDate } from '../../utils/date-utils';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, InputTextModule],
  templateUrl: './filters.html',
  styleUrls: ['./filters.scss'],
})
export class Filters {
  @Input() config: FilterConfig[] = [];

  @Output() changed = new EventEmitter<Record<string, any>>();

  model: Record<string, any> = {};

  update() {
    console.log('%c[FILTERS] Raw model:', 'color: #42a5f5', this.model);

    const out: Record<string, any> = {};

    for (const c of this.config) {
      const val = this.model[c.key];

      if (c.type === 'date' && val) {
        const formatted = this.formatDate(val);
        console.log(`%c[FILTERS] Formatting date for key "${c.key}":`, 'color: #ab47bc', {
          raw: val,
          formatted,
        });
        out[c.key] = formatted;
      } else {
        out[c.key] = val ?? null;
      }
    }

    console.log('%c[FILTERS] Emitting:', 'color: #66bb6a', out);

    this.changed.emit(out);
  }

  private formatDate(v: any): string | null {
    return toPocketDate(v); // <-- usa il tuo formatter ufficiale
  }
}
