import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private filtersSubject = new BehaviorSubject({
    nome: '',
    razza: '',
    vaccinato: null as boolean | null,
    adottato: null as boolean | null,
  });

  filters$ = this.filtersSubject.asObservable();

  get filters() {
    return this.filtersSubject.value;
  }

  updateFilters(partial: Partial<typeof this.filters>) {
    this.filtersSubject.next({ ...this.filters, ...partial });
  }

  reset() {
    this.filtersSubject.next({
      nome: '',
      razza: '',
      vaccinato: null,
      adottato: null,
    });
  }
}
