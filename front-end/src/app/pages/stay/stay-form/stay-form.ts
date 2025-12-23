import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Input() model: any = {};

  @Input() ownerOptions: any[] = [];
  @Input() dogOptions: any[] = [];
  @Input() areaOptions: any[] = [];
  @Input() blockSave = false;

  @Output() save = new EventEmitter<any>();
  @Output() ownerChange = new EventEmitter<string>();
  @Output() dogsChange = new EventEmitter<string[]>();
  @Output() areaChange = new EventEmitter<{ index: number; area: string | null }>();
  @Output() boxChange = new EventEmitter<{ index: number; box: string | null }>();
  @Output() arrivalChange = new EventEmitter<Date>();
  @Output() departureChange = new EventEmitter<Date>();
  @Output() depositChange = new EventEmitter<void>();
  @Input() boxOptions: any[] = [];

  tenderOptions = [
    { label: 'Contanti', value: 'cash' },
    { label: 'Pagamento elettronico', value: 'electronic' },
  ];

  pickedUpOptions = [
    { label: 'No', value: false },
    { label: 'Sì', value: true },
  ];

  getDogName(id: string): string {
    return this.dogOptions.find((d) => d.id === id)?.nome ?? '';
  }

  getEmptyMessage(index: number): string {
    const cane = this.model.cani[index];

    if (!cane.id_area) {
      return "Seleziona un'area per vedere i box disponibili";
    }

    if (cane.boxOptions.length === 0) {
      return "Nessun box disponibile per quest'area";
    }

    return '';
  }

  onSubmit() {
    this.save.emit(this.model);
  }

  onPickedUpChange(value: boolean) {
    if (value === true) {
      this.model.cani.forEach((c: StayFormModel['cani'][number]) => {
        c.id_area = null;
        c.id_box = null;
        c.boxOptions = [];
      });
    }
  }
}
