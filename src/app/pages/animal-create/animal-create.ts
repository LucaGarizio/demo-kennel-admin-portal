import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexFormComponent } from '../../index-form/index-form';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { Router } from '@angular/router';
import { fromBackendOwner, toBackendDog } from '../../shared/utils/owner-mapper';

@Component({
  selector: 'app-animal-create',
  standalone: true,
  imports: [CommonModule, IndexFormComponent],
  templateUrl: './animal-create.html',
  styleUrls: ['./animal-create.scss'],
})
export class AnimalCreateComponent implements OnInit {
  model: any = {};
  tagliaOptions = ['Piccola', 'Media', 'Grande'];
  rettaOptions = [15, 18, 25, 30];
  ownerOptions: any[] = [];
  vaxOptions = ['Si', 'No'];
  pauraOptions = ['Si', 'No'];

  constructor(private pb: PocketbaseService, private router: Router) {}
  async ngOnInit() {
    const owners = await this.pb.getList('owner', 1, 100);
    const mappedOwners = owners.map((o: any) => fromBackendOwner(o));

    this.ownerOptions = mappedOwners.map((o: any) => ({
      id: o.id,
      nomeCompleto: `${o.nome} ${o.cognome}`,
    }));
  }

  async onSubmit(model: any) {
    const payload = toBackendDog(model);
    console.log('Payload corretto inviato a PocketBase:', payload);

    try {
      await this.pb.createRecord('dogs', payload);
      this.router.navigate(['/lista-cani']);
    } catch (err) {
      console.error('Errore creazione cane:', err);
    }
  }
}
