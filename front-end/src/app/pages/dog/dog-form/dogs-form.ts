import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() model: any = {};

  @Input() sexOptions: any[] = [];
  @Input() vaxOptions: any[] = [];
  @Input() pauraOptions: any[] = [];
  @Input() tagliaOptions: any[] = [];
  @Input() ownerOptions: any[] = [];

  @Output() save = new EventEmitter<any>();

  onSubmit() {
    this.save.emit(this.model);
  }

  onBeforeInput(e: InputEvent) {
    if (e.data && /\D/.test(e.data)) {
      e.preventDefault();
    }
  }
}
