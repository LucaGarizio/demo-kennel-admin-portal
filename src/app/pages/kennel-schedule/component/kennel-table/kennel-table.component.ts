import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { KennelRow } from '../../types';

@Component({
  selector: 'app-kennel-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './kennel-table.html',
  styleUrls: ['./kennel-table.scss'],
})
export class KennelTableComponent {
  @Input() rows: KennelRow[] = [];
  @Input() boxes: any[] = [];
  @Input() data: Record<string, Record<string, string>> = {};
  @Output() selectCell = new EventEmitter<{ day: string; box: any }>();

  getHeaderStyle(box: any) {
    if (box.covered) return { backgroundColor: '#2196F3', color: '#fff', fontWeight: '600' };
    if (box.double) return { backgroundColor: '#8E24AA', color: '#fff', fontWeight: '600' };
    return {};
  }

  getRowStyle(row: KennelRow) {
    return row.kind === 'day' && row.date.getDay() === 0
      ? { backgroundColor: '#424242', color: '#fff' }
      : {};
  }

  getCellStyle(row: any, box: any) {
    const occupied = !!this.data[row.key]?.[box.number];
    return {
      backgroundColor: occupied ? '#00C85340' : '',
      color: occupied ? '#00E676' : '#E0E0E0',
    };
  }

  onCellClick(day: string, box: any) {
    this.selectCell.emit({ day, box });
  }
}
