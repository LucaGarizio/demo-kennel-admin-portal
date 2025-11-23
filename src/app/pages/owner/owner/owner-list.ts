import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog';

import { OwnerListService } from '../../../shared/service/owner-list.service';
import { OwnerListRecord, OwnerListRow } from '../../../shared/types/owner-list.types';

import { OWNER_LIST_COLUMNS, OWNER_LIST_LABELS } from '../config/config-column';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [CommonModule, CardModule, RippleModule, IndexTableComponent, ConfirmDialogComponent],
  templateUrl: './owner-list.html',
  styleUrls: ['./owner-list.scss'],
})
export class OwnerList implements OnInit {
  columns = [...OWNER_LIST_COLUMNS];
  columnLabels = OWNER_LIST_LABELS;

  records: OwnerListRecord[] = [];
  loading = false;

  confirmVisible = false;
  confirmMessage = '';
  selectedRecord: OwnerListRow | null = null;

  constructor(
    private ownerListSvc: OwnerListService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadRecords();
  }

  async loadRecords() {
    this.loading = true;

    const ownerId = this.route.snapshot.paramMap.get('id');

    this.records = ownerId
      ? [await this.ownerListSvc.loadOwner(ownerId)]
      : await this.ownerListSvc.loadOwners();

    this.loading = false;
  }

  shouldShowCreate(): boolean {
    return !this.route.snapshot.paramMap.get('id');
  }

  onCreate() {
    this.router.navigate(['/proprietario/creazione']);
  }

  onEdit(row: OwnerListRecord) {
    this.router.navigate(['/proprietario', row.id]);
  }

  openConfirm(rec: OwnerListRecord) {
    this.selectedRecord = rec.raw;

    this.confirmMessage = `
      Vuoi davvero eliminare <b>${rec.name} ${rec.surname}</b>?<br>
      Verranno eliminati anche i cani associati.
    `;

    this.confirmVisible = true;
  }

  async onConfirmResult(ok: boolean) {
    if (!ok || !this.selectedRecord) return;

    await this.ownerListSvc.deleteOwnerAndDogs(this.selectedRecord);
    await this.loadRecords();
  }
}
