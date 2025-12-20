import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private state: FiltersState = {};

  private subject$ = new BehaviorSubject<FiltersState>({});

  watch() {
    return this.subject$.asObservable();
  }

  set(key: keyof FiltersState, value: any) {
    const currentYear = new Date().getFullYear().toString();

    if (key === 'year') {
      this.state = { ...this.state, year: value, month: 'all' };
    } else if (key === 'period' && value !== 'all') {
      this.state = { ...this.state, period: value, year: currentYear, month: 'all' };
    } else {
      this.state = { ...this.state, [key]: value };
    }

    this.subject$.next({ ...this.state });
  }
  getSnapshot(): FiltersState {
    return { ...this.state };
  }

  reset() {
    this.state = {};
    this.subject$.next({});
  }
}
