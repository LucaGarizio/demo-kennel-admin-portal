import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { DogsFormComponent } from '../dog-form/dogs-form'; // ⬅️ nuovo import
import { DogService } from '../../../shared/service/dog/dog.service';
import { DogFormModel, OwnerOption } from '../../../shared/types/dog.types';
import { fromBackendDog, fromBackendOwner } from '../../../shared/utils/mapper';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';

@Component({
  selector: 'app-dog-edit',
  standalone: true,
  imports: [CommonModule, DogsFormComponent, PageHeaderComponent],
  templateUrl: './dog-edit.html',
  styleUrls: ['./dog-edit.scss'],
})
export class DogEditComponent {
  id!: string;
  model!: DogFormModel;
  loading = true;

  ownerOptions: OwnerOption[] = [];

  tagliaOptions = ['Piccola', 'Media', 'Grande'];
  sexOptions = ['M', 'F'];
  vaxOptions = ['Si', 'No'];
  pauraOptions = ['Si', 'No'];

  constructor(
    private dogService: DogService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;

    const owners = await this.dogService.loadOwners();
    const mapped = owners.map((o: any) => fromBackendOwner(o));
    this.ownerOptions = mapped.map((o: any) => ({
      id: o.id,
      nomeCompleto: `${o.nome} ${o.cognome}`,
    }));

    await this.loadDog();
  }

  async loadDog() {
    try {
      const back = await this.dogService.loadDog(this.id);
      this.model = fromBackendDog(back);
      this.loading = false;
    } catch (err) {
      console.error('Errore caricamento cane:', err);
    }
  }

  async onSubmit(front: DogFormModel) {
    try {
      await this.dogService.updateDog(this.id, front);
      this.router.navigate(['/lista-cani']);
    } catch (err) {
      console.error('Errore update dog:', err);
    }
  }
}
