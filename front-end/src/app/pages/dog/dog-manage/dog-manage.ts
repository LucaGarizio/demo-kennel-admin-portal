import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { DogsFormComponent } from '../dog-form/dogs-form';
import { DogService } from '../../../shared/service/dog/dog.service';
import { DogFormModel, OwnerOption } from '../../../shared/types/dog.types';
import { fromBackendDog, fromBackendOwner } from '../../../shared/utils/mapper';
import { PageHeaderComponent } from '../../../shared/component/page-header/page-headercomponent';

@Component({
  selector: 'app-dog-manage',
  standalone: true,
  imports: [CommonModule, DogsFormComponent, PageHeaderComponent],
  templateUrl: './dog-manage.html',
  styleUrls: ['./dog-manage.scss'],
})
export class DogManageComponent implements OnInit {
  id: string | null = null;
  isEdit = signal(false);
  
  model = signal<DogFormModel | null>(null);
  loading = signal(true);

  ownerOptions = signal<OwnerOption[]>([]);

  tagliaOptions = signal(['Piccola', 'Media', 'Grande']);
  sexOptions = signal(['M', 'F']);
  vaxOptions = signal(['Si', 'No']);
  pauraOptions = signal(['Si', 'No']);

  constructor(
    private dogService: DogService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(this.id !== 'creazione' && !!this.id);
    this.id = this.isEdit() ? this.id : null;
    
    try {
      const owners = await this.dogService.loadOwners();
      const mapped = owners.map((o: any) => fromBackendOwner(o));
      this.ownerOptions.set(mapped.map((o: any) => ({
        id: o.id,
        nomeCompleto: `${o.nome} ${o.cognome}`,
      })));
  
      if (this.isEdit() && this.id) {
        await this.loadDog();
      } else {
        this.model.set({
          nome: '',
          sesso: 'M',
          razza: '',
          taglia: 'Media',
          chip: '',
          vax: 'No',
          paura: 'No',
          id_proprietario: null,
          note: '',
        });
        this.loading.set(false);
      }
    } catch(err) {
      console.error(err);
      this.loading.set(false);
    }
  }

  async loadDog() {
    if (!this.id) return;
    try {
      const back = await this.dogService.loadDog(this.id);
      this.model.set(fromBackendDog(back));
    } catch (err) {
      console.error('Errore caricamento cane:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(front: DogFormModel) {
    try {
      if (this.isEdit() && this.id) {
        await this.dogService.updateDog(this.id, front);
      } else {
        await this.dogService.createDog(front);
      }
      this.router.navigate(['/lista-cani']);
    } catch (err) {
      console.error('Errore salvataggio cane:', err);
    }
  }
}
