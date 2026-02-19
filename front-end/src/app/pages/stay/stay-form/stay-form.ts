import { Component, effect, input, output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { StayFormModel } from '../../../shared/types/stay.types';

@Component({
  selector: 'app-stay-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    CardModule,
    MultiSelectModule,
  ],
  templateUrl: './stay-form.html',
  styleUrls: ['./stay-form.scss'],
})
export class StayFormComponent {
  model = input<any>({});

  ownerOptions = input<any[]>([]);
  dogOptions = input<any[]>([]);
  areaOptions = input<any[]>([]);
  blockSave = input<boolean>(false);
  boxOptions = input<any[]>([]);

  save = output<any>();
  ownerChange = output<string>();
  dogsChange = output<string[]>();
  areaChange = output<{ index: number; area: string | null }>();
  boxChange = output<{ index: number; box: string | null }>();
  arrivalChange = output<Date>();
  departureChange = output<Date>();
  depositChange = output<void>();

  localModel: any = {};

  constructor() {
    effect(() => {
      this.localModel = this.model();
    });
  }

  tenderOptions = [
    { label: 'Contante', value: 'cash' },
    { label: 'Pagamento elettronico', value: 'electronic' },
  ];

  pickedUpOptions = [
    { label: 'No', value: false },
    { label: 'Sì', value: true },
  ];

  getDogName(id: string): string {
    return this.dogOptions().find((d) => d.id === id)?.nome ?? '';
  }

  getEmptyMessage(index: number): string {
    const cane = this.localModel.cani[index];

    if (!cane.id_area) {
      return "Seleziona un'area per vedere i box disponibili";
    }

    if (cane.boxOptions.length === 0) {
      return "Nessun box disponibile per quest'area";
    }

    return '';
  }

  onSubmit() {
    this.save.emit(this.localModel);
  }

  onPickedUpChange(value: boolean) {
    if (value === true) {
      this.localModel.cani.forEach((c: StayFormModel['cani'][number]) => {
        c.id_area = null;
        c.id_box = null;
        c.boxOptions = [];
      });
    }
  }
}
