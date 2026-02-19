import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { OwnerFormComponent } from '../owner-form/owner-form';
import { OwnerService } from '../../../shared/service/owner-service/owner-crud.service';
import { OwnerFormModel } from '../../../shared/types/owner.types';
import { fromBackendOwner } from '../../../shared/utils/mapper';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';

@Component({
  selector: 'app-owner-manage',
  standalone: true,
  imports: [CommonModule, OwnerFormComponent, PageHeaderComponent],
  templateUrl: './owner-manage.html',
  styleUrls: ['./owner-manage.scss'],
})
export class OwnerManageComponent implements OnInit {
  id: string | null = null;
  isEdit = signal(false);

  model = signal<OwnerFormModel | null>(null);
  selectedFiles = signal<File[]>([]);
  loading = signal(true);

  constructor(
    private ownerSvc: OwnerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(this.id !== 'creazione' && !!this.id);
    this.id = this.isEdit() ? this.id : null;

    if (this.isEdit() && this.id) {
        await this.loadOwner();
    } else {
        this.model.set({
          nome: '',
          cognome: '',
          luogo_di_nascita: '',
          data_di_nascita: null,
          provincia: '',
          residenza: '',
          indirizzo: '',
          n_carta_identita: '',
          rilascio_carta: null,
          scadenza_carta: null,
          codice_fiscale: '',
          cell: '',
          email: '',
          note: '',
          accettazione_regolamento: true,
          documents: [],
        });
        this.loading.set(false);
    }
  }

  async loadOwner() {
    try {
      if (!this.id) return;
      const back = await this.ownerSvc.loadOwner(this.id);
      this.model.set({ ...back, ...fromBackendOwner(back) });
    } catch (err) {
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  onFilesSelected(files: File[]) {
    this.selectedFiles.set(files);
  }

  async onSubmit(front: OwnerFormModel) {
    try {
      if (this.isEdit() && this.id) {
          await this.ownerSvc.updateOwner(this.id, front, this.selectedFiles());
      } else {
          await this.ownerSvc.createOwner(front, this.selectedFiles());
      }
      this.router.navigate(['/lista-proprietari']);
    } catch (err) {
      console.error(err);
    }
  }

  async createTempOwner() {
    if (this.isEdit()) return;
    const result = await this.ownerSvc.createOwner(this.model() as OwnerFormModel, []);
    this.model.update(m => m ? ({ ...m, id: result.id }) : null);
  }

  async onDeleteDoc(filename: string) {
    const currentModel = this.model();
    if (!currentModel || !this.id) return;
    const updated = currentModel.documents.filter((d) => d !== filename);
    await this.ownerSvc.deleteDocument(this.id, updated);
    this.model.update(m => m ? { ...m, documents: updated } : null);
  }
}
