// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { StayFormComponent } from '../stay-form/stay-form';
// import { StayFormService } from '../../../shared/service/stay-service/stay.service';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';

// import {
//   StayFormModel,
//   OwnerOption,
//   DogOption,
//   AreaOption,
//   BoxOption,
// } from '../../../shared/types/stay.types';

// import { fromBackendStay, toBackendStay } from '../../../shared/utils/mapper';
// import { PocketbaseService } from '../../../shared/service/pocket-base-services/pocketbase.service';

// import {
//   calculateDailyRate,
//   calculateTotal,
//   calculateRemaining,
// } from '../../../shared/service/stay-service/stay-price.service';

// import { normalizeDate, toPocketDateTime, formatDateTime } from '../../../shared/utils/date-utils';

// import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
// import { SelectModule } from 'primeng/select';
// import { DialogModule } from 'primeng/dialog';

// @Component({
//   selector: 'app-stay-edit',
//   standalone: true,
//   imports: [
//     CommonModule,
//     StayFormComponent,
//     PageHeaderComponent,
//     SelectModule,
//     DialogModule,
//     FormsModule,
//     ButtonModule,
//   ],
//   templateUrl: './stay-edit.html',
//   styleUrls: ['./stay-edit.scss'],
// })
// export class StayEditComponent {
//   id!: string;

//   model: StayFormModel = this.initModel();

//   ownerOptions: OwnerOption[] = [];
//   dogOptions: DogOption[] = [];
//   allDogs: DogOption[] = [];

//   areaOptions: AreaOption[] = [];
//   boxOptions: BoxOption[] = [];
//   allBoxes: BoxOption[] = [];

//   existingOccupation: any[] = [];

//   showConflictDialog = false;
//   conflictOccupation: any = null;
//   conflictSelectValue = 'x';
//   hasBlockingConflict = false;

//   originalArrival: Date | null = null;
//   originalDeparture: Date | null = null;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private pb: PocketbaseService,
//     private stayForm: StayFormService
//   ) {}

//   async ngOnInit() {
//     this.id = this.route.snapshot.paramMap.get('id')!;

//     const [owners, dogs, areas, boxes] = await Promise.all([
//       this.stayForm.loadOwners(),
//       this.stayForm.loadDogs(),
//       this.stayForm.loadAreas(),
//       this.stayForm.loadBoxes(),
//     ]);

//     this.ownerOptions = owners;
//     this.allDogs = dogs;
//     this.dogOptions = dogs;
//     this.areaOptions = areas;
//     this.allBoxes = boxes;
//     this.boxOptions = boxes;

//     await this.loadStay();
//   }

//   private initModel(): StayFormModel {
//     return {
//       id_proprietario: null,
//       id_cani: [],
//       cani: [],
//       data_arrivo: null,
//       data_uscita: null,
//       retta: 0,
//       acconto: 0,
//       rimanente: 0,
//       totale_dovuto: 0,
//       tipo_pagamento: null,
//       note: '',
//     };
//   }

//   async loadStay() {
//     const stay = await this.pb.getOne('stays', this.id, {
//       expand: 'owner_id,dog_ids',
//     });

//     const stayModel = fromBackendStay(stay);
//     const dogIds = stayModel.id_cani;

//     const occupations = await this.pb.getAll('occupations', 200, {
//       expand: 'dog,box,box.area',
//       filter: dogIds.map((id: string) => `dog="${id}"`).join(' || '),
//     });

//     this.existingOccupation = occupations;

//     const cani = dogIds.map((cid: string) => {
//       const occ = occupations.find((o) => o.expand?.['dog']?.id === cid);

//       return {
//         dog_id: cid,
//         id_area: occ?.expand?.['box']?.expand?.area?.id ?? null,
//         id_box: occ?.expand?.['box']?.id ?? null,
//         boxOptions: occ?.expand?.['box']?.expand?.area?.id
//           ? this.stayForm.filterBoxes(occ.expand['box'].expand.area.id, this.allBoxes)
//           : [],
//       };
//     });

//     this.model = {
//       id_proprietario: stayModel.id_proprietario,
//       id_cani: dogIds,
//       cani,
//       data_arrivo: stayModel.data_arrivo,
//       data_uscita: stayModel.data_uscita,
//       retta: stayModel.retta,
//       acconto: stayModel.acconto,
//       rimanente: stayModel.rimanente,
//       totale_dovuto: stayModel.totale_dovuto,
//       tipo_pagamento: stayModel.tipo_pagamento,
//       note: stayModel.note,
//     };

