import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';

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
    MultiSelectModule,
  ],
  templateUrl: './index-form.html',
  styleUrls: ['./index-form.scss'],
})
export class IndexFormComponent {
  @Input() type: 'owner' | 'dogs' | 'stay' = 'owner';
  @Input() model: any = {};
  @Input() vaxOptions: any[] = [];
  @Input() pauraOptions: any[] = [];
  @Input() sexOptions: any[] = [];
  @Input() tagliaOptions: any[] = [];
  @Input() rettaOptions: any[] = [];
  @Input() ownerOptions: any[] = [];
  @Input() dogOptions: any[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() ownerChange = new EventEmitter<string>();
  @Output() filesSelected = new EventEmitter<File[]>();

  onFilesSelected(event: any) {
    const fileList = event.target.files as FileList;
    const files: File[] = fileList ? Array.from(fileList) : [];
    this.filesSelected.emit(files);
  }

  onSubmit() {
    this.save.emit(this.model);
  }
}
