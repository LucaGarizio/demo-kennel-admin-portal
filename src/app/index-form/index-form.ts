import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-index-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    CardModule,
  ],
  templateUrl: './index-form.html',
  styleUrls: ['./index-form.scss'],
})
export class IndexFormComponent {
  @Input() type: 'owner' | 'dogs' = 'owner';
  @Input() model: any = {};
  @Input() vaxOptions: any[] = [];
  @Input() pauraOptions: any[] = [];
  @Input() tagliaOptions: any[] = [];
  @Input() rettaOptions: any[] = [];
  @Input() ownerOptions: any[] = [];
  @Output() save = new EventEmitter<any>();

  onSubmit() {
    this.save.emit(this.model);
  }
}
