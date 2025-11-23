import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog';

import { DogListService } from '../../../shared/service/dog-list.service';
import { DogListRecord, DogListRow } from '../../../shared/types/dog-list.types';

import { DOG_LIST_COLUMNS, DOG_LIST_LABELS } from '../config/config-column';

@Component({
  selector: 'app-dog-list',
  standalone: true,
  imports: [CommonModule, CardModule, RippleModule, IndexTableComponent, ConfirmDialogComponent],
  templateUrl: './dog-list.html',
  styleUrls: ['./dog-list.scss'],
})
export class DogList implements OnInit {
  columns = [...DOG_LIST_COLUMNS];
  columnLabels = DOG_LIST_LABELS;

  records: DogListRecord[] = [];
  loading = false;

  selectedRecord: DogListRow | null = null;
  confirmVisible = false;
  confirmMessage = '';

  constructor(private dogListSvc: DogListService, private router: Router) {}

  async ngOnInit() {
    await this.loadRecords();
  }

  async loadRecords() {
    this.loading = true;
    this.records = await this.dogListSvc.loadDogs();
    this.loading = false;
  }

  goToCreate() {
    this.router.navigate(['/cane/creazione']);
  }

  onEdit(row: DogListRecord) {
    this.router.navigate(['/cane', row.id]);
  }

  openConfirm(rec: DogListRecord) {
    this.selectedRecord = rec.raw;

    this.confirmMessage = `Vuoi davvero eliminare <b>${rec.name}</b>?`;
    this.confirmVisible = true;
  }

  async onConfirmResult(confirmed: boolean) {
    this.confirmVisible = false;
    if (!confirmed || !this.selectedRecord) return;

    await this.dogListSvc.deleteDog(this.selectedRecord);
    await this.loadRecords();
    this.selectedRecord = null;
  }

  onCellClick(event: { column: string; row: DogListRecord }) {
    if (event.column === 'owner_id' && event.row.raw.expand?.owner_id?.id) {
      const ownerId = event.row.raw.expand.owner_id.id;
      this.router.navigate(['/proprietario', ownerId]);
    }
  }
}
