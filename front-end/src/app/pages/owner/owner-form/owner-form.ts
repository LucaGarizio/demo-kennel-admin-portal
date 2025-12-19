import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
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
import { Router } from '@angular/router';
import { PocketbaseService } from '../../../shared/service/pocket-base-services/pocketbase.service';
import { toBackendOwner } from '../../../shared/utils/mapper';
import { PreviewDialogComponent } from '../../../dialogs/preview-dialog/preview-dialog';
@Component({
  selector: 'app-owner-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    CardModule,
    MultiSelectModule,
    FileUpload,
    HttpClientModule,
    PreviewDialogComponent,
  ],
  templateUrl: './owner-form.html',
  styleUrls: ['./owner-form.scss'],
})
export class OwnerFormComponent implements OnChanges {
  @Input() model: any = {};

  @Output() save = new EventEmitter<any>();
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() deleteDocument = new EventEmitter<string>();

  previewVisible = false;
  today = new Date();
  existingFiles: File[] = [];
  uploadNeeded = false;
  signatureUrl: string | null = null;
  displayDate!: Date;

  constructor(
    private pb: PocketbaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnChanges() {
    if (this.model?.['signature']) {
      this.signatureUrl = this.getFileUrl(this.model, this.model['signature']);
    } else {
      this.signatureUrl = null;
    }

    if (this.model?.documents?.length) {
      this.existingFiles = await this.loadExistingFiles();
    } else {
      this.existingFiles = [];
    }

    if (this.model?.id && this.model?.created) {
      this.displayDate = new Date(this.model.created);
    } else {
      this.displayDate = new Date();
    }
    this.uploadNeeded = false;
  }

  getFileUrl(model: any, file: string) {
    if (!model || !file) return '';
    return this.pb.pb.getFileUrl(model, file);
  }

  get firmaUrl(): string | null {
    if (!this.model?.id || !this.model?.signature) return null;
    return this.pb.pb.getFileUrl(this.model, this.model.signature);
  }

  async loadExistingFiles(): Promise<File[]> {
    const files: File[] = [];
    for (const name of this.model.documents) {
      const url = `/api/files/owner/${this.model.id}/${name}`;
      const blob = await fetch(url).then((r) => r.blob());

      files.push(new File([blob], name, { type: blob.type }));
    }

    return files;
  }

  onFilesPicked(files: File[]) {
    this.filesSelected.emit(files);
    this.uploadNeeded = true;
  }

  onDeleteDocument(doc: string) {
    this.deleteDocument.emit(doc);
    this.uploadNeeded = false;
  }

  onSubmit() {
    this.save.emit(this.model);
  }

  ngAfterViewInit() {
    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement;
        const removeBtn = target.closest('[data-pc-name="pcfileremovebutton"]');
        if (!removeBtn) return;

        const item = removeBtn.closest('.p-fileupload-file');
        const nameEl = item?.querySelector('.p-fileupload-file-name');
        const filename = nameEl?.textContent?.trim();

        if (!filename) return;

        if (Array.isArray(this.model.documents)) {
          this.model.documents = this.model.documents.filter((d: string) => d !== filename);
        }

        this.deleteDocument.emit(filename);
        this.uploadNeeded = false;
      },
      true
    );
  }

  async requestSign() {
    if (!this.model.id) {
      const payload = toBackendOwner(this.model);

      const fd = new FormData();
      for (const [k, v] of Object.entries(payload)) {
        fd.append(k, v ?? '');
      }

      const created = await this.pb.pb.collection('owner').create(fd);
      Object.assign(this.model, created);
    }

    const payload = JSON.parse(JSON.stringify(this.model));
    payload.tempId = payload.tempId ?? crypto.randomUUID();

    const session = await this.pb.pb.collection('sign_session').create({
      session_id: crypto.randomUUID(),
      model_json: payload,
      signature: null,
      stato: 'pending',
    });

    this.startPollingSignature(session.id);
  }

  private startPollingSignature(sessionId: string) {
    const interval = setInterval(async () => {
      try {
        const session = await this.pb.pb.collection('sign_session').getOne(sessionId);
        const sign = session['signature'];

        if (!sign) {
          return;
        }

        const urlSignSession = this.pb.pb.getFileUrl(session, sign);

        const blob = await fetch(urlSignSession).then((r) => r.blob());
        const file = new File([blob], sign, { type: blob.type });

        const updatedOwner = await this.pb.pb.collection('owner').update(this.model.id, {
          signature: file,
        });

        this.model.signature = updatedOwner['signature'];

        const finalUrl = this.pb.pb.getFileUrl(updatedOwner, updatedOwner['signature']);

        setTimeout(() => {
          this.signatureUrl = finalUrl;
          this.cdr.detectChanges();
        }, 0);

        clearInterval(interval);
        await this.pb.pb.collection('sign_session').delete(sessionId);
      } catch (err) {
        console.error('[ERRORE POLLING]', err);
      }
    }, 2000);
  }

  openPreview() {
    this.previewVisible = true;
  }
  closePreview() {
    this.previewVisible = false;
  }
}
