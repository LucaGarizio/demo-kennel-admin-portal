import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-index-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './index-table.html',
  styleUrls: ['./index-table.scss'],
})
export class IndexTableComponent {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() columnLabels: Record<string, string> = {};
  @Input() loading = false;
  @Input() showCreate = true;

  @Output() create = new EventEmitter<void>();
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() cellClick = new EventEmitter<{ column: string; value: any; row: any }>();

  onCellClick(column: string, value: any, row: any) {
    this.cellClick.emit({ column, value, row });
  }
}
