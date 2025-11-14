import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexFormComponent } from '../../index-form/index-form';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { Router } from '@angular/router';
import { toBackendOwner } from '../../shared/utils/owner-mapper';

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

  // async onSubmit() {
  //   try {
  //     await this.pb.createRecord('owner', this.model);
  //     this.router.navigate(['/owner']);
  //   } catch (err) {
  //     console.error('Errore creazione proprietario:', err);
  //   }
  // }

  async onSubmit(frontModel: any) {
    try {
      const data = toBackendOwner(frontModel);
      console.log('Payload inviato a PocketBase:', data);
      await this.pb.createRecord('owner', data);
      this.router.navigate(['/lista-proprietari']);
    } catch (err: any) {
      console.error('Errore creazione proprietario:', err);
      console.error('Dettagli:', err.response || err.data || err.message);
    }
  }
}
