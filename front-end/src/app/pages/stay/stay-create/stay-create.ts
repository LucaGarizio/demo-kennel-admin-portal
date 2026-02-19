import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { StayFormComponent } from '../stay-form/stay-form';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';

import { StayFormService } from '../../../shared/service/stay-service/stay.service';
import { StayLogicService } from '../stay-logic-service/stay-logic.service';
import { PocketbaseService } from '../../../shared/service/pocket-base-services/pocketbase.service';

import {
  OwnerOption,
  DogOption,
  AreaOption,
  BoxOption,
  StayFormModel,
} from '../../../shared/types/stay.types';
import { formatDateTime, normalizeDate, toPocketDateTime } from '../../../shared/utils/date-utils';
import { calculateRemaining } from '../../../shared/service/stay-service/stay-price.service';

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
export class StayCreateComponent implements OnInit {
  model: StayFormModel;
  ownerOptions = signal<OwnerOption[]>([]);
  dogOptions = signal<DogOption[]>([]);
  allDogs: DogOption[] = [];
  areaOptions = signal<AreaOption[]>([]);
  boxOptions = signal<BoxOption[]>([]);
  allBoxes: BoxOption[] = [];
  conflictSelectValue = 'x';
  showConflictDialog = signal(false);
  conflictOccupation = signal<any>(null);
  conflictOccupations = signal<any[]>([]);
  hasBlockingConflict = signal(false);
  isDoubleBoxConflict = signal(false);
  allowDespiteConflict = signal(false);
  dogInConflictName = signal('');

  constructor(
    private stayForm: StayFormService,
    private logic: StayLogicService,
    private pb: PocketbaseService,
    private router: Router
  ) {
    this.model = this.logic.initModel();
  }

  async ngOnInit() {
    const opts = await this.logic.loadAllOptions();

    this.ownerOptions.set(opts.owners);
    this.allDogs = opts.dogs;
    this.dogOptions.set(opts.dogs);
    this.areaOptions.set(opts.areas);
    this.allBoxes = opts.boxes;
    this.boxOptions.set(opts.boxes);
  }

  onOwnerSelected(ownerId: string) {
    this.model.id_proprietario = ownerId;
    this.dogOptions.set(ownerId ? this.stayForm.filterDogs(ownerId, this.allDogs) : this.allDogs);

    this.model.id_cani = this.model.id_cani.filter((cid) =>
      this.dogOptions().some((d) => d.id === cid)
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
    this.resetConflictState();
    this.updateAll();
  }

  async onDepartureDateChange() {
    this.resetConflictState();
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
    this.logic.updateTotals(this.model, this.allDogs);
  }

  async checkBoxConflictsOnDates() {
    const result = await this.logic.checkConflicts(this.model, this.allBoxes, this.allDogs);

    if (result) {
      this.conflictOccupations.set(result.conflicts);
      this.conflictOccupation.set(result.conflicts[0]);
      this.hasBlockingConflict.set(result.hasBlocking);
      this.isDoubleBoxConflict.set(result.isDoubleBoxConflict);
      this.dogInConflictName.set(result.incomingDogName);
      this.showConflictDialog.set(true);
      this.allowDespiteConflict.set(false);
    } else {
      this.resetConflictState();
    }
  }

  private resetConflictState() {
    this.showConflictDialog.set(false);
    this.conflictOccupation.set(null);
    this.conflictOccupations.set([]);
    this.hasBlockingConflict.set(false);
    this.isDoubleBoxConflict.set(false);
    this.allowDespiteConflict.set(false);
  }

  onConflictConfirm() {
    this.allowDespiteConflict.set(true);
    this.showConflictDialog.set(false);
  }

  onConflictCancel() {
    this.resetConflictState();
  }

  onConflictDialogClose() {
    this.resetConflictState();
  }

  async onSubmit(frontModel: StayFormModel) {
    if (this.hasBlockingConflict()) return;
    if (this.isDoubleBoxConflict() && !this.allowDespiteConflict()) return;

    const arrival = normalizeDate(frontModel.data_arrivo)!;
    const departure = normalizeDate(frontModel.data_uscita)!;

    const stay = await this.pb.createRecord('stays', {
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
    });

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

  getConflictDogName(): string {
    return this.logic.getConflictDogNames(this.conflictOccupations());
  }

  getConflictFrom(): string {
    return this.conflictOccupation() ? formatDateTime(this.conflictOccupation().arrival_date) : '';
  }

  getConflictTo(): string {
    return this.conflictOccupation() ? formatDateTime(this.conflictOccupation().departure_date) : '';
  }

  getIncomingDogName(): string {
    return this.dogInConflictName() || 'questo cane';
  }
}
