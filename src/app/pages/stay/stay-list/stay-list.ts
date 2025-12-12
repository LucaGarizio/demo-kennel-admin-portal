import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { StayListService } from '../../../shared/service/stay-service/stay-list.service';
import { StayListRecord, StayListRow } from '../../../shared/types/stay-list.types';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog';
import { DialogModule } from 'primeng/dialog';
import { OwnerDialogComponent } from './owner-dialog/owner-dialog';

import { STAY_LIST_COLUMNS, STAY_LIST_LABELS } from './config/config-column';

import { FilterComponent } from '../../../shared/filter/filters-component/filters';
import { FiltersService } from '../../../shared/filter/filter-service/filter.service';
import { FilterConfig } from '../../../shared/filter/types/filter.types';
import { CardModule } from 'primeng/card';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
import { ExportService } from '../../../shared/service/export-service/export-service';

@Component({
  selector: 'app-stay-list',
  standalone: true,
  imports: [
    CommonModule,
    IndexTableComponent,
    ConfirmDialogComponent,
    DialogModule,
    OwnerDialogComponent,
    FilterComponent,
    CardModule,
    PageHeaderComponent,
  ],
  templateUrl: './stay-list.html',
  styleUrls: ['./stay-list.scss'],
})
export class StayList implements OnInit {
  columns = [...STAY_LIST_COLUMNS];
  columnLabels = STAY_LIST_LABELS;

  records: StayListRecord[] = [];
  loading = false;
  totals = 0;

  confirmVisible = false;
  confirmMessage = '';
  selectedRecord: StayListRow | null = null;

  hoverTimeout: any = null;
  showOwnerPreview = false;
  hoverOwnerData: any = null;

  periodFiltersConfig: FilterConfig[] = [
    {
      key: 'period',
      label: 'Filtri',
      type: 'select',
      options: [
        { label: 'Visualizza tutto', value: 'all' },
        { label: 'In arrivo oggi', value: 'arrivi_oggi' },
        { label: 'In uscita oggi', value: 'uscite_oggi' },
      ],
    },
  ];

  paymentFilterConfig: FilterConfig[] = [
    {
      key: 'payment_type',
      label: 'Pagamento',
      type: 'select',
      options: [
        { label: 'Tutti', value: 'all' },
        { label: 'Contanti', value: 'cash' },
        { label: 'Pagamento elettronico', value: 'electronic' },
      ],
    },
  ];

  constructor(
    private stayListSvc: StayListService,
    private router: Router,
    private filtersS: FiltersService,
    private exportSvc: ExportService
  ) {}

  exportColumnsPDF = [
    { key: 'dogs', header: 'Cani' },
    { key: 'area', header: 'Area' },
    { key: 'box', header: 'Box' },
    { key: 'arrival_date', header: 'Arrivo' },
    { key: 'departure_date', header: 'Uscita' },
    { key: 'boarding_fee', header: 'Retta' },
    { key: 'deposit', header: 'Acconto' },
    { key: 'outstanding_balance', header: 'Saldo residuo' },
    { key: 'total_due', header: 'Totale da pagare' },
  ];

  exportData() {
    this.exportSvc.exportPDF('soggiorni.pdf', this.records, this.exportColumnsPDF);
  }

  async ngOnInit() {
    this.filtersS.reset();
    await this.loadRecords({ mode: 'all' });
    this.filtersS.watch().subscribe(async (filters) => {
      await this.loadRecords(filters);
    });
  }

  async loadRecords(filters: Record<string, any> = {}) {
    this.loading = true;

    const clauses: string[] = [];

    const dogClause = await this.buildDogFilter(filters);
    if (dogClause) clauses.push(dogClause);

    const periodClause = this.buildPeriodFilter(filters);
    if (periodClause) clauses.push(periodClause);

    const paymentClause = this.buildPaymentFilter(filters);
    if (paymentClause) clauses.push(paymentClause);

    const filter = clauses.join(' && ');

    try {
      const result = await this.stayListSvc.loadStays(filter);

      this.records = result;
      this.totals = this.stayListSvc.getTotal(result);
    } catch (err) {
      console.error('STAY-LIST: ERRORE loadRecords:', err);
    }

    this.loading = false;
  }

  onCreate() {
    this.router.navigate(['/soggiorno/creazione']);
  }

  onEdit(row: StayListRecord) {
    this.router.navigate(['/soggiorno', row.id]);
  }

  openConfirm(row: StayListRecord) {
    this.selectedRecord = row.raw;

    const dogNames = row.dogs.split(',').map((d) => d.trim());
    const isMultiple = dogNames.length > 1;

    this.confirmMessage = isMultiple
      ? `Vuoi eliminare il soggiorno per i cani:<br><b>${dogNames.join(', ')}</b>?`
      : `Vuoi eliminare il soggiorno per il cane:<br><b>${dogNames[0]}</b>?`;

    this.confirmVisible = true;
  }

  async onConfirmResult(ok: boolean) {
    if (!ok || !this.selectedRecord) return;

    await this.stayListSvc.deleteStayAndOccupation(this.selectedRecord);
    await this.loadRecords({});
  }

  onCellClick(event: { column: string; row: StayListRecord }) {
    if (event.column !== 'owner') return;

    const owner = event.row.raw.expand?.owner_id;
    if (!owner) return;

    this.hoverOwnerData = owner;
    this.showOwnerPreview = true;
  }

  isFullyPaid(record: StayListRecord) {
    return record.outstanding_balance === 0;
  }

  private async buildDogFilter(filters: Record<string, any>): Promise<string | null> {
    if (!filters['dog_name']) return null;

    const dogIds = await this.stayListSvc.searchDogsByName(filters['dog_name']);
    if (dogIds.length === 0) return `dog_ids = ""`;

    const clause = dogIds.map((id) => `dog_ids ?~ "${id}"`).join(' || ');
    return `(${clause})`;
  }

  private buildPeriodFilter(filters: Record<string, any>): string | null {
    const today = new Date().toISOString().split('T')[0];

    switch (filters['period']) {
      case 'arrivi_oggi':
        return `arrival_date ~ "${today}"`;

      case 'uscite_oggi':
        return `departure_date ~ "${today}"`;

      default:
        return null;
    }
  }

  private buildPaymentFilter(filters: Record<string, any>): string | null {
    if (!filters['payment_type'] || filters['payment_type'] === 'all') return null;
    return `payment_type = "${filters['payment_type']}"`;
  }
}