//     this.originalArrival = normalizeDate(this.model.data_arrivo);
//     this.originalDeparture = normalizeDate(this.model.data_uscita);

//     this.onOwnerSelected(this.model.id_proprietario!);
//     this.updateAll();
//   }

//   onOwnerSelected(ownerId: string) {
//     this.model.id_proprietario = ownerId;
//     this.dogOptions = ownerId ? this.stayForm.filterDogs(ownerId, this.allDogs) : this.allDogs;

//     this.model.id_cani = this.model.id_cani.filter((cid) =>
//       this.dogOptions.some((d) => d.id === cid)
//     );

//     this.updateAll();
//   }

//   onDogsChanged() {
//     const selected = this.model.id_cani;

//     this.model.cani = this.model.cani.filter((c) => selected.includes(c.dog_id));

//     selected.forEach((cid) => {
//       if (!this.model.cani.some((c) => c.dog_id === cid)) {
//         this.model.cani.push({
//           dog_id: cid,
//           id_area: null,
//           id_box: null,
//           boxOptions: [],
//         });
//       }
//     });

//     this.updateAll();
//   }

//   onAreaSelected(e: { index: number; area: string | null }) {
//     const { index, area } = e;
//     this.model.cani[index].id_area = area;

//     const filtered = area ? this.stayForm.filterBoxes(area, this.allBoxes) : [];

//     this.model.cani[index].boxOptions = filtered;

//     if (!filtered.some((b) => b.id === this.model.cani[index].id_box)) {
//       this.model.cani[index].id_box = null;
//     }
//   }

//   onBoxSelected(e: { index: number; box: string | null }) {
//     this.model.cani[e.index].id_box = e.box;
//   }

//   onArrivalDateChange() {
//     this.updateAll();
//   }

//   async onDepartureDateChange() {
//     this.updateAll();
//     await this.checkBoxConflictsOnDates();
//   }

//   onDepositChange() {
//     this.model.rimanente = calculateRemaining(
//       Number(this.model.totale_dovuto || 0),
//       Number(this.model.acconto || 0)
//     );
//   }

//   private updateAll() {
//     const dogs = this.allDogs.filter((d) => this.model.id_cani.includes(d.id));

//     this.model.retta = calculateDailyRate(dogs);

//     if (this.model.data_arrivo && this.model.data_uscita) {
//       const start = normalizeDate(this.model.data_arrivo)!;
//       const end = normalizeDate(this.model.data_uscita)!;
//       this.model.totale_dovuto = calculateTotal(this.model.retta, start, end);
//     }

//     this.model.rimanente = calculateRemaining(
//       Number(this.model.totale_dovuto || 0),
//       Number(this.model.acconto || 0)
//     );
//   }

//   async onSubmit(frontModel: StayFormModel) {
//     if (this.hasBlockingConflict) return;

//     frontModel.data_arrivo = normalizeDate(frontModel.data_arrivo);
//     frontModel.data_uscita = normalizeDate(frontModel.data_uscita);

//     const payload = toBackendStay(frontModel);
//     await this.pb.updateRecord('stays', this.id, payload);

//     for (const occ of this.existingOccupation) {
//       await this.pb.deleteRecord('occupations', occ.id);
//     }

//     for (const entry of frontModel.cani) {
//       if (!entry.id_area || !entry.id_box) continue;

//       await this.pb.createRecord('occupations', {
//         dog: entry.dog_id,
//         box: entry.id_box,
//         area: entry.id_area,
//         arrival_date: toPocketDateTime(frontModel.data_arrivo!),
//         departure_date: toPocketDateTime(frontModel.data_uscita!),
//         stay: this.id,
//       });
//     }

//     this.router.navigate(['/lista-soggiorni']);
//   }

//   private async checkBoxConflictsOnDates() {
//     const arrival = normalizeDate(this.model.data_arrivo);
//     const departure = normalizeDate(this.model.data_uscita);

//     if (!arrival || !departure) return;

//     for (const cane of this.model.cani) {
//       if (!cane.id_box) continue;

