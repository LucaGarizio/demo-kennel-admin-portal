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

@Component({
  selector: 'app-stay-list',
  standalone: true,
  imports: [
    CommonModule,
    IndexTableComponent,
    ConfirmDialogComponent,
    DialogModule,
    OwnerDialogComponent,
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

  constructor(private stayListSvc: StayListService, private router: Router) {}

  async ngOnInit() {
    await this.loadRecords();
  }

  async loadRecords() {
    this.loading = true;
    this.records = await this.stayListSvc.loadStays();
    console.log('RECORDS IN LIST:', this.records);
    console.log('STAY LIST RECORDS →', this.records);
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
    await this.loadRecords();
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
