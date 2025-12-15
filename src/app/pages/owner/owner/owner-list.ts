import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog';

import { OwnerListService } from '../../../shared/service/owner-service/owner-list.service';
import { OwnerListRecord, OwnerListRow } from '../../../shared/types/owner-list.types';

import { OWNER_LIST_COLUMNS, OWNER_LIST_LABELS } from '../config/config-column';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
import { FilterComponent } from '../../../shared/filter/filters-component/filters';
import { FiltersService } from '../../../shared/filter/filter-service/filter.service';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    RippleModule,
    IndexTableComponent,
    ConfirmDialogComponent,
    PageHeaderComponent,
    FilterComponent,
  ],
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
    private router: Router,
    private filtersS: FiltersService
  ) {}

  // async ngOnInit() {
  //   await this.loadRecords();
  // }

  async ngOnInit() {
    this.filtersS.reset();
    await this.loadRecords();

    this.filtersS.watch().subscribe(async (filters) => {
      await this.loadRecords(filters);
    });
  }

  async loadRecords(filters: Record<string, any> = {}) {
    this.loading = true;

    const clauses: string[] = [];

    const surnameClause = this.buildSurnameFilter(filters);
    if (surnameClause) clauses.push(surnameClause);

    const phoneClause = this.buildPhoneFilter(filters);
    if (phoneClause) clauses.push(phoneClause);

    const filter = clauses.join(' && ');

    this.records = await this.ownerListSvc.loadOwners(filter);

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

  private buildSurnameFilter(filters: Record<string, any>): string | null {
    if (!filters['owner_surname']) return null;
    return `surname ~ "${filters['owner_surname']}"`;
  }

  private buildPhoneFilter(filters: Record<string, any>): string | null {
    if (!filters['phone_number']) return null;
    return `phone_number ~ "${filters['phone_number']}"`;
  }
}
