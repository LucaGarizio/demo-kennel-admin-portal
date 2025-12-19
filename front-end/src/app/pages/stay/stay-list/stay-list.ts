// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// import { StayListService } from '../../../shared/service/stay-service/stay-list.service';
// import { StayListRecord, StayListRow } from '../../../shared/types/stay-list.types';

// import { IndexTableComponent } from '../../../tables/index-table/index-table';
// import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog';
// import { DialogModule } from 'primeng/dialog';
// import { OwnerDialogComponent } from './owner-dialog/owner-dialog';

// import { STAY_LIST_COLUMNS, STAY_LIST_LABELS } from '../config/config-column';

// import { FilterComponent } from '../../../shared/filter/filters-component/filters';
// import { FiltersService } from '../../../shared/filter/filter-service/filter.service';
// import { FilterConfig } from '../../../shared/filter/types/filter.types';
// import { CardModule } from 'primeng/card';
// import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
// import { ExportService } from '../../../shared/service/export-service/export-service';

// @Component({
//   selector: 'app-stay-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     IndexTableComponent,
//     ConfirmDialogComponent,
//     DialogModule,
//     OwnerDialogComponent,
//     FilterComponent,
//     CardModule,
//     PageHeaderComponent,
//   ],
//   templateUrl: './stay-list.html',
//   styleUrls: ['./stay-list.scss'],
// })
// export class StayList implements OnInit {
//   columns = [...STAY_LIST_COLUMNS];
//   columnLabels = STAY_LIST_LABELS;

//   records: StayListRecord[] = [];
//   loading = false;
//   totals = 0;

//   confirmVisible = false;
//   confirmMessage = '';
//   selectedRecord: StayListRow | null = null;

//   hoverTimeout: any = null;
//   showOwnerPreview = false;
//   hoverOwnerData: any = null;

//   periodFiltersConfig: FilterConfig[] = [
//     {
//       key: 'period',
//       label: 'Filtri arrivi / uscite',
//       type: 'select',
//       options: [
//         { label: 'Visualizza tutto', value: 'all' },
//         { label: 'In arrivo oggi', value: 'arrivi_oggi' },
//         { label: 'In uscita oggi', value: 'uscite_oggi' },
//       ],
//     },
//   ];

//   paymentFilterConfig: FilterConfig[] = [
//     {
//       key: 'payment_type',
//       label: 'Filtri Pagamento',
//       type: 'select',
//       options: [
//         { label: 'Tutti', value: 'all' },
//         { label: 'Contanti', value: 'cash' },
//         { label: 'Pagamento elettronico', value: 'electronic' },
//       ],
//     },
//   ];

//   constructor(
//     private stayListSvc: StayListService,
//     private router: Router,
//     private filtersS: FiltersService,
//     private exportSvc: ExportService
//   ) {}

//   exportColumnsPDF = [
//     { key: 'dogs', header: 'Cani' },
//     { key: 'area', header: 'Area' },
//     { key: 'box', header: 'Box' },
//     { key: 'arrival_date', header: 'Arrivo' },
//     { key: 'departure_date', header: 'Uscita' },
//     { key: 'boarding_fee', header: 'Retta' },
//     { key: 'deposit', header: 'Acconto' },
//     { key: 'outstanding_balance', header: 'Saldo residuo' },
//     { key: 'total_due', header: 'Totale da pagare' },
//   ];

//   exportData() {
//     this.exportSvc.exportPDF('soggiorni.pdf', this.records, this.exportColumnsPDF);
//   }

//   async ngOnInit() {
//     this.filtersS.reset();
//     await this.loadRecords({ mode: 'all' });
//     this.filtersS.watch().subscribe(async (filters) => {
//       await this.loadRecords(filters);
//     });
//   }

//   async loadRecords(filters: Record<string, any> = {}) {
//     this.loading = true;

//     const clauses: string[] = [];

//     const dogClause = await this.buildDogFilter(filters);
//     if (dogClause) clauses.push(dogClause);

//     const periodClause = this.buildPeriodFilter(filters);
//     if (periodClause) clauses.push(periodClause);

//     const paymentClause = this.buildPaymentFilter(filters);
//     if (paymentClause) clauses.push(paymentClause);

//     const filter = clauses.join(' && ');

//     try {
//       const result = await this.stayListSvc.loadStays(filter);

