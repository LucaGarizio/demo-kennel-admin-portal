import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DogsFormComponent } from '../dogs-form/dogs-form';
import { DogService } from '../../../shared/service/dog/dog.service';
import { DogFormModel, OwnerOption } from '../../../shared/types/dog.types';
import { fromBackendOwner } from '../../../shared/utils/mapper';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';

@Component({
  selector: 'app-dog-create',
  standalone: true,
  imports: [CommonModule, DogsFormComponent, PageHeaderComponent],
  templateUrl: './dog-create.html',
  styleUrls: ['./dog-create.scss'],
})
export class DogCreateComponent implements OnInit {
  model: DogFormModel = {
    nome: '',
    sesso: 'M',
    razza: '',
    taglia: 'Media',
    chip: '',
    vax: 'No',
    paura: 'No',
    id_proprietario: null,
    note: '',
  };

  ownerOptions: OwnerOption[] = [];

  tagliaOptions = ['Piccola', 'Media', 'Grande'];
  sexOptions = ['M', 'F'];
  vaxOptions = ['Si', 'No'];
  pauraOptions = ['Si', 'No'];

  constructor(private dogService: DogService, private router: Router) {}

  async ngOnInit() {
    const owners = await this.dogService.loadOwners();
    const mapped = owners.map((o: any) => fromBackendOwner(o));
    this.ownerOptions = mapped.map((o: any) => ({
      id: o.id,
      nomeCompleto: `${o.nome} ${o.cognome}`,
    }));
  }

  async onSubmit(model: DogFormModel) {
    try {
      await this.dogService.createDog(model);
      this.router.navigate(['/lista-cani']);
    } catch (err) {
      console.error('Errore creazione cane:', err);
    }
  }
}
