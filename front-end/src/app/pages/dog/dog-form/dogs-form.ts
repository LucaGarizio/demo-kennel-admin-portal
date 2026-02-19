import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-dogs-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    MultiSelectModule,
    InputNumberModule,
  ],
  templateUrl: './dogs-form.html',
  styleUrls: ['./dogs-form.scss'],
})
export class DogsFormComponent {
  model = input<any>({});

  sexOptions = input<any[]>([]);
  vaxOptions = input<any[]>([]);
  pauraOptions = input<any[]>([]);
  tagliaOptions = input<any[]>([]);
  ownerOptions = input<any[]>([]);

  save = output<any>();

  localModel: any = {};

  constructor() {
    effect(() => {
      this.localModel = { ...this.model() };
    });
  }

  onSubmit() {
    this.save.emit(this.localModel);
  }

  onBeforeInput(e: InputEvent) {
    if (e.data && /\D/.test(e.data)) {
      e.preventDefault();
    }
  }
}