//       this.records = result;
//       this.totals = this.stayListSvc.getTotal(result);
//     } catch (err) {
//       console.error('STAY-LIST: ERRORE loadRecords:', err);
//     }

//     this.loading = false;
//   }

//   onCreate() {
//     this.router.navigate(['/soggiorno/creazione']);
//   }

//   onEdit(row: StayListRecord) {
//     this.router.navigate(['/soggiorno', row.id]);
//   }

//   openConfirm(row: StayListRecord) {
//     this.selectedRecord = row.raw;

//     const dogNames = row.dogs.split(',').map((d) => d.trim());
//     const isMultiple = dogNames.length > 1;

//     this.confirmMessage = isMultiple
//       ? `Vuoi eliminare il soggiorno per i cani:<br><b>${dogNames.join(', ')}</b>?`
//       : `Vuoi eliminare il soggiorno per il cane:<br><b>${dogNames[0]}</b>?`;

//     this.confirmVisible = true;
//   }

//   async onConfirmResult(ok: boolean) {
//     if (!ok || !this.selectedRecord) return;

//     await this.stayListSvc.deleteStayAndOccupation(this.selectedRecord);
//     await this.loadRecords({});
//   }

//   onCellClick(event: { column: string; row: StayListRecord }) {
//     if (event.column !== 'owner') return;

//     const owner = event.row.raw.expand?.owner_id;
//     if (!owner) return;

//     this.hoverOwnerData = owner;
//     this.showOwnerPreview = true;
//   }

//   isFullyPaid(record: StayListRecord) {
//     return record.outstanding_balance === 0;
//   }

//   private async buildDogFilter(filters: Record<string, any>): Promise<string | null> {
//     if (!filters['dog_name']) return null;

//     const dogIds = await this.stayListSvc.searchDogsByName(filters['dog_name']);
//     if (dogIds.length === 0) return `dog_ids = ""`;

//     const clause = dogIds.map((id) => `dog_ids ?~ "${id}"`).join(' || ');
//     return `(${clause})`;
//   }

//   private buildPeriodFilter(filters: Record<string, any>): string | null {
//     const today = new Date().toISOString().split('T')[0];

//     switch (filters['period']) {
//       case 'arrivi_oggi':
//         return `arrival_date ~ "${today}"`;

//       case 'uscite_oggi':
//         return `departure_date ~ "${today}"`;

//       default:
//         return null;
//     }
//   }

//   private buildPaymentFilter(filters: Record<string, any>): string | null {
//     if (!filters['payment_type'] || filters['payment_type'] === 'all') return null;
//     return `payment_type = "${filters['payment_type']}"`;
//   }
// }

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// import { StayListService } from '../../../shared/service/stay-service/stay-list.service';
// import { StayListRecord, StayListRow } from '../../../shared/types/stay-list.types';

// import { IndexTableComponent } from '../../../tables/index-table/index-table';
// import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog';
// import { DialogModule } from 'primeng/dialog';
// import { OwnerDialogComponent } from './owner-dialog/owner-dialog';

// import { STAY_LIST_COLUMNS, STAY_LIST_LABELS } from '../config/config-column';

// import { FilterComponent } from '../../../shared/filter/filters-component/filters';
// import { FiltersService } from '../../../shared/filter/filter-service/filter.service';
// import { FilterConfig } from '../../../shared/filter/types/filter.types';
// import { CardModule } from 'primeng/card';
// import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
// import { ExportService } from '../../../shared/service/export-service/export-service';

// @Component({
//   selector: 'app-stay-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     IndexTableComponent,
//     ConfirmDialogComponent,
//     DialogModule,
//     OwnerDialogComponent,
//     FilterComponent,
//     CardModule,
//     PageHeaderComponent,
//   ],
//   templateUrl: './stay-list.html',
//   styleUrls: ['./stay-list.scss'],
// })
// export class StayList implements OnInit {
//   columns = [...STAY_LIST_COLUMNS];
//   columnLabels = STAY_LIST_LABELS;

//   records: StayListRecord[] = [];
//   loading = false;
//   totals = 0;

//   confirmVisible = false;
//   confirmMessage = '';
//   selectedRecord: StayListRow | null = null;

//   hoverTimeout: any = null;
//   showOwnerPreview = false;
//   hoverOwnerData: any = null;

//   /* =========================
//      FILTRI ESISTENTI (INTOCCATI)
//   ========================== */

