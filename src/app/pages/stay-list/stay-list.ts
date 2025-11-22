import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { IndexTableComponent } from '../../tables/index-table/index-table';
import { formatDateTime } from '../../shared/utils/date-utils';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-stay-list',
  standalone: true,
  imports: [CommonModule, IndexTableComponent, ConfirmDialogComponent],
  templateUrl: './stay-list.html',
  styleUrls: ['./stay-list.scss'],
})
export class StayList implements OnInit {
  records: any[] = [];
  loading = false;
  confirmVisible = false;
  confirmMessage = '';
  selectedRecord: any = null;

  columns = [
    'owner',
    'dogs',
    'area',
    'box',
    'arrival_date',
    'departure_date',
    'boarding_fee',
    'deposit',
    'amount_paid',
    'outstanding_balance',
    'total_due',
  ];

  columnLabels: Record<string, string> = {
    owner: 'Proprietario',
    dogs: 'Cani',
    area: 'Area',
    box: 'Box',
    arrival_date: 'Arrivo',
    departure_date: 'Uscita',
    boarding_fee: 'Retta',
    deposit: 'Acconto',
    amount_paid: 'Pagato',
    outstanding_balance: 'Saldo residuo',
    total_due: 'Totale da pagare',
  };

  constructor(private pb: PocketbaseService, private router: Router) {}

  async ngOnInit() {
    await this.loadRecords();
  }

  async loadRecords() {
    this.loading = true;

    try {
      const stays = await this.pb.getAll('stays', 200, {
        expand: 'owner_id,dog_ids',
      });

      const occupations = await this.pb.getAll('occupations', 500, {
        expand: 'box,box.area',
      });

      this.records = stays.map((stay: any) => {
        const dogs = stay.expand?.['dog_ids'] || [];

        let area = '';
        let box = '';

        if (dogs.length > 0) {
          const dog = dogs[0];

          const occ = occupations.find(
            (o: any) =>
              o['dog'] === dog.id &&
              o['arrival_date'] <= stay['departure_date'] &&
              o['departure_date'] >= stay['arrival_date']
          );

          if (occ) {
            area = occ.expand?.['box']?.expand?.['area']?.nome_area || '';
            box = occ.expand?.['box']?.number || '';
          }
        }

        return {
          id: stay.id,
          owner: stay.expand?.['owner_id']
            ? `${stay.expand['owner_id'].name} ${stay.expand['owner_id'].surname}`
            : '',
          dogs: dogs.map((d: any) => d.name).join(', '),
          area,
          box,
          arrival_date: formatDateTime(stay['arrival_date']),
          departure_date: formatDateTime(stay['departure_date']),
          boarding_fee: stay['boarding_fee'],
          deposit: stay['deposit'],
          amount_paid: stay['amount_paid'],
          outstanding_balance: stay['outstanding_balance'],
          total_due: stay['total_due'],
          raw: stay,
        };
      });
    } finally {
      this.loading = false;
    }
  }

  onCreate() {
    this.router.navigate(['/soggiorno/creazione']);
  }

  onEdit(row: any) {
    this.router.navigate(['/soggiorno', row.raw.id]);
  }

  openConfirm(row: any) {
    this.selectedRecord = row.raw;

    const dogNames = row.dogs?.split(',').map((d: string) => d.trim()) || [];
    const isMultiple = dogNames.length > 1;

    this.confirmMessage = isMultiple
      ? `Vuoi eliminare il soggiorno per i cani: <br><b>${dogNames.join(', ')}</b>?`
      : `Vuoi eliminare il soggiorno per il cane: <br><b>${dogNames[0]}</b>?`;

    this.confirmVisible = true;
  }

  async onConfirmResult(ok: boolean) {
    if (!ok || !this.selectedRecord) return;

    await this.pb.deleteRecord('stays', this.selectedRecord.id);
    await this.loadRecords();
  }
}
