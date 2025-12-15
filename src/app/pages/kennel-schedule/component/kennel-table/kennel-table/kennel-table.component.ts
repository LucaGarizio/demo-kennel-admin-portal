import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { KennelRow } from '../../../types';
import { getHolidayName, isHoliday } from '../../../utils/holiday-utils';
import { TooltipModule } from 'primeng/tooltip';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-kennel-table',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule],
  templateUrl: './kennel-table-component.html',
  styleUrls: ['./kennel-table-component.scss'],
  animations: [
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5px)' }),
        animate('450ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' })),
      ]),
    ]),
  ],
})
export class KennelTableComponent {
  @Input() rows: KennelRow[] = [];
  @Input() boxes: any[] = [];
  @Input() data: Record<string, Record<string, string>> = {};
  @Output() selectCell = new EventEmitter<{ day: string; box: any }>();

  expandedMonths: Record<string, boolean> = {};

  ngOnInit() {
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}`;

    const uniqueMonths = new Set(this.rows.filter((r) => r.kind === 'month').map((r) => r.key));
    uniqueMonths.forEach((key) => (this.expandedMonths[key] = false));

    if (this.expandedMonths[currentMonthKey] !== undefined) {
      this.expandedMonths[currentMonthKey] = true;
    }
  }

  toggleMonth(key: string) {
    this.expandedMonths[key] = !this.expandedMonths[key];
  }

  getHeaderStyle(box: any) {
    if (box.covered) return { backgroundColor: '#2196F3', color: '#fff', fontWeight: '600' };
    if (box.double) return { backgroundColor: '#8E24AA', color: '#fff', fontWeight: '600' };
    return {};
  }

  getRowStyle(row: KennelRow) {
    if (row.kind !== 'day') return {};

    const d = row.date instanceof Date ? row.date : new Date(row.date);
    if (isHoliday(d)) {
      return {
        backgroundColor: '#B71C1C',
        color: '#fff',
        fontWeight: '600',
      };
    }

    if (d.getDay() === 0) {
      return {
        backgroundColor: '#424242',
        color: '#fff',
      };
    }
    return {};
  }

  isDisabledDay(row: KennelRow): boolean {
    if (row.kind !== 'day') return true;
    const d = row.date instanceof Date ? row.date : new Date(row.date);
    if (d.getDay() === 0) return true;
    if (isHoliday(d)) return true;
    return false;
  }

  getCellStyle(row: any, box: any) {
    const occupied = !!this.data[row.key]?.[box.number];
    return {
      backgroundColor: occupied ? '#00C85340' : '',
      color: occupied ? '#00E676' : '#E0E0E0',
    };
  }

  // onCellClick(day: string, box: any) {
  //   this.selectCell.emit({ day, box });
  // }
  onCellClick(day: string, box: any) {
    const dog = this.data?.[day]?.[box.number];
    if (!dog) return;
    this.selectCell.emit({ day, box });
  }

  getTooltip(row: KennelRow): string | undefined {
    if (row.kind !== 'day') return undefined;

    const d = row.date instanceof Date ? row.date : new Date(row.date);
    const name = getHolidayName(d);

    return name || undefined;
  }
}
