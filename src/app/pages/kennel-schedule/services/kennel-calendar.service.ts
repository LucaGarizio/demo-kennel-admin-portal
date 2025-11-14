import { Injectable } from '@angular/core';
import { KennelRow } from '../types';
import { formatYmdLocal } from '../../../shared/utils/date-utils';

@Injectable()
export class KennelCalendarService {
  private readonly monthNames = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  generateRowsForYear(year: number): KennelRow[] {
    const rows: KennelRow[] = [];
    let prevMonth = -1;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const cur = new Date(d);
      const month = cur.getMonth();

      if (month !== prevMonth) {
        rows.push({ kind: 'month', label: this.monthNames[month] });
        prevMonth = month;
      }

      const key = formatYmdLocal(cur);
      const display = `${String(cur.getDate()).padStart(2, '0')}/${String(month + 1).padStart(
        2,
        '0'
      )}/${String(year).slice(-2)}`;
      rows.push({ kind: 'day', key, display, date: new Date(cur) });
    }
    return rows;
  }
}