//       const conflicts = await this.pb.getAll('occupations', 1, {
//         filter: `
//         box = "${cane.id_box}"
//         && dog != "${cane.dog_id}"
//         && arrival_date <= "${toPocketDateTime(departure)}"
//         && departure_date >= "${toPocketDateTime(arrival)}"
//       `,
//         expand: 'dog',
//       });

//       if (conflicts.length > 0) {
//         this.conflictOccupation = conflicts[0];
//         this.showConflictDialog = true;
//         this.hasBlockingConflict = true;
//         return;
//       }
//     }

//     this.hasBlockingConflict = false;
//     this.conflictOccupation = null;
//     this.showConflictDialog = false;
//   }

//   onConflictDialogClose() {
//     this.showConflictDialog = false;
//     this.hasBlockingConflict = false;
//     this.conflictOccupation = null;
//     this.model.data_arrivo = this.originalArrival;
//     this.model.data_uscita = this.originalDeparture;

//     this.updateAll();
//   }

//   getConflictDogName(): string {
//     return (
//       this.conflictOccupation?.expand?.dog?.nome ||
//       this.conflictOccupation?.expand?.dog?.name ||
//       'Altro cane'
//     );
//   }

//   getConflictFrom(): string {
//     return this.conflictOccupation ? formatDateTime(this.conflictOccupation.arrival_date) : '';
//   }

//   getConflictTo(): string {
//     return this.conflictOccupation ? formatDateTime(this.conflictOccupation.departure_date) : '';
//   }
// }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StayFormComponent } from '../stay-form/stay-form';
import { StayFormService } from '../../../shared/service/stay-service/stay.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import {
  StayFormModel,
  OwnerOption,
  DogOption,
  AreaOption,
  BoxOption,
} from '../../../shared/types/stay.types';

import { fromBackendStay, toBackendStay } from '../../../shared/utils/mapper';
import { PocketbaseService } from '../../../shared/service/pocket-base-services/pocketbase.service';

import {
  calculateDailyRate,
  calculateTotal,
  calculateRemaining,
} from '../../../shared/service/stay-service/stay-price.service';

import { normalizeDate, toPocketDateTime, formatDateTime } from '../../../shared/utils/date-utils';

import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-stay-edit',
  standalone: true,
  imports: [
    CommonModule,
    StayFormComponent,
    PageHeaderComponent,
    SelectModule,
    DialogModule,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './stay-edit.html',
  styleUrls: ['./stay-edit.scss'],
})
export class StayEditComponent {
  id!: string;

  model: StayFormModel = this.initModel();

  ownerOptions: OwnerOption[] = [];
  dogOptions: DogOption[] = [];
  allDogs: DogOption[] = [];

  areaOptions: AreaOption[] = [];
  boxOptions: BoxOption[] = [];
  allBoxes: BoxOption[] = [];

  existingOccupation: any[] = [];

  showConflictDialog = false;
  conflictOccupation: any = null;
  conflictOccupations: any[] = [];

  conflictSelectValue = 'x';
  hasBlockingConflict = false;

  originalArrival: Date | null = null;
  originalDeparture: Date | null = null;

  // ✅ AGGIUNTE (minime)
  isDoubleBoxConflict = false; // true se il conflitto riguarda un box doppio
  allowDespiteConflict = false; // true solo se l’utente ha cliccato “Sì”

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pb: PocketbaseService,
    private stayForm: StayFormService
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;

    const [owners, dogs, areas, boxes] = await Promise.all([
      this.stayForm.loadOwners(),
      this.stayForm.loadDogs(),
      this.stayForm.loadAreas(),
      this.stayForm.loadBoxes(),
    ]);

    this.ownerOptions = owners;
    this.allDogs = dogs;
    this.dogOptions = dogs;
    this.areaOptions = areas;
    this.allBoxes = boxes;
    this.boxOptions = boxes;

