// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { StayListService } from '../../../shared/service/stay-list.service';
// import { StayListRecord, StayListRow } from '../../../shared/types/stay-list.types';
// import { IndexTableComponent } from '../../../tables/index-table/index-table';
// import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog';
// import { DialogModule } from 'primeng/dialog';
// import { OwnerDialogComponent } from './owner-dialog/owner-dialog';
// import { STAY_LIST_COLUMNS, STAY_LIST_LABELS } from './config/config-column';
// import { Filters } from '../../../shared/filter/filters-component/filters';
// import { FiltersService } from '../../../shared/filter/filter-service/filter.service';

// @Component({
//   selector: 'app-stay-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     IndexTableComponent,
//     ConfirmDialogComponent,
//     DialogModule,
//     OwnerDialogComponent,
//     Filters,
//   ],
//   templateUrl: './stay-list.html',
//   styleUrls: ['./stay-list.scss'],
// })
// export class StayList implements OnInit {
//   columns = [...STAY_LIST_COLUMNS];
//   columnLabels = STAY_LIST_LABELS;
//   records: StayListRecord[] = [];
//   loading = false;
//   confirmVisible = false;
//   confirmMessage = '';
//   selectedRecord: StayListRow | null = null;
//   hoverTimeout: any = null;
//   showOwnerPreview = false;
//   hoverOwnerData: any = null;

//   constructor(
//     private stayListSvc: StayListService,
//     private router: Router,
//     private filtersS: FiltersService
//   ) {}

//   async ngOnInit() {
//     await this.loadRecords();
//   }

//   async loadRecords() {
//     this.loading = true;
//     this.records = await this.stayListSvc.loadStays();
//     console.log('RECORDS IN LIST:', this.records);
//     console.log('STAY LIST RECORDS →', this.records);
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
//     await this.loadRecords();
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
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { StayListService } from '../../../shared/service/stay-list.service';
import { StayListRecord, StayListRow } from '../../../shared/types/stay-list.types';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog';
import { DialogModule } from 'primeng/dialog';
import { OwnerDialogComponent } from './owner-dialog/owner-dialog';

import { STAY_LIST_COLUMNS, STAY_LIST_LABELS } from './config/config-column';

import { Filters } from '../../../shared/filter/filters-component/filters';
import { FiltersService } from '../../../shared/filter/filter-service/filter.service';
import { FilterConfig } from '../../../shared/filter/types/filter.types';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-stay-list',
  standalone: true,
  imports: [
    CommonModule,
    IndexTableComponent,
    ConfirmDialogComponent,
    DialogModule,
    OwnerDialogComponent,
    Filters,
    CardModule,
  ],
  templateUrl: './stay-list.html',
  styleUrls: ['./stay-list.scss'],
})
export class StayList implements OnInit {
  columns = [...STAY_LIST_COLUMNS];
  columnLabels = STAY_LIST_LABELS;

  records: StayListRecord[] = [];
  loading = false;

  confirmVisible = false;
  confirmMessage = '';
  selectedRecord: StayListRow | null = null;

  hoverTimeout: any = null;
  showOwnerPreview = false;
  hoverOwnerData: any = null;

  // CONFIGURAZIONE FILTRI PER STAY
  filtersConfig: FilterConfig[] = [
    { key: 'data_arrivo', label: 'Data Arrivo', type: 'date' },
    { key: 'data_uscita', label: 'Data Uscita', type: 'date' },
    { key: 'dog_name', label: 'Cane', type: 'text' },
  ];
  constructor(
    private stayListSvc: StayListService,
    private router: Router,
    private filtersS: FiltersService
  ) {}

  async ngOnInit() {
    // Caricamento iniziale senza filtri
    await this.loadRecords({});

    // Ascolta i filtri generici
    this.filtersS.getFilters().subscribe(async (filters) => {
      await this.loadRecords(filters);
    });
  }

  // Caricamento con eventuali filtri
  // async loadRecords(filters: Record<string, any>) {
  //   this.loading = true;

  //   const clauses: string[] = [];

  //   if (filters['dog_name']) {
  //     clauses.push(`expand.dog_ids.name ~ "${filters['dog_name']}"`);
  //   }
  //   if (filters['data_arrivo']) {
  //     clauses.push(`arrival_date ~ "${filters['data_arrivo']}"`);
  //   }

  //   if (filters['data_uscita']) {
  //     clauses.push(`departure_date ~ "${filters['data_uscita']}"`);
  //   }

  //   const filter = clauses.join(' && ');

  //   this.records = await this.stayListSvc.loadStays(filter);

  //   this.loading = false;
  // }

  async loadRecords(filters: Record<string, any> = {}) {
    this.loading = true;

    const clauses: string[] = [];

    // ---- DATA ARRIVO ----
    if (filters['data_arrivo']) {
      clauses.push(`arrival_date ~ "${filters['data_arrivo']}"`);
    }

    // ---- DATA USCITA ----
    if (filters['data_uscita']) {
      clauses.push(`departure_date ~ "${filters['data_uscita']}"`);
    }

    // ---- NOME CANE ----
    if (filters['dog_name']) {
      const dogIds = await this.stayListSvc.searchDogsByName(filters['dog_name']);

      if (dogIds.length === 0) {
        // nessun cane trovato → nessun soggiorno
        clauses.push(`dog_ids = ""`);
      } else {
        const orClause = dogIds.map((id) => `dog_ids?~"${id}"`).join(' || ');
        clauses.push(`(${orClause})`);
      }
    }

    const filter = clauses.join(' && ');

    console.log('FILTER PB →', filter);

    this.records = await this.stayListSvc.loadStays(filter);
    this.loading = false;
  }

  onFiltersChanged(values: Record<string, any>) {
    this.filtersS.setFilters(values);
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
}