//   periodFiltersConfig: FilterConfig[] = [
//     {
//       key: 'period',
//       label: 'Filtri arrivi / uscite',
//       type: 'select',
//       options: [
//         { label: 'Visualizza tutto', value: 'all' },
//         { label: 'In arrivo oggi', value: 'arrivi_oggi' },
//         { label: 'In uscita oggi', value: 'uscite_oggi' },
//       ],
//     },
//   ];

//   paymentFilterConfig: FilterConfig[] = [
//     {
//       key: 'payment_type',
//       label: 'Filtri Pagamento',
//       type: 'select',
//       options: [
//         { label: 'Tutti', value: 'all' },
//         { label: 'Contanti', value: 'cash' },
//         { label: 'Pagamento elettronico', value: 'electronic' },
//       ],
//     },
//   ];

//   /* =========================
//      FILTRI NUOVI (AGGIUNTI)
//   ========================== */

//   yearFilterConfig: FilterConfig[] = [];
//   monthFilterConfig: FilterConfig[] = [
//     {
//       key: 'month',
//       label: 'Mese',
//       type: 'select',
//       options: [
//         { label: 'Tutti i mesi', value: 'all' },
//         { label: 'Gennaio', value: '01' },
//         { label: 'Febbraio', value: '02' },
//         { label: 'Marzo', value: '03' },
//         { label: 'Aprile', value: '04' },
//         { label: 'Maggio', value: '05' },
//         { label: 'Giugno', value: '06' },
//         { label: 'Luglio', value: '07' },
//         { label: 'Agosto', value: '08' },
//         { label: 'Settembre', value: '09' },
//         { label: 'Ottobre', value: '10' },
//         { label: 'Novembre', value: '11' },
//         { label: 'Dicembre', value: '12' },
//       ],
//     },
//   ];

//   constructor(
//     private stayListSvc: StayListService,
//     private router: Router,
//     private filtersS: FiltersService,
//     private exportSvc: ExportService
//   ) {}

//   exportColumnsPDF = [
//     { key: 'dogs', header: 'Cani' },
//     { key: 'area', header: 'Area' },
//     { key: 'box', header: 'Box' },
//     { key: 'arrival_date', header: 'Arrivo' },
//     { key: 'departure_date', header: 'Uscita' },
//     { key: 'boarding_fee', header: 'Retta' },
//     { key: 'deposit', header: 'Acconto' },
//     { key: 'outstanding_balance', header: 'Saldo residuo' },
//     { key: 'total_due', header: 'Totale da pagare' },
//   ];

//   exportData() {
//     this.exportSvc.exportPDF('soggiorni.pdf', this.records, this.exportColumnsPDF);
//   }

//   // async ngOnInit() {
//   //   this.filtersS.reset();
//   //   await this.loadRecords({});
//   //   this.filtersS.watch().subscribe(async (filters) => {
//   //     await this.loadRecords(filters);
//   //   });
//   // }
//   async ngOnInit() {
//     const currentYear = new Date().getFullYear().toString();

//     // 1. Configura subito l'opzione così il dropdown la trova
//     this.yearFilterConfig = [
//       {
//         key: 'year',
//         label: 'Anno',
//         type: 'select',
//         options: [
//           { label: 'Tutti gli anni', value: 'all' },
//           { label: currentYear, value: currentYear },
//         ],
//       },
//     ];

//     // 2. Spara l'anno nel servizio PRIMA di iniziare a guardare i cambiamenti
//     this.filtersS.set('year', currentYear);
//     this.filtersS.set('month', 'all');

//     // 3. Ora ti metti in ascolto: caricherà i dati per l'anno corrente
//     this.filtersS.watch().subscribe(async (filters) => {
//       await this.loadRecords(filters);
//     });
//   }

//   /* =========================
//      LOAD RECORDS (MODIFICATO SOLO QUI)
//   ========================== */

//   async loadRecords(filters: Record<string, any> = {}) {
//     this.loading = true;

//     const clauses: string[] = [];

//     const dogClause = await this.buildDogFilter(filters);
//     if (dogClause) clauses.push(dogClause);

//     const periodClause = this.buildPeriodFilter(filters);
//     if (periodClause) clauses.push(periodClause);

//     const yearMonthClause = this.buildYearMonthFilter(filters);
//     if (yearMonthClause) clauses.push(yearMonthClause);

//     const paymentClause = this.buildPaymentFilter(filters);
//     if (paymentClause) clauses.push(paymentClause);

