import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { IndexTableComponent } from '../../tables/index-table/index-table';
import { formatDateIt, formatDateTime } from '../../shared/utils/date-utils';
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
      const data = await this.pb.getAll('stays', 200, { expand: 'owner_id,dog_ids' });

      this.records = data.map((r: any) => ({
        id: r.id,
        owner: r.expand?.owner_id ? `${r.expand.owner_id.name} ${r.expand.owner_id.surname}` : '',
        dogs: r.expand?.dog_ids ? r.expand.dog_ids.map((d: any) => d.name).join(', ') : '',
        arrival_date: formatDateTime(r.arrival_date),
        departure_date: formatDateTime(r.departure_date),
        boarding_fee: r.boarding_fee,
        deposit: r.deposit,
        amount_paid: r.amount_paid,
        outstanding_balance: r.outstanding_balance,
        total_due: r.total_due,
        raw: r,
      }));
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
