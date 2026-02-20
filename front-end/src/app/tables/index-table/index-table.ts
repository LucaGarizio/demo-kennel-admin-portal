import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { LoadingSpinnerComponent } from '../../shared/component/loading-spinner/loading-spinner-component';
import { DocumentsDialogComponent } from '../../shared/component/dialogs/documents-dialog-component/documents-dialog-component';

@Component({
  selector: 'app-index-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    LoadingSpinnerComponent,
    DocumentsDialogComponent,
  ],
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
  @Input() getFileUrl!: (row: any, fileName: string) => string;
  @Input() getSignatureFileUrl?: (row: any) => string;
  @Input() tableHeight: string = '';
  @Input() tableScrollHeight: string = '';
  @Output() create = new EventEmitter<void>();
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() cellClick = new EventEmitter<{
    column: string;
    value: any;
    row: any;
    index?: number;
  }>();
  @Output() downloadDocuments = new EventEmitter<{
    row: any;
    documents: string[];
  }>();

  showDocsDialog = false;
  currentDocs: string[] = [];
  currentRow: any = null;
  currencyColumns = ['boarding_fee', 'deposit', 'amount_paid', 'outstanding_balance', 'total_due'];

  constructor() {}
  isOwnerColumn(col: string): boolean {
    return col === 'owner' || col === 'owner_id';
  }
  isDogsColumn(col: string): boolean {
    return col === 'dogs' || col === 'dog_ids';
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
  getDogArray(row: any, col: string): string[] {
    const value = this.getCellValue(row, col);
    if (!value) return [];
    return value.split(',').map((name: string) => name.trim());
  }
  handleDogClick(col: string, row: any, index: number) {
    this.cellClick.emit({ column: col, value: row[col], row, index });
  }

  getClickableStyle() {
    return { cursor: 'pointer', color: 'rgb(52, 211, 153)' };
  }

  getDocuments(row: any): string[] {
    return row.documents || [];
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
    return this.getFileUrl(row, fileName);
  }

  isPaidCell(column: string, row: any): boolean {
    if (!row) return false;
    const paid = row.outstanding_balance === 0;
    return paid && (column === 'outstanding_balance' || column === 'total_due');
  }

  isSignatureColumn(col: string): boolean {
    return col === 'signature';
  }

  getSignatureUrl(row: any): string {
    return this.getSignatureFileUrl?.(row) ?? '';
  }

  downloadDocumentsPdf() {
    if (!this.currentRow || !this.currentDocs.length) return;

    this.downloadDocuments.emit({
      row: this.currentRow,
      documents: this.currentDocs,
    });
  }
}
