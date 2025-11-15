import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { IndexTableComponent } from '../../tables/index-table/index-table';
import { formatDateTime } from '../../shared/utils/date-utils';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, CardModule, RippleModule, IndexTableComponent, ConfirmDialogComponent],
  templateUrl: './animal-list.html',
  styleUrls: ['./animal-list.scss'],
})
export class List implements OnInit {
  records: any[] = [];
  loading = false;
  selectedRecord: any = null;
  confirmVisible = false;
  confirmMessage = '';
  columns = ['name', 'race', 'sex', 'size', 'microchip', 'vax', 'scared', 'extra', 'owner_id'];

  columnLabels: Record<string, string> = {
    name: 'Nome',
    race: 'Razza',
    sex: 'Sesso',
    size: 'Taglia',
    microchip: 'Microchip',
    vax: 'Vaccinato',
    scared: 'Spaventato',
    extra: 'extra',
    owner_id: 'Proprietario',
  };

  constructor(private pb: PocketbaseService, private router: Router) {}

  async ngOnInit() {
    await this.loadRecords();
  }

  async loadRecords() {
    this.loading = true;

    try {
      const data = await this.pb.getAll('dogs', 200, { expand: 'owner_id' });
      data.sort((a: any, b: any) => Date.parse(b.created) - Date.parse(a.created));

      this.records = data.map((r: any) => ({
        ...r,
        arrival_date: formatDateTime(r.arrival_date),
        departure_date: formatDateTime(r.departure_date),
        size:
          r.size === 'small'
            ? 'Piccola'
            : r.size === 'medium'
            ? 'Media'
            : r.size === 'big'
            ? 'Grande'
            : '',
        vax: r.vax ? 'Si' : 'No',
        scared: r.scared ? 'Si' : 'No',
        owner_id: r.expand?.owner_id
          ? `${r.expand.owner_id.name} ${r.expand.owner_id.surname}`
          : r.owner_id,
      }));
    } catch (err) {
      console.error('Errore caricamento record:', err);
    } finally {
      this.loading = false;
    }
  }

  goToCreate() {
    this.router.navigate(['/cane/creazione']);
  }

  onView(row: any) {
    console.log('Visualizza', row);
  }

  onEdit(row: any) {
    console.log('Modifica', row);
  }

  openConfirm(rec: any) {
    this.selectedRecord = rec;
    this.confirmMessage = `Vuoi davvero eliminare <b>${rec.name}</b>?`;
    this.confirmVisible = true;
  }

  async onConfirmResult(confirmed: boolean) {
    this.confirmVisible = false;
    if (!confirmed || !this.selectedRecord) return;

    try {
      await this.pb.deleteRecord('dogs', this.selectedRecord.id);
      await this.loadRecords();
    } catch (err) {
      console.error('Errore eliminazione cane:', err);
    } finally {
      this.selectedRecord = null;
    }
  }

  onCellClick(event: { column: string; value: any; row: any }) {
    if (event.column === 'owner_id' && event.row?.expand?.owner_id?.id) {
      const ownerId = event.row.expand.owner_id.id;
      this.router.navigate(['/proprietario', ownerId]);
    }
  }
}
