import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FiltersState {
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
    this.state = { ...this.state, [key]: value };
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
