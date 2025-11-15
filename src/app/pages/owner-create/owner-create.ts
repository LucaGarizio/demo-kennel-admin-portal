import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexFormComponent } from '../../index-form/index-form';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { Router } from '@angular/router';
import { toBackendOwner } from '../../shared/utils/mapper';

@Component({
  selector: 'app-owner-create',
  standalone: true,
  imports: [CommonModule, IndexFormComponent],
  templateUrl: './owner-create.html',
  styleUrls: ['./owner-create.scss'],
})
export class OwnerCreateComponent {
  model: any = {};

  constructor(private pb: PocketbaseService, private router: Router) {}

  selectedFiles: File[] = [];

  onFilesSelected(files: File[]) {
    this.selectedFiles = files;
  }

  async onSubmit(frontModel: any) {
    try {
      const payload = toBackendOwner(frontModel);

      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        formData.append(key, value ?? '');
      }

      for (const file of this.selectedFiles) {
        formData.append('documents', file);
      }
      await this.pb.createRecord('owner', formData);

      this.router.navigate(['/lista-proprietari']);
    } catch (err: any) {
      console.error('Errore creazione proprietario:', err);
      console.error('Dettagli:', err.response || err.data || err.message);
    }
  }
}
