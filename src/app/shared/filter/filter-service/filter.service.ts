import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type GenericFilters = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class FiltersService {
  private filters$ = new BehaviorSubject<GenericFilters>({});

  getFilters() {
    return this.filters$.asObservable();
  }

  setFilters(values: GenericFilters) {
    this.filters$.next(values);
  }

  reset() {
    this.filters$.next({});
  }
}
