import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IndexFormComponent } from '../../../index-form/index-form';
import { OwnerService } from '../../../shared/service/owner.service';
import { OwnerFormModel } from '../../../shared/types/owner.types';

@Component({
  selector: 'app-owner-create',
  standalone: true,
  imports: [CommonModule, IndexFormComponent],
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
    extra: '',
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
      await this.ownerSvc.createOwner(front, this.selectedFiles);
      this.router.navigate(['/lista-proprietari']);
    } catch (err: any) {
      console.error(err);
    }
  }
}
