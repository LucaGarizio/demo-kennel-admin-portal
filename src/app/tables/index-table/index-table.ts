import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-index-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CarouselModule, DialogModule, CheckboxModule],
  templateUrl: './index-table.html',
  styleUrls: ['./index-table.scss'],
})
export class IndexTableComponent {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() columnLabels: Record<string, string> = {};
  @Input() loading = false;
  @Input() showCreate = true;
  @Input() showFooter = false;
  @Input() totals: number = 0;

  @Output() create = new EventEmitter<void>();
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() cellClick = new EventEmitter<{ column: string; value: any; row: any }>();

  expandedRow: any | null = null;
  showDocsDialog = false;
  currentDocs: string[] = [];
  currentRow: any = null;
  currencyColumns = ['boarding_fee', 'deposit', 'amount_paid', 'outstanding_balance', 'total_due'];
  pbUrl = 'http://127.0.0.1:8090';

  isOwnerColumn(col: string): boolean {
    return col === 'owner';
  }

  isDocumentsColumn(col: string): boolean {
    return col === 'documents';
  }

  isCurrencyColumn(col: string): boolean {
    return this.currencyColumns.includes(col);
  }

  handleCellClick(col: string, row: any) {
    this.cellClick.emit({ column: col, value: row[col], row });
  }

  getClickableStyle() {
    return { cursor: 'pointer', color: '#42A5F5' };
  }

  getDocuments(row: any): string[] {
    return row.documents || [];
  }

  getFileLabel(index: number, fileName: string): string {
    return `doc_${index + 1}.${this.getExtension(fileName)}`;
  }

  getExtension(fileName: string): string {
    return fileName.split('.').pop() || '';
  }

  getCellValue(row: any, col: string) {
    return row[col];
  }

  openDocumentsDialog(row: any) {
    this.currentDocs = this.getDocuments(row);
    this.currentRow = row;
    this.showDocsDialog = true;
  }

  getDocumentUrl(row: any, fileName: string): string {
    return `${this.pbUrl}/api/files/owner/${row.id}/${fileName}`;
  }

  isPaidCell(column: string, row: any): boolean {
    if (!row) return false;
    const paid = row.outstanding_balance === 0;
    return paid && (column === 'outstanding_balance' || column === 'total_due');
  }
}
