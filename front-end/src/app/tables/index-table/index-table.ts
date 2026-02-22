import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { LoadingSpinnerComponent } from '../../shared/component/loading-spinner/loading-spinner-component';
import { DocumentsDialogComponent } from '../../shared/component/dialogs/documents-dialog-component/documents-dialog-component';
import { ColumnConfig, ColumnType } from './index-table.types';

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

  @Input() columnConfigs: ColumnConfig[] = [];

  showDocsDialog = false;
  currentDocs: string[] = [];
  currentRow: any = null;

  constructor() {}

  get activeConfigs(): ColumnConfig[] {
    if (this.columnConfigs.length > 0) {
      return this.columnConfigs;
    }
    return this.columns.map(key => ({
      key,
      label: this.columnLabels[key] || key,
      type: this.inferColumnType(key)
    }));
  }

  private inferColumnType(key: string): ColumnType {
    if (key === 'owner' || key === 'owner_id') return 'link';
    if (key === 'dogs' || key === 'dog_ids') return 'array_link';
    if (key === 'documents') return 'documents';
    if (key === 'signature') return 'signature';
    if (['boarding_fee', 'deposit', 'amount_paid', 'outstanding_balance', 'total_due'].includes(key)) return 'currency';
    return 'text';
  }

  handleCellClick(col: ColumnConfig, row: any) {
    this.cellClick.emit({ column: col.key, value: row[col.key], row });
  }

  getDogArray(row: any, colKey: string): string[] {
    const value = this.getCellValue(row, colKey);
    if (!value) return [];
    return String(value).split(',').map(name => name.trim());
  }

  handleDogClick(col: ColumnConfig, row: any, index: number) {
    this.cellClick.emit({ column: col.key, value: row[col.key], row, index });
  }

  getClickableStyle() {
    return { cursor: 'pointer', color: 'rgb(52, 211, 153)' };
  }

  getDocuments(row: any): string[] {
    return row.documents || [];
  }

  getCellValue(row: any, colKey: string) {
    return row[colKey];
  }

  openDocumentsDialog(row: any) {
    this.currentDocs = this.getDocuments(row);
    this.currentRow = row;
    this.showDocsDialog = true;
  }

  getDocumentUrl(row: any, fileName: string): string {
    return this.getFileUrl(row, fileName);
  }

  isPaidCell(columnKey: string, row: any): boolean {
    if (!row) return false;
    const paid = row.outstanding_balance === 0;
    return paid && (columnKey === 'outstanding_balance' || columnKey === 'total_due');
  }

  isTruthyBoolean(row: any, key: string): boolean {
    const value = row[key];
    if (value === undefined || value === null || value === false || value === 'No') {
      return false;
    }
    return String(value).trim().length > 0;
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