//     const filter = clauses.join(' && ');

//     try {
//       const result = await this.stayListSvc.loadStays(filter);

//       this.records = result;
//       this.totals = this.stayListSvc.getTotal(result);

//       if (this.yearFilterConfig.length === 0) {
//         this.buildYearFilterFromRecords(result);
//       }
//     } catch (err) {
//       console.error('STAY-LIST: ERRORE loadRecords:', err);
//     }

//     this.loading = false;
//   }

//   /* =========================
//      METODI ESISTENTI (INTOCCATI)
//   ========================== */

//   onCreate() {
//     this.router.navigate(['/soggiorno/creazione']);
//   }

//   onEdit(row: StayListRecord) {
//     this.router.navigate(['/soggiorno', row.id]);
//   }

//   openConfirm(row: StayListRecord) {
//     this.selectedRecord = row.raw;

//     const dogNames = row.dogs.split(',').map((d) => d.trim());
//     const isMultiple = dogNames.length > 1;

//     this.confirmMessage = isMultiple
//       ? `Vuoi eliminare il soggiorno per i cani:<br><b>${dogNames.join(', ')}</b>?`
//       : `Vuoi eliminare il soggiorno per il cane:<br><b>${dogNames[0]}</b>?`;

//     this.confirmVisible = true;
//   }

//   async onConfirmResult(ok: boolean) {
//     if (!ok || !this.selectedRecord) return;
//     await this.stayListSvc.deleteStayAndOccupation(this.selectedRecord);
//     await this.loadRecords({});
//   }

//   onCellClick(event: { column: string; row: StayListRecord }) {
//     if (event.column !== 'owner') return;

//     const owner = event.row.raw.expand?.owner_id;
//     if (!owner) return;

//     this.hoverOwnerData = owner;
//     this.showOwnerPreview = true;
//   }

//   isFullyPaid(record: StayListRecord) {
//     return record.outstanding_balance === 0;
//   }

//   private async buildDogFilter(filters: Record<string, any>): Promise<string | null> {
//     if (!filters['dog_name']) return null;

//     const dogIds = await this.stayListSvc.searchDogsByName(filters['dog_name']);
//     if (dogIds.length === 0) return `dog_ids = ""`;

//     const clause = dogIds.map((id) => `dog_ids ?~ "${id}"`).join(' || ');
//     return `(${clause})`;
//   }

//   private buildPeriodFilter(filters: Record<string, any>): string | null {
//     const today = new Date().toISOString().split('T')[0];

//     switch (filters['period']) {
//       case 'arrivi_oggi':
//         return `arrival_date ~ "${today}"`;
//       case 'uscite_oggi':
//         return `departure_date ~ "${today}"`;
//       default:
//         return null;
//     }
//   }

//   private buildPaymentFilter(filters: Record<string, any>): string | null {
//     if (!filters['payment_type'] || filters['payment_type'] === 'all') return null;
//     return `payment_type = "${filters['payment_type']}"`;
//   }

//   /* =========================
//      METODI NUOVI (AGGIUNTI)
//   ========================== */

//   private buildYearMonthFilter(filters: Record<string, any>): string | null {
//     const year = filters['year'];
//     const month = filters['month'];

//     console.group('YEAR / MONTH FILTER DEBUG');
//     console.log('filters.year =', year);
//     console.log('filters.month =', month);

//     // nessun filtro anno
//     if (!year || year === 'all') {
//       console.log('→ NO YEAR FILTER');
//       console.groupEnd();
//       return null;
//     }

//     // SOLO ANNO → tutto l'anno
//     if (!month || month === 'all') {
//       const clause = `arrival_date ~ "${year}"`;
//       console.log('→ YEAR ONLY');
//       console.log('→ clause =', clause);
//       console.groupEnd();
//       return clause;
//     }

//     const y = Number(year);
//     const m = Number(month) - 1;

//     const start = new Date(y, m, 1);
//     const end = new Date(y, m + 1, 0, 23, 59, 59);

//     const startStr = start.toISOString().split('T')[0];
//     const endStr = end.toISOString().split('T')[0];

//     const clause = `(arrival_date >= "${startStr}" && arrival_date <= "${endStr}")`;

//     console.log('→ YEAR + MONTH (RANGE)');
//     console.log('→ start =', startStr);
//     console.log('→ end   =', endStr);
//     console.log('→ clause =', clause);
//     console.groupEnd();

//     return clause;
//   }

