import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { StayListService } from '../../../shared/service/stay-service/stay-list.service';
import { StayListRecord, StayListRow } from '../../../shared/types/stay-list.types';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../shared/component/dialogs/confirm-dialog/confirm-dialog';
import { DialogModule } from 'primeng/dialog';
import { DetailsDialogComponent } from '../../../shared/component/dialogs/details-dialog/details-dialog';

import { STAY_LIST_COLUMNS, STAY_LIST_LABELS } from '../config/config-column';

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
    DetailsDialogComponent,
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

  records = signal<StayListRecord[]>([]);
  loading = signal(false);
  totals = signal(0);

  confirmVisible = signal(false);
  confirmMessage = signal('');
  selectedRecord = signal<StayListRow | null>(null);

  hoverTimeout: any = null;
  showOwnerPreview = signal(false);
  showDogPreview = signal(false);
  showDetailsPreview = signal(false);

  hoverOwnerData = signal<any>(null);
  hoverDogData = signal<any>(null);

  periodFiltersConfig: FilterConfig[] = [
    {
      key: 'period',
      label: 'Arrivi / Uscite',
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
      label: 'Tipo Pagamento',
      type: 'select',
      options: [
        { label: 'Tutti', value: 'all' },
        { label: 'Contante', value: 'cash' },
        { label: 'Pagamento elettronico', value: 'electronic' },
      ],
    },
  ];

  yearFilterConfig = signal<FilterConfig[]>([
    {
      key: 'year',
      label: 'Anno',
      type: 'select',
      options: [
        { label: 'Tutti gli anni', value: 'all' },
        { label: new Date().getFullYear().toString(), value: new Date().getFullYear().toString() },
      ],
    },
  ]);

  monthFilterConfig: FilterConfig[] = [
    {
      key: 'month',
      label: 'Mese',
      type: 'select',
      options: [
        { label: 'Tutti i mesi', value: 'all' },
        { label: 'Gennaio', value: '01' },
        { label: 'Febbraio', value: '02' },
        { label: 'Marzo', value: '03' },
        { label: 'Aprile', value: '04' },
        { label: 'Maggio', value: '05' },
        { label: 'Giugno', value: '06' },
        { label: 'Luglio', value: '07' },
        { label: 'Agosto', value: '08' },
        { label: 'Settembre', value: '09' },
        { label: 'Ottobre', value: '10' },
        { label: 'Novembre', value: '11' },
        { label: 'Dicembre', value: '12' },
      ],
    },
  ];

  constructor(
    private stayListSvc: StayListService,
    private router: Router,
    private filtersS: FiltersService,
    private exportSvc: ExportService
  ) {
    effect(() => {
      this.loadRecords(this.filtersS.state());
    });
  }

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

  async ngOnInit() {
    const currentYear = new Date().getFullYear().toString();

    this.filtersS.set('year', currentYear);
    this.filtersS.set('month', 'all');

    try {
      const allRecords = await this.stayListSvc.loadStays('');
      this.buildYearFilterFromRecords(allRecords);
    } catch (err) {
      // Handled globally
    }
  }

  async loadRecords(filters: Record<string, any> = {}) {
    this.loading.set(true);
    const clauses: string[] = [];

    const dogClause = await this.buildDogFilter(filters);
    if (dogClause) clauses.push(dogClause);

    const periodClause = this.buildPeriodFilter(filters);
    if (periodClause) clauses.push(periodClause);

    const yearMonthClause = this.buildYearMonthFilter(filters);
    if (yearMonthClause) clauses.push(yearMonthClause);

    const paymentClause = this.buildPaymentFilter(filters);
    if (paymentClause) clauses.push(paymentClause);

    const filter = clauses.join(' && ');

    try {
      const result = await this.stayListSvc.loadStays(filter);
      this.records.set(result);
      this.totals.set(this.stayListSvc.getTotal(result));
    } catch (err) {
      // Handled globally
    }
    this.loading.set(false);
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

  private buildYearMonthFilter(filters: Record<string, any>): string | null {
    const year = filters['year'];
    const month = filters['month'];

    if (!year || year === 'all') return null;

    if (!month || month === 'all') {
      return `arrival_date ~ "${year}"`;
    }

    const y = Number(year);
    const m = Number(month) - 1;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    return `(arrival_date >= "${startStr}" && arrival_date <= "${endStr}")`;
  }

  private buildYearFilterFromRecords(records: StayListRecord[]) {
    const years = new Set<string>();
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);

    for (const r of records) {
      if (!r.raw?.arrival_date) continue;
      const date = new Date(r.raw.arrival_date);
      if (!isNaN(date.getTime())) {
        years.add(String(date.getFullYear()));
      }
    }

    const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));

    this.yearFilterConfig.set([
      {
        key: 'year',
        label: 'Anno',
        type: 'select',
        options: [
          { label: 'Tutti gli anni', value: 'all' },
          ...sortedYears.map((y) => ({ label: y, value: y })),
        ],
      },
    ]);
  }

  exportData() {
    this.exportSvc.exportPDF('soggiorni.pdf', this.records(), this.exportColumnsPDF);
  }

  onCreate() {
    this.router.navigate(['/soggiorno/creazione']);
  }

  onEdit(row: StayListRecord) {
    this.router.navigate(['/soggiorno', row.id]);
  }

  openConfirm(row: StayListRecord) {
    this.selectedRecord.set(row.raw);
    const dogNames = row.dogs.split(',').map((d) => d.trim());
    this.confirmMessage.set(
      dogNames.length > 1
        ? `Vuoi eliminare il soggiorno per i cani:<br><b>${dogNames.join(', ')}</b>?`
        : `Vuoi eliminare il soggiorno per il cane:<br><b>${dogNames[0]}</b>?`
    );
    this.confirmVisible.set(true);
  }

  async onConfirmResult(ok: boolean) {
    if (!ok || !this.selectedRecord()) return;
    await this.stayListSvc.deleteStayAndOccupation(this.selectedRecord()!);
    await this.loadRecords(this.filtersS.getSnapshot());
  }

  // onCellClick(event: { column: string; row: StayListRecord }) {
  //   if (event.column !== 'owner') return;
  //   const owner = event.row.raw.expand?.owner_id;
  //   if (!owner) return;
  //   this.hoverOwnerData = owner;
  //   this.showOwnerPreview = true;
  // }

  // onCellClick(event: { column: string; row: StayListRecord }) {
  //   this.hoverOwnerData = null;
  //   this.hoverDogData = null;

  //   if (event.column === 'owner') {
  //     const owner = event.row.raw.expand?.owner_id;
  //     if (!owner) return;

  //     this.hoverOwnerData = owner;
  //     this.showDetailsPreview = true;
  //     return;
  //   }

  //   if (event.column === 'dogs') {
  //     const dog = event.row.raw.expand?.dog_ids?.[0];
  //     if (!dog) return;

  //     this.hoverDogData = dog;
  //     this.showDetailsPreview = true;
  //     return;
  //   }
  // }

  onCellClick(event: { column: string; row: StayListRecord; index?: number }) {
    this.hoverOwnerData.set(null);
    this.hoverDogData.set(null);

    if (event.column === 'owner') {
      const owner = event.row.raw.expand?.owner_id;
      if (!owner) return;
      this.hoverOwnerData.set(owner);
      this.showDetailsPreview.set(true);
      return;
    }

    if (event.column === 'dogs') {
      // Usiamo l'indice ricevuto per prendere il cane corretto
      const dogIndex = event.index ?? 0;
      const dog = event.row.raw.expand?.dog_ids?.[dogIndex];

      if (!dog) return;

      this.hoverDogData.set(dog);
      this.showDetailsPreview.set(true);
      return;
    }
  }

  isFullyPaid(record: StayListRecord) {
    return record.outstanding_balance === 0;
  }

  closeDetails() {
    this.showDetailsPreview.set(false);
    this.hoverOwnerData.set(null);
    this.hoverDogData.set(null);
  }
}
