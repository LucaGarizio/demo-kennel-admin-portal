import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../shared/component/dialogs/confirm-dialog/confirm-dialog';

import { OwnerListService } from '../../../shared/service/owner-service/owner-list.service';
import { OwnerListRecord, OwnerListRow } from '../../../shared/types/owner-list.types';

import { OWNER_LIST_COLUMNS, OWNER_LIST_LABELS } from '../config/config-column';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
import { FilterComponent } from '../../../shared/filter/filters-component/filters';
import { FiltersService } from '../../../shared/filter/filter-service/filter.service';
import { ExportService } from '../../../shared/service/export-service/export-service';
import { PocketbaseService } from '../../../shared/service/pocket-base-services/pocketbase.service';

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

  records = signal<OwnerListRecord[]>([]);
  loading = signal(false);

  confirmVisible = signal(false);
  confirmMessage = signal('');
  selectedRecord = signal<OwnerListRow | null>(null);
  previewVisible = signal(false);
  pdfPreviewUrl = signal<string | null>(null);
  showCreate = signal(false);

  constructor(
    private ownerListSvc: OwnerListService,
    private route: ActivatedRoute,
    private router: Router,
    private filtersS: FiltersService,
    private exportService: ExportService,
    private pbSvc: PocketbaseService
  ) {
    effect(() => {
      this.loadRecords(this.filtersS.state());
    });
  }

  async ngOnInit() {
    this.filtersS.reset();
    this.showCreate.set(!this.route.snapshot.paramMap.get('id'));
  }

  async loadRecords(filters: Record<string, any> = {}) {
    this.loading.set(true);

    const clauses: string[] = [];

    const surnameClause = this.buildSurnameFilter(filters);
    if (surnameClause) clauses.push(surnameClause);

    const phoneClause = this.buildPhoneFilter(filters);
    if (phoneClause) clauses.push(phoneClause);

    const filter = clauses.join(' && ');

    this.records.set(await this.ownerListSvc.loadOwners(filter));

    this.loading.set(false);
  }



  onCreate() {
    this.router.navigate(['/proprietario/creazione']);
  }

  onEdit(row: OwnerListRecord) {
    this.router.navigate(['/proprietario', row.id]);
  }

  openConfirm(rec: OwnerListRecord) {
    this.selectedRecord.set(rec.raw);

    this.confirmMessage.set(`
      Vuoi davvero eliminare <b>${rec.name} ${rec.surname}</b>?<br>
      Verranno eliminati anche i cani associati.
    `);

    this.confirmVisible.set(true);
  }

  async onConfirmResult(ok: boolean) {
    if (!ok || !this.selectedRecord()) return;

    await this.ownerListSvc.deleteOwnerAndDogs(this.selectedRecord()!);
    await this.loadRecords(this.filtersS.state());
  }

  private buildSurnameFilter(filters: Record<string, any>): string | null {
    if (!filters['owner_surname']) return null;
    return `surname ~ "${filters['owner_surname']}"`;
  }

  private buildPhoneFilter(filters: Record<string, any>): string | null {
    if (!filters['phone_number']) return null;
    return `phone_number ~ "${filters['phone_number']}"`;
  }

  onDownloadOwnerDocuments(event: { row: OwnerListRecord; documents: string[] }) {
    const baseUrl = this.pbSvc.baseUrl;

    const urls = event.documents.map((doc) => `${baseUrl}/api/files/owner/${event.row.id}/${doc}`);

    const name = event.row.name ?? '';
    const surname = event.row.surname ?? 'sconosciuto';

    const safeName = name.toLowerCase().replace(/\s+/g, '_');
    const safeSurname = surname.toLowerCase().replace(/\s+/g, '_');

    const filename = `documenti_${safeSurname}_${safeName}.pdf`;

    this.exportService.exportImagesToPdf(filename, urls);
  }

  getOwnerFileUrl = (row: OwnerListRecord, file: string) =>
    `${this.pbSvc.baseUrl}/api/files/owner/${row.id}/${file}`;

  getOwnerSignatureUrl = (row: OwnerListRecord) =>
    row.signature ? `${this.pbSvc.baseUrl}/api/files/owner/${row.id}/${row.signature}` : '';
}