//   // private buildYearFilterFromRecords(records: StayListRecord[]) {
//   //   const years = new Set<string>();

//   //   for (const r of records) {
//   //     if (!r.raw?.arrival_date) continue;

//   //     const date = new Date(r.raw.arrival_date);
//   //     if (!isNaN(date.getTime())) {
//   //       years.add(String(date.getFullYear()));
//   //     }
//   //   }

//   //   const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));

//   //   this.yearFilterConfig = [
//   //     {
//   //       key: 'year',
//   //       label: 'Anno',
//   //       type: 'select',
//   //       options: [
//   //         { label: 'Tutti gli anni', value: 'all' },
//   //         ...sortedYears.map((y) => ({ label: y, value: y })),
//   //       ],
//   //     },
//   //   ];
//   // }
//   private buildYearFilterFromRecords(records: StayListRecord[]) {
//     const years = new Set<string>();
//     const currentYear = new Date().getFullYear().toString();

//     // Aggiungiamo sempre l'anno corrente nel set
//     years.add(currentYear);

//     for (const r of records) {
//       if (!r.raw?.arrival_date) continue;
//       const date = new Date(r.raw.arrival_date);
//       if (!isNaN(date.getTime())) {
//         years.add(String(date.getFullYear()));
//       }
//     }

//     const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));

//     // AGGIORNIAMO le opzioni senza distruggere l'oggetto config se possibile,
//     // o semplicemente assicurandoci che l'anno corrente sia tra le opzioni.
//     this.yearFilterConfig = [
//       {
//         key: 'year',
//         label: 'Anno',
//         type: 'select',
//         options: [
//           { label: 'Tutti gli anni', value: 'all' },
//           ...sortedYears.map((y) => ({ label: y, value: y })),
//         ],
//       },
//     ];
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { StayListService } from '../../../shared/service/stay-service/stay-list.service';
import { StayListRecord, StayListRow } from '../../../shared/types/stay-list.types';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog';
import { DialogModule } from 'primeng/dialog';
import { OwnerDialogComponent } from './owner-dialog/owner-dialog';

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
      label: 'Filtri arrivi / uscite',
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
      label: 'Filtri Pagamento',
      type: 'select',
      options: [
        { label: 'Tutti', value: 'all' },
        { label: 'Contanti', value: 'cash' },
        { label: 'Pagamento elettronico', value: 'electronic' },
      ],
    },
  ];

  yearFilterConfig: FilterConfig[] = [
    {
      key: 'year',
      label: 'Anno',
      type: 'select',
      options: [
        { label: 'Tutti gli anni', value: 'all' },
        { label: new Date().getFullYear().toString(), value: new Date().getFullYear().toString() },
      ],
    },
  ];

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

  async ngOnInit() {
    const currentYear = new Date().getFullYear().toString();

    this.filtersS.set('year', currentYear);
    this.filtersS.set('month', 'all');

    this.filtersS.watch().subscribe(async (filters) => {
      await this.loadRecords(filters);
    });

    try {
      const allRecords = await this.stayListSvc.loadStays('');
      this.buildYearFilterFromRecords(allRecords);
    } catch (err) {
      console.error(err);
    }
  }

  async loadRecords(filters: Record<string, any> = {}) {
    this.loading = true;
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
      this.records = result;
      this.totals = this.stayListSvc.getTotal(result);
    } catch (err) {
      console.error(err);
    }
    this.loading = false;
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

    this.yearFilterConfig = [
      {
        key: 'year',
        label: 'Anno',
        type: 'select',
        options: [
          { label: 'Tutti gli anni', value: 'all' },
          ...sortedYears.map((y) => ({ label: y, value: y })),
        ],
      },
    ];
  }

  exportData() {
    this.exportSvc.exportPDF('soggiorni.pdf', this.records, this.exportColumnsPDF);
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
    this.confirmMessage =
      dogNames.length > 1
        ? `Vuoi eliminare il soggiorno per i cani:<br><b>${dogNames.join(', ')}</b>?`
        : `Vuoi eliminare il soggiorno per il cane:<br><b>${dogNames[0]}</b>?`;
    this.confirmVisible = true;
  }

  async onConfirmResult(ok: boolean) {
    if (!ok || !this.selectedRecord) return;
    await this.stayListSvc.deleteStayAndOccupation(this.selectedRecord);
    await this.loadRecords(this.filtersS.getSnapshot());
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
}
