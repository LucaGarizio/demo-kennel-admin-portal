import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StayFormComponent } from '../stay-form/stay-form';
import { StayFormService } from '../../../shared/service/stay-service/stay.service';
import {
  OwnerOption,
  DogOption,
  AreaOption,
  BoxOption,
  StayFormModel,
} from '../../../shared/types/stay.types';
import { PocketbaseService } from '../../../shared/service/pocket-base-services/pocketbase.service';
import { formatDateTime, normalizeDate, toPocketDateTime } from '../../../shared/utils/date-utils';
import {
  calculateDailyRate,
  calculateTotal,
  calculateRemaining,
} from '../../../shared/service/stay-service/stay-price.service';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stay-create',
  standalone: true,
  imports: [
    CommonModule,
    StayFormComponent,
    PageHeaderComponent,
    DialogModule,
    ButtonModule,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './stay-create.html',
  styleUrls: ['./stay-create.scss'],
})
export class StayCreateComponent {
  model: StayFormModel = this.initModel();

  ownerOptions: OwnerOption[] = [];
  dogOptions: DogOption[] = [];
  allDogs: DogOption[] = [];

  areaOptions: AreaOption[] = [];
  boxOptions: BoxOption[] = [];
  allBoxes: BoxOption[] = [];

  showConflictDialog = false;
  conflictOccupation: any = null;
  conflictSelectValue = 'x';
  hasBlockingConflict = false;

  constructor(
    private stayForm: StayFormService,
    private pb: PocketbaseService,
    private router: Router
  ) {}

  async ngOnInit() {
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
    const previous = this.model.cani;

    this.model.cani = selected.map((dog_id) => {
      const found = previous.find((c) => c.dog_id === dog_id);
      return (
        found || {
          dog_id,
          id_area: null,
          id_box: null,
          boxOptions: [],
        }
      );
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

  onBoxSelected(e: { index: number; box: string | null }) {
    const { index, box } = e;
    this.model.cani[index].id_box = box;
  }

  onArrivalDateChange() {
    this.hasBlockingConflict = false;
    this.conflictOccupation = null;
    this.showConflictDialog = false;

    this.updateAll();
  }

  async onDepartureDateChange() {
    this.hasBlockingConflict = false;
    this.conflictOccupation = null;
    this.showConflictDialog = false;

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
    if (this.hasBlockingConflict) return;

    const arrival = normalizeDate(frontModel.data_arrivo);
    const departure = normalizeDate(frontModel.data_uscita);
    if (!arrival || !departure) {
      console.error('Date non valide', { arrival, departure });
      return;
    }

    const stayPayload = {
      owner_id: frontModel.id_proprietario,
      dog_ids: frontModel.id_cani,
      arrival_date: toPocketDateTime(arrival),
      departure_date: toPocketDateTime(departure),
      boarding_fee: frontModel.retta,
      deposit: frontModel.acconto,
      outstanding_balance: frontModel.rimanente,
      total_due: frontModel.totale_dovuto,
      payment_type: frontModel.tipo_pagamento,
      notes: frontModel.note || '',
    };

    const stay = await this.pb.createRecord('stays', stayPayload);

    for (const entry of frontModel.cani) {
      if (!entry.id_area || !entry.id_box) continue;

      await this.pb.createRecord('occupations', {
        dog: entry.dog_id,
        box: entry.id_box,
        area: entry.id_area,
        arrival_date: toPocketDateTime(arrival),
        departure_date: toPocketDateTime(departure),
        stay: stay.id,
      });
    }

    this.router.navigate(['/lista-soggiorni']);
  }

  private async checkBoxConflictsOnDates() {
    const arrival = normalizeDate(this.model.data_arrivo);
    const departure = normalizeDate(this.model.data_uscita);

    if (!arrival || !departure) return;

    for (const cane of this.model.cani) {
      if (!cane.id_box) continue;

      const conflicts = await this.pb.getAll('occupations', 1, {
        filter: `
        box = "${cane.id_box}"
        && arrival_date <= "${toPocketDateTime(departure)}"
        && departure_date >= "${toPocketDateTime(arrival)}"
      `,
        expand: 'dog',
      });

      if (conflicts.length > 0) {
        this.conflictOccupation = conflicts[0];
        this.showConflictDialog = true;
        this.hasBlockingConflict = true;
        return;
      }
    }
    this.hasBlockingConflict = false;
    this.conflictOccupation = null;
    this.showConflictDialog = false;
  }

  getConflictDogName(): string {
    const occ = this.conflictOccupation;
    if (!occ) return '';
    return occ.expand?.dog?.nome || occ.expand?.dog?.name || 'Altro cane';
  }

  getConflictFrom(): string {
    const occ = this.conflictOccupation;
    return occ ? formatDateTime(occ.arrival_date) : '';
  }

  getConflictTo(): string {
    const occ = this.conflictOccupation;
    return occ ? formatDateTime(occ.departure_date) : '';
  }

  onConflictDialogClose() {
    this.showConflictDialog = false;
    this.hasBlockingConflict = false;
    this.conflictOccupation = null;
    this.model.data_arrivo = null;
    this.model.data_uscita = null;
    this.updateAll();
  }
}
