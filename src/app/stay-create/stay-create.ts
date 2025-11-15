// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IndexFormComponent } from '../index-form/index-form';
// import { PocketbaseService } from '../../services/pocketbase.service';
// import { Router } from '@angular/router';
// import { toBackendStay } from '../shared/utils/mapper';

// @Component({
//   selector: 'app-stay-create',
//   standalone: true,
//   imports: [CommonModule, IndexFormComponent],
//   templateUrl: './stay-create.html',
//   styleUrls: ['./stay-create.scss'],
// })
// export class StayCreateComponent {
//   model: any = {};

//   ownerOptions: any[] = [];
//   dogOptions: any[] = [];

//   constructor(private pb: PocketbaseService, private router: Router) {}

//   async ngOnInit() {
//     const owners = await this.pb.getAll('owner', 200);
//     this.ownerOptions = owners.map((o: any) => ({
//       id: o.id,
//       nomeCompleto: `${o.name} ${o.surname}`,
//     }));

//     const dogs = await this.pb.getAll('dogs', 200);
//     this.dogOptions = dogs.map((d: any) => ({
//       id: d.id,
//       name: d.name,
//     }));
//   }

//   async onSubmit(frontModel: any) {
//     try {
//       const payload = toBackendStay(frontModel);
//       await this.pb.createRecord('stays', payload);
//       this.router.navigate(['/lista-soggiorni']);
//     } catch (err: any) {
//       console.error('Errore creazione soggiorno:', err);
//     }
//   }
// }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexFormComponent } from '../index-form/index-form';
import { PocketbaseService } from '../../services/pocketbase.service';
import { Router } from '@angular/router';
import { toBackendStay } from '../shared/utils/mapper';

@Component({
  selector: 'app-stay-create',
  standalone: true,
  imports: [CommonModule, IndexFormComponent],
  templateUrl: './stay-create.html',
  styleUrls: ['./stay-create.scss'],
})
export class StayCreateComponent {
  model: any = {};

  ownerOptions: any[] = [];
  dogOptions: any[] = [];

  private allDogs: any[] = [];

  constructor(private pb: PocketbaseService, private router: Router) {}

  async ngOnInit() {
    await this.loadOwners();
    await this.loadDogs();
  }

  private async loadOwners() {
    const owners = await this.pb.getAll('owner', 200);
    this.ownerOptions = owners.map((o: any) => ({
      id: o.id,
      nomeCompleto: `${o.name} ${o.surname}`,
    }));
  }

  private async loadDogs() {
    const dogs = await this.pb.getAll('dogs', 200);

    this.allDogs = dogs.map((d: any) => ({
      id: d.id,
      name: d.name,
      owner_id: d.owner_id,
    }));
    this.dogOptions = [...this.allDogs];
  }

  onOwnerSelected(ownerId: string) {
    if (!ownerId) {
      this.dogOptions = [...this.allDogs];
      return;
    }

    this.dogOptions = this.allDogs.filter((d) => d.owner_id === ownerId);

    if (this.model.dog_ids) {
      this.model.dog_ids = this.model.dog_ids.filter((id: string) =>
        this.dogOptions.some((d) => d.id === id)
      );
    }
  }

  async onSubmit(frontModel: any) {
    try {
      const payload = toBackendStay(frontModel);
      await this.pb.createRecord('stays', payload);
      this.router.navigate(['/lista-soggiorni']);
    } catch (err: any) {
      console.error('Errore creazione soggiorno:', err);
    }
  }
}
