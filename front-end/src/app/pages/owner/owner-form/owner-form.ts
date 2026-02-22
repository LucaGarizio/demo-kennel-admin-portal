import {
  Component,
  ChangeDetectorRef,
  effect,
  input,
  output,
  signal,
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
import { PreviewDialogComponent } from '../../../shared/component/dialogs/preview-dialog/preview-dialog';
import { DocumentsDialogComponent } from '../../../shared/component/dialogs/documents-dialog-component/documents-dialog-component';
import { ConfirmDialogComponent } from '../../../shared/component/dialogs/confirm-dialog/confirm-dialog';
import { TermsConditionsComponent } from '../../../shared/component/terms-conditions/terms-conditions';
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
    DocumentsDialogComponent,
    ConfirmDialogComponent,
    TermsConditionsComponent
  ],
  templateUrl: './owner-form.html',
  styleUrls: ['./owner-form.scss'],
})
export class OwnerFormComponent {
  model = input<any>({});

  save = output<any>();
  filesSelected = output<File[]>();
  deleteDocument = output<string>();

  previewVisible = signal(false);
  today = signal(new Date());
  existingFiles = signal<File[]>([]);
  uploadNeeded = signal(false);
  signatureUrl = signal<string | null>(null);
  displayDate = signal<Date>(new Date());
  showDocsDialog = signal(false);
  currentDocs = signal<string[]>([]);
  confirmVisible = signal(false);
  docToDelete = signal<string | null>(null);

  localModel: any = {};

  constructor(
    private pb: PocketbaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    effect(async () => {
      const parentModel = this.model();
      this.localModel = { ...parentModel };

      if (parentModel?.['signature']) {
        this.signatureUrl.set(this.getFileUrl(parentModel, parentModel['signature']));
      } else {
        this.signatureUrl.set(null);
      }

      if (parentModel?.documents?.length) {
        this.existingFiles.set(await this.loadExistingFiles(parentModel));
      } else {
        this.existingFiles.set([]);
      }

      if (parentModel?.id && parentModel?.created) {
        this.displayDate.set(new Date(parentModel.created));
      } else {
        this.displayDate.set(new Date());
      }
      this.uploadNeeded.set(false);
    });
  }

  getFileUrl(model: any, file: string) {
    if (!model || !file) return '';
    return this.pb.pb.getFileUrl(model, file);
  }

  get firmaUrl(): string | null {
    if (!this.localModel?.id || !this.localModel?.signature) return null;
    return this.pb.pb.getFileUrl(this.localModel, this.localModel.signature);
  }

  async loadExistingFiles(model: any): Promise<File[]> {
    const files: File[] = [];
    for (const name of model.documents) {
      const url = `/api/files/owner/${model.id}/${name}`;
      const blob = await fetch(url).then((r) => r.blob());

      files.push(new File([blob], name, { type: blob.type }));
    }

    return files;
  }

  onFilesPicked(files: File[]) {
    this.filesSelected.emit(files);
    this.uploadNeeded.set(true);
  }

  onDeleteDocument(doc: string) {
    this.deleteDocument.emit(doc);
    this.uploadNeeded.set(false);
  }

  onSubmit() {
    this.save.emit(this.localModel);
  }

  onBeforeInput(e: InputEvent) {
    if (e.data && /\D/.test(e.data)) {
      e.preventDefault();
    }
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

        if (Array.isArray(this.localModel.documents)) {
          this.localModel.documents = this.localModel.documents.filter((d: string) => d !== filename);
        }

        this.deleteDocument.emit(filename);
        this.uploadNeeded.set(false);
      },
      true
    );
  }

  async requestSign() {
    if (!this.localModel.id) {
      const payload = toBackendOwner(this.localModel);

      const fd = new FormData();
      for (const [k, v] of Object.entries(payload)) {
        if (v !== null && v !== undefined) {
          if (k === 'signature') continue;
          fd.append(k, String(v));
        }
      }

      if ((this.localModel as any).accettazione_regolamento !== undefined) {
        fd.append('accettazione_regolamento', String((this.localModel as any).accettazione_regolamento));
      }

      const created = await this.pb.pb.collection('owner').create(fd);
      Object.assign(this.localModel, created);
    }

    const payload = JSON.parse(JSON.stringify(this.localModel));
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

        const updatedOwner = await this.pb.pb.collection('owner').update(this.localModel.id, {
          signature: file,
        });

        this.localModel.signature = updatedOwner['signature'];

        const finalUrl = this.pb.pb.getFileUrl(updatedOwner, updatedOwner['signature']);

        setTimeout(() => {
          this.signatureUrl.set(finalUrl);
          this.cdr.detectChanges();
        }, 0);

        clearInterval(interval);
        await this.pb.pb.collection('sign_session').delete(sessionId);
      } catch (err) {
        console.error('[ERRORE POLLING]', err);
      }
    }, 2000);
  }

  openDocumentsDialog(): void {
    this.currentDocs.set(this.localModel.documents || []);
    this.showDocsDialog.set(true);
  }

  askDeleteDocument(doc: string) {
    this.docToDelete.set(doc);
    this.confirmVisible.set(true);
  }

  onConfirmDelete(result: boolean) {
    if (result && this.docToDelete()) {
      this.onDeleteDocument(this.docToDelete()!);
    }

    this.docToDelete.set(null);
    this.confirmVisible.set(false);
  }

}
