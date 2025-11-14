// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CardModule } from 'primeng/card';
// import { RippleModule } from 'primeng/ripple';
// import { PocketbaseService } from '../../../services/pocketbase.service';
// import { IndexTableComponent } from '../../tables/index-table/index-table';
// import { formatDateIt } from '../../shared/utils/date-utils';
// import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog';

// @Component({
//   selector: 'app-owner',
//   standalone: true,
//   imports: [CommonModule, CardModule, RippleModule, IndexTableComponent, ConfirmDialogComponent],
//   templateUrl: './owner.html',
//   styleUrls: ['./owner.scss'],
// })
// export class Owner implements OnInit {
//   records: any[] = [];
//   loading = false;

//   columns = [
//     'name',
//     'surname',
//     'place_of_birth',
//     'birth_date',
//     'province',
//     'residence',
//     'id_card_number',
//     'id_card_issue_date',
//     'id_card_expiration_date',
//     'tax_code',
//     'phone_number',
//     'email',
//   ];

//   columnLabels: Record<string, string> = {
//     name: 'Nome',
//     surname: 'Cognome',
//     place_of_birth: 'Luogo di nascita',
//     birth_date: 'Data di nascita',
//     province: 'Prov.',
//     residence: 'Residenza',
//     id_card_number: 'N. carta identità',
//     id_card_issue_date: 'Rilascio carta',
//     id_card_expiration_date: 'Scadenza carta',
//     tax_code: 'Codice fiscale',
//     phone_number: 'N. Telefono',
//     email: 'Email',
//   };

//   constructor(
//     private pb: PocketbaseService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   async ngOnInit() {
//     await this.loadRecords();
//   }

//   async loadRecords() {
//     const ownerId = this.route.snapshot.paramMap.get('id');
//     this.loading = true;
//     try {
//       if (ownerId) {
//         const record = await this.pb.getRecord('owner', ownerId);
//         this.records = [this.formatOwner(record)];
//       } else {
//         const data = await this.pb.getList('owner', 1, 50);
//         this.records = data.map((r: any) => this.formatOwner(r));
//       }
//     } catch (err) {
//       console.error('Errore caricamento proprietari:', err);
//     } finally {
//       this.loading = false;
//     }
//   }

//   private formatOwner(r: any) {
//     return {
//       id: r.id,
//       ...r,
//       birth_date: formatDateIt(r.birth_date),
//       id_card_issue_date: formatDateIt(r.id_card_issue_date),
//       id_card_expiration_date: formatDateIt(r.id_card_expiration_date),
//     };
//   }
//   shouldShowCreate(): boolean {
//     return !this.route.snapshot.paramMap.get('id');
//   }

//   onCreate() {
//     this.router.navigate(['/owner/create']);
//   }

//   onView(row: any) {
//     console.log('Visualizza proprietario', row);
//   }

//   onEdit(row: any) {
//     console.log('Modifica proprietario', row);
//   }

//   async onDelete(rec: any) {
//     if (!rec?.id) return;
//     try {
//       const dogs = await this.pb.getList('dogs', 1, 50, { filter: `owner_id="${rec.id}"` });
//       for (const d of dogs) {
//         await this.pb.deleteRecord('dogs', d.id);
//       }

//       // poi elimina il proprietario
//       await this.pb.deleteRecord('owner', rec.id);
//       await this.loadRecords();
//     } catch (err) {
//       console.error('Errore eliminazione:', err);
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { IndexTableComponent } from '../../tables/index-table/index-table';
import { formatDateIt } from '../../shared/utils/date-utils';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [CommonModule, CardModule, RippleModule, IndexTableComponent, ConfirmDialogComponent],
  templateUrl: './owner.html',
  styleUrls: ['./owner.scss'],
})
export class Owner implements OnInit {
  records: any[] = [];
  loading = false;
  confirmVisible = false;
  confirmMessage = '';
  selectedRecord: any = null;

  columns = [
    'name',
    'surname',
    'place_of_birth',
    'birth_date',
    'province',
    'residence',
    'id_card_number',
    'id_card_issue_date',
    'id_card_expiration_date',
    'tax_code',
    'phone_number',
    'email',
  ];

  columnLabels: Record<string, string> = {
    name: 'Nome',
    surname: 'Cognome',
    place_of_birth: 'Luogo di nascita',
    birth_date: 'Data di nascita',
    province: 'Prov.',
    residence: 'Residenza',
    id_card_number: 'N. carta identità',
    id_card_issue_date: 'Rilascio carta',
    id_card_expiration_date: 'Scadenza carta',
    tax_code: 'Codice fiscale',
    phone_number: 'N. Telefono',
    email: 'Email',
  };

  constructor(
    private pb: PocketbaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadRecords();
  }

  async loadRecords() {
    const ownerId = this.route.snapshot.paramMap.get('id');
    this.loading = true;
    try {
      if (ownerId) {
        const record = await this.pb.getRecord('owner', ownerId);
        this.records = [this.formatOwner(record)];
      } else {
        const data = await this.pb.getAll('owner');
        this.records = data.map((r: any) => this.formatOwner(r));
      }
    } catch (err) {
      console.error('Errore caricamento proprietari:', err);
    } finally {
      this.loading = false;
    }
  }

  private formatOwner(r: any) {
    return {
      id: r.id,
      ...r,
      birth_date: formatDateIt(r.birth_date),
      id_card_issue_date: formatDateIt(r.id_card_issue_date),
      id_card_expiration_date: formatDateIt(r.id_card_expiration_date),
    };
  }

  shouldShowCreate(): boolean {
    return !this.route.snapshot.paramMap.get('id');
  }

  onCreate() {
    this.router.navigate(['/proprietario/creazione']);
  }

  onView(row: any) {
    console.log('Visualizza proprietario', row);
  }

  onEdit(row: any) {
    console.log('Modifica proprietario', row);
  }

  openConfirm(rec: any) {
    this.selectedRecord = rec;
    this.confirmMessage = `
    Vuoi davvero eliminare <b>${rec.name} ${rec.surname}</b>?<br>
    Verranno eliminati anche i cani associati.
  `;
    this.confirmVisible = true;
  }

  async onConfirmResult(confirmed: boolean) {
    if (!confirmed || !this.selectedRecord) return;
    const rec = this.selectedRecord;

    try {
      const dogs = await this.pb.getList('dogs', 1, 50, { filter: `owner_id="${rec.id}"` });
      for (const d of dogs) {
        await this.pb.deleteRecord('dogs', d.id);
      }
      await this.pb.deleteRecord('owner', rec.id);
      await this.loadRecords();
      console.log('Proprietario eliminato con successo');
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  }
}
