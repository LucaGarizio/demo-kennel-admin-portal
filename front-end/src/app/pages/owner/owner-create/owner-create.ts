import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { OwnerFormComponent } from '../owner-form/owner-form';
import { OwnerService } from '../../../shared/service/owner-service/owner-crud.service';
import { OwnerFormModel } from '../../../shared/types/owner.types';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';

@Component({
  selector: 'app-owner-create',
  standalone: true,
  imports: [CommonModule, OwnerFormComponent, PageHeaderComponent],
  templateUrl: './owner-create.html',
  styleUrls: ['./owner-create.scss'],
})
export class OwnerCreateComponent {
  model: OwnerFormModel = {
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
  };

  selectedFiles: File[] = [];

  constructor(private ownerSvc: OwnerService, private router: Router) {}

  onFilesSelected(files: File[]) {
    this.selectedFiles = files;
  }

  async onSubmit(front: OwnerFormModel) {
    try {
      if (front.id) {
        await this.ownerSvc.updateOwner(front.id, front, this.selectedFiles);
      } else {
        await this.ownerSvc.createOwner(front, this.selectedFiles);
      }

      this.router.navigate(['/lista-proprietari']);
    } catch (err) {
      console.error(err);
    }
  }

  async createTempOwner() {
    const result = await this.ownerSvc.createOwner(this.model, []);
    this.model.id = result.id;
  }
}
