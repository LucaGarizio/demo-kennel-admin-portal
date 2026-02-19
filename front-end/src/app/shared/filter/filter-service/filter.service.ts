import { Injectable, signal, inject, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export interface FiltersState {
  year?: string;
  month?: string;
  period?: string;
  dog_name?: string;
  owner_name?: string;
  owner_surname?: string;
  phone_number?: string;
  microchip?: string;
  payment_type?: string;
}

@Injectable({ providedIn: 'root' })
export class FiltersService {
  readonly state = signal<FiltersState>({});

  private injector = inject(Injector);

  watch() {
    return toObservable(this.state, { injector: this.injector });
  }

  set(key: keyof FiltersState, value: any) {
    const currentYear = new Date().getFullYear().toString();

    this.state.update(state => {
      if (key === 'year') {
        return { ...state, year: value, month: 'all' };
      } else if (key === 'period' && value !== 'all') {
        return { ...state, period: value, year: currentYear, month: 'all' };
      } else {
        return { ...state, [key]: value };
      }
    });
  }

  getSnapshot(): FiltersState {
    return this.state();
  }

  reset() {
    this.state.set({});
  }
}