    await this.loadStay();
  }

  private initModel(): StayFormModel {
    return {
      id_proprietario: null,
      id_cani: [],
      cani: [],
      data_arrivo: null,
      data_uscita: null,
      retta: 0,
      acconto: 0,
      rimanente: 0,
      totale_dovuto: 0,
      tipo_pagamento: null,
      note: '',
    };
  }

  async loadStay() {
    const stay = await this.pb.getOne('stays', this.id, {
      expand: 'owner_id,dog_ids',
    });

    const stayModel = fromBackendStay(stay);
    const dogIds = stayModel.id_cani;

    const occupations = await this.pb.getAll('occupations', 200, {
      expand: 'dog,box,box.area',
      filter: dogIds.map((id: string) => `dog="${id}"`).join(' || '),
    });

    this.existingOccupation = occupations;

    const cani = dogIds.map((cid: string) => {
      const occ = occupations.find((o) => o.expand?.['dog']?.id === cid);

      return {
        dog_id: cid,
        id_area: occ?.expand?.['box']?.expand?.area?.id ?? null,
        id_box: occ?.expand?.['box']?.id ?? null,
        boxOptions: occ?.expand?.['box']?.expand?.area?.id
          ? this.stayForm.filterBoxes(occ.expand['box'].expand.area.id, this.allBoxes)
          : [],
      };
    });

    this.model = {
      id_proprietario: stayModel.id_proprietario,
      id_cani: dogIds,
      cani,
      data_arrivo: stayModel.data_arrivo,
      data_uscita: stayModel.data_uscita,
      retta: stayModel.retta,
      acconto: stayModel.acconto,
      rimanente: stayModel.rimanente,
      totale_dovuto: stayModel.totale_dovuto,
      tipo_pagamento: stayModel.tipo_pagamento,
      note: stayModel.note,
    };

    this.originalArrival = normalizeDate(this.model.data_arrivo);
    this.originalDeparture = normalizeDate(this.model.data_uscita);

    this.onOwnerSelected(this.model.id_proprietario!);
    this.updateAll();
  }

  onOwnerSelected(ownerId: string) {
    this.model.id_proprietario = ownerId;
    this.dogOptions = ownerId ? this.stayForm.filterDogs(ownerId, this.allDogs) : this.allDogs;

    this.model.id_cani = this.model.id_cani.filter((cid) =>
      this.dogOptions.some((d) => d.id === cid)
    );

    this.updateAll();
  }

  onDogsChanged() {
    const selected = this.model.id_cani;

    this.model.cani = this.model.cani.filter((c) => selected.includes(c.dog_id));

    selected.forEach((cid) => {
      if (!this.model.cani.some((c) => c.dog_id === cid)) {
        this.model.cani.push({
          dog_id: cid,
          id_area: null,
          id_box: null,
          boxOptions: [],
        });
      }
    });

    this.updateAll();
  }

  onAreaSelected(e: { index: number; area: string | null }) {
    const { index, area } = e;
    this.model.cani[index].id_area = area;

    const filtered = area ? this.stayForm.filterBoxes(area, this.allBoxes) : [];

    this.model.cani[index].boxOptions = filtered;

    if (!filtered.some((b) => b.id === this.model.cani[index].id_box)) {
      this.model.cani[index].id_box = null;
    }
  }

  async onBoxSelected(e: { index: number; box: string | null }) {
    this.model.cani[e.index].id_box = e.box;
    if (this.model.data_arrivo && this.model.data_uscita) {
      await this.checkBoxConflictsOnDates();
    }
  }

  onArrivalDateChange() {
    this.showConflictDialog = false;
    this.conflictOccupation = null;
    this.hasBlockingConflict = false;
    this.isDoubleBoxConflict = false;
    this.allowDespiteConflict = false;

    this.updateAll();
  }

  async onDepartureDateChange() {
    // reset logica conflitto quando si cambiano date
    this.showConflictDialog = false;
    this.conflictOccupation = null;
    this.hasBlockingConflict = false;
    this.isDoubleBoxConflict = false;
    this.allowDespiteConflict = false;

    this.updateAll();
    await this.checkBoxConflictsOnDates();
  }

  onDepositChange() {
    this.model.rimanente = calculateRemaining(
      Number(this.model.totale_dovuto || 0),
      Number(this.model.acconto || 0)
    );
  }

  private updateAll() {
    const dogs = this.allDogs.filter((d) => this.model.id_cani.includes(d.id));

    this.model.retta = calculateDailyRate(dogs);

    if (this.model.data_arrivo && this.model.data_uscita) {
      const start = normalizeDate(this.model.data_arrivo)!;
      const end = normalizeDate(this.model.data_uscita)!;
      this.model.totale_dovuto = calculateTotal(this.model.retta, start, end);
    }

    this.model.rimanente = calculateRemaining(
      Number(this.model.totale_dovuto || 0),
      Number(this.model.acconto || 0)
    );
  }

  async onSubmit(frontModel: StayFormModel) {
    // 🔴 singolo occupato = blocco
    if (this.hasBlockingConflict) return;

    // 🟡 doppio occupato: se c’è conflitto e NON hai cliccato “Sì” → non salvare
    if (this.conflictOccupation && this.isDoubleBoxConflict && !this.allowDespiteConflict) return;

    frontModel.data_arrivo = normalizeDate(frontModel.data_arrivo);
    frontModel.data_uscita = normalizeDate(frontModel.data_uscita);

    const payload = toBackendStay(frontModel);
    await this.pb.updateRecord('stays', this.id, payload);

    for (const occ of this.existingOccupation) {
      await this.pb.deleteRecord('occupations', occ.id);
    }

    for (const entry of frontModel.cani) {
      if (!entry.id_area || !entry.id_box) continue;

      await this.pb.createRecord('occupations', {
        dog: entry.dog_id,
        box: entry.id_box,
        area: entry.id_area,
        arrival_date: toPocketDateTime(frontModel.data_arrivo!),
        departure_date: toPocketDateTime(frontModel.data_uscita!),
        stay: this.id,
      });
    }

    this.router.navigate(['/lista-soggiorni']);
  }

  private async checkBoxConflictsOnDates() {
    const arrival = normalizeDate(this.model.data_arrivo);
    const departure = normalizeDate(this.model.data_uscita);
    if (!arrival || !departure) return;

    this.hasBlockingConflict = false;
    this.conflictOccupation = null;
    this.showConflictDialog = false;
    this.isDoubleBoxConflict = false;
    this.allowDespiteConflict = false;

    for (const cane of this.model.cani) {
      if (!cane.id_box) continue;

      const box = this.allBoxes.find((b) => b.id === cane.id_box);
      const isDouble = box?.double === true;

      const conflicts = await this.pb.getAll('occupations', 200, {
        filter: `
        box = "${cane.id_box}"
        && dog != "${cane.dog_id}"
        && arrival_date <= "${toPocketDateTime(departure)}"
        && departure_date >= "${toPocketDateTime(arrival)}"
      `,
        expand: 'dog',
      });

      if (conflicts.length === 0) continue;

      const occupiedCount = conflicts.length;

      if (!isDouble || occupiedCount >= 2) {
        this.conflictOccupations = conflicts;
        this.conflictOccupation = conflicts[0];
        this.showConflictDialog = true;
        this.hasBlockingConflict = true;
        this.isDoubleBoxConflict = false;
        return;
      }

      if (isDouble && occupiedCount === 1) {
        this.conflictOccupations = conflicts;
        this.conflictOccupation = conflicts[0];
        this.showConflictDialog = true;
        this.hasBlockingConflict = false;
        this.isDoubleBoxConflict = true;
        this.allowDespiteConflict = false;
        return;
      }
    }
  }

  onConflictDialogClose() {
    this.showConflictDialog = false;
    this.hasBlockingConflict = false;
    this.conflictOccupation = null;
    this.isDoubleBoxConflict = false;
    this.allowDespiteConflict = false;

    this.model.data_arrivo = this.originalArrival;
    this.model.data_uscita = this.originalDeparture;

    this.updateAll();
  }

  onConflictConfirm() {
    this.allowDespiteConflict = true;
    this.showConflictDialog = false;
  }

  onConflictCancel() {
    this.allowDespiteConflict = false;
    this.onConflictDialogClose();
  }

  getConflictDogName(): string {
    if (!this.conflictOccupations?.length) return 'Altro cane';

    return this.conflictOccupations
      .map((o) => o.expand?.dog?.nome || o.expand?.dog?.name)
      .filter(Boolean)
      .join(', ');
  }

  getConflictFrom(): string {
    return this.conflictOccupation ? formatDateTime(this.conflictOccupation.arrival_date) : '';
  }

  getConflictTo(): string {
    return this.conflictOccupation ? formatDateTime(this.conflictOccupation.departure_date) : '';
  }

  getIncomingDogName(): string {
    const last = this.model.cani[this.model.cani.length - 1];
    if (!last) return 'questo cane';

    const dog = this.allDogs.find((d) => d.id === last.dog_id);
    return dog?.nome || 'questo cane';
  }
}
