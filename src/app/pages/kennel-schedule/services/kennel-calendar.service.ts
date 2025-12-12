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
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const monthKey = `${year}-${mm}`;

      if (month !== prevMonth) {
        rows.push({
          kind: 'month',
          key: monthKey,
          label: this.monthNames[month] + ' ' + year,
        });
        prevMonth = month;
      }

      rows.push({
        kind: 'day',
        key: `${year}-${mm}-${dd}`,
        monthKey: monthKey,
        display: `${dd}/${mm}/${String(year).slice(-2)}`,
        date: new Date(cur),
      });
    }

    return rows;
  }
}
