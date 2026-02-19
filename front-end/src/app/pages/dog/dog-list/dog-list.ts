import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';

import { IndexTableComponent } from '../../../tables/index-table/index-table';
import { ConfirmDialogComponent } from '../../../shared/component/dialogs/confirm-dialog/confirm-dialog';

import { DogListService } from '../../../shared/service/dog/dog-list.service';
import { DogListRecord, DogListRow } from '../../../shared/types/dog-list.types';
import { FilterComponent } from '../../../shared/filter/filters-component/filters';
import { FiltersService } from '../../../shared/filter/filter-service/filter.service';
import { FilterConfig } from '../../../shared/filter/types/filter.types';
import { DOG_LIST_COLUMNS, DOG_LIST_LABELS } from '../config/config-column';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
import { DetailsDialogComponent } from '../../../shared/component/dialogs/details-dialog/details-dialog';

@Component({
  selector: 'app-dog-list',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    RippleModule,
    IndexTableComponent,
    ConfirmDialogComponent,
    PageHeaderComponent,
    FilterComponent,
    DetailsDialogComponent,
  ],
  templateUrl: './dog-list.html',
  styleUrls: ['./dog-list.scss'],
})
export class DogList implements OnInit {
  columns = [...DOG_LIST_COLUMNS];
  columnLabels = DOG_LIST_LABELS;

  records = signal<DogListRecord[]>([]);
  loading = signal(false);

  selectedRecord = signal<DogListRow | null>(null);
  confirmVisible = signal(false);
  confirmMessage = signal('');
  showOwnerPreview = signal(false);
  hoverOwnerData = signal<any>(null);

  constructor(
    private dogListSvc: DogListService,
    private router: Router,
    private filtersS: FiltersService
  ) {
    effect(() => {
      const filters = this.filtersS.state();
      this.loadRecords(filters);
    });
  }

  async ngOnInit() {
    this.filtersS.reset();
  }

  async loadRecords(filters: Record<string, any> = {}) {
    this.loading.set(true);

    const clauses: string[] = [];

    if (filters['dog_name']) {
      const val = filters['dog_name'].trim();
      if (val.length > 0) {
        clauses.push(`name~"%${val}%"`);
      }
    }

    if (filters['owner_name']) {
      const val = filters['owner_name'].trim();
      if (val.length > 0) {
        clauses.push(`owner_id.name~"%${val}%" || owner_id.surname~"%${val}%"`);
      }
    }

    if (filters['microchip']) {
      const val = filters['microchip'].trim();
      if (val.length > 0) {
        clauses.push(`microchip~"%${val}%"`);
      }
    }

    const filter = clauses.join(' && ');

    try {
      this.records.set(await this.dogListSvc.loadDogs(filter));
    } catch (err) {
      console.error('DOG-LIST: errore loadRecords:', err);
    }

    this.loading.set(false);
  }

  onCreate() {
    this.router.navigate(['/cane/creazione']);
  }

  onEdit(row: DogListRecord) {
    this.router.navigate(['/cane', row.id]);
  }

  openConfirm(rec: DogListRecord) {
    this.selectedRecord.set(rec.raw);
    this.confirmMessage.set(`Vuoi davvero eliminare <b>${rec.name}</b>?`);
    this.confirmVisible.set(true);
  }

  async onConfirmResult(confirmed: boolean) {
    this.confirmVisible.set(false);
    if (!confirmed || !this.selectedRecord()) return;

    await this.dogListSvc.deleteDog(this.selectedRecord()!);
    await this.loadRecords(this.filtersS.state());
    this.selectedRecord.set(null);
  }

  onCellClick(event: { column: string; row: DogListRecord }) {
    if (event.column !== 'owner_id') return;

    const owner = event.row.raw.expand?.owner_id;
    if (!owner) return;

    this.hoverOwnerData.set(owner);
    this.showOwnerPreview.set(true);
  }
}
