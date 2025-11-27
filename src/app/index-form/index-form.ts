import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUpload } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';

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
    FileUpload,
    HttpClientModule,
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
  @Input() areaOptions: any[] = [];
  @Input() boxOptions: any[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() ownerChange = new EventEmitter<string>();
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() deleteDocument = new EventEmitter<string>();
  @Output() areaChange = new EventEmitter<{ index: number; area: string | null }>();
  @Output() boxChange = new EventEmitter<{ index: number; box: string | null }>();

  @Output() dogsChange = new EventEmitter<string[]>();
  @Output() arrivalChange = new EventEmitter<Date>();
  @Output() departureChange = new EventEmitter<Date>();
  @Output() depositChange = new EventEmitter<void>();

  existingFiles: File[] = [];
  private previousDocs: string[] = [];
  uploadNeeded = false;

  async ngOnChanges() {
    if (this.model?.documents?.length) {
      this.existingFiles = await this.loadExistingFiles();
      this.uploadNeeded = false;
    } else {
      this.uploadNeeded = false;
    }

    this.previousDocs = [...(this.model?.documents ?? [])];
  }

  onFilesPicked(files: File[]) {
    this.filesSelected.emit(files);
    this.uploadNeeded = true;
  }

  onDeleteDocument(doc: string) {
    this.deleteDocument.emit(doc);
    this.uploadNeeded = false;
  }

  async loadExistingFiles(): Promise<File[]> {
    const result: File[] = [];
    for (const name of this.model.documents) {
      const url = `/api/files/owner/${this.model.id}/${name}`;
      const blob = await fetch(url).then((r) => r.blob());
      const file = new File([blob], name, { type: blob.type });
      result.push(file);
    }
    return result;
  }

  onSubmit() {
    this.save.emit(this.model);
  }

  getUrl(name: string) {
    return `/api/files/owner/${this.model.id}/${name}`;
  }

  ngAfterViewInit() {
    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement;

        const removeBtn = target.closest('[data-pc-name="pcfileremovebutton"]');
        if (removeBtn) {
          const fileItem = removeBtn.closest('.p-fileupload-file');
          const nameEl = fileItem?.querySelector('.p-fileupload-file-name');
          const filename = nameEl?.textContent?.trim();
          if (!filename) return;
          if (Array.isArray(this.model.documents)) {
            this.model.documents = this.model.documents.filter((d: string) => d !== filename);
          }
          this.deleteDocument.emit(filename);
          this.uploadNeeded = false;
        }
      },
      true
    );
  }

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
}
