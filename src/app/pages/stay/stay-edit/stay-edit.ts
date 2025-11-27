import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IndexFormComponent } from '../../../index-form/index-form';
import { StayFormService } from '../../../shared/service/stay.service';

import {
  StayFormModel,
  OwnerOption,
  DogOption,
  AreaOption,
  BoxOption,
} from '../../../shared/types/stay.types';

import { fromBackendStay, toBackendStay } from '../../../shared/utils/mapper';
import { PocketbaseService } from '../../../../services/pocketbase.service';

import {
  calculateDailyRate,
  calculateTotal,
  calculateRemaining,
} from '../../../shared/service/stay-price.service';

import { normalizeDate } from '../../../shared/utils/date-utils';

@Component({
  selector: 'app-stay-edit',
  standalone: true,
  imports: [CommonModule, IndexFormComponent],
  templateUrl: './stay-edit.html',
  styleUrls: ['./stay-edit.scss'],
})
export class StayEditComponent {
  id!: string;
  model: StayFormModel = this.initModel();
  ownerOptions: OwnerOption[] = [];
  dogOptions: DogOption[] = [];
  allDogs: DogOption[] = [];
  areaOptions: AreaOption[] = [];
  boxOptions: BoxOption[] = [];
  allBoxes: BoxOption[] = [];
  existingOccupation: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pb: PocketbaseService,
    private stayForm: StayFormService
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;

    const [owners, dogs, areas, boxes] = await Promise.all([
      this.stayForm.loadOwners(),
      this.stayForm.loadDogs(),
      this.stayForm.loadAreas(),
      this.stayForm.loadBoxes(),
    ]);

    this.ownerOptions = owners;
    this.allDogs = dogs;
    this.dogOptions = dogs;
    this.areaOptions = areas;
    this.allBoxes = boxes;
    this.boxOptions = boxes;

    await this.loadStay();
  }

  private initModel(): StayFormModel {
    return {
      id_proprietario: null,
      id_cani: [],
      cani: [],
      data_arrivo: null,
      data_uscita: null,
      retta: 0,
      acconto: 0,
      rimanente: 0,
      totale_dovuto: 0,
      note: '',
    };
  }

  async loadStay() {
    const stay = await this.pb.getOne('stays', this.id, {
      expand: 'owner_id,dog_ids',
    });

    const stayModel = fromBackendStay(stay);
    const dogIds = stayModel.id_cani;

    const occupations = await this.pb.getAll('occupations', 200, {
      expand: 'dog,box,box.area',
      filter: dogIds.map((id: string) => `dog="${id}"`).join(' || '),
    });

    this.existingOccupation = occupations;
    const cani = dogIds.map((cid: string) => {
      const occ = occupations.find((o) => o.expand?.['dog']?.id === cid);

      const id_area = occ?.expand?.['box']?.expand?.area?.id ?? null;
      const id_box = occ?.expand?.['box']?.id ?? null;

      return {
        dog_id: cid,
        id_area,
        id_box,
        boxOptions: id_area ? this.stayForm.filterBoxes(id_area, this.allBoxes) : [],
      };
    });

    // 🔥 5. Assembla il model completo
    this.model = {
      id_proprietario: stayModel.id_proprietario,
      id_cani: dogIds,
      cani,

      data_arrivo: stayModel.data_arrivo,
      data_uscita: stayModel.data_uscita,

      retta: stayModel.retta,
      acconto: stayModel.acconto,
      rimanente: stayModel.rimanente,
      totale_dovuto: stayModel.totale_dovuto,

      note: stayModel.note,
    };

    this.onOwnerSelected(this.model.id_proprietario!);
    this.updateAll();
  }

  onOwnerSelected(ownerId: string) {
    this.model.id_proprietario = ownerId;
    this.dogOptions = ownerId ? this.stayForm.filterDogs(ownerId, this.allDogs) : this.allDogs;

    this.model.id_cani = this.model.id_cani.filter((cid) =>
      this.dogOptions.some((d) => d.id === cid)
    );

    this.updateAll();
  }

  onAreaSelected(e: { index: number; area: string | null }) {
    const { index, area } = e;
    this.model.cani[index].id_area = area;
    const filtered = area ? this.stayForm.filterBoxes(area, this.allBoxes) : [];
    this.model.cani[index].boxOptions = filtered;
    if (!filtered.some((b) => b.id === this.model.cani[index].id_box)) {
      this.model.cani[index].id_box = null;
    }
  }

  onBoxSelected(e: { index: number; box: string | null }) {
    const { index, box } = e;
    this.model.cani[index].id_box = box;
  }

  onDogsChanged() {
    this.updateAll();
  }

  onArrivalDateChange() {
    this.updateAll();
  }

  onDepartureDateChange() {
    this.updateAll();
  }

  onDepositChange() {
    this.model.rimanente = calculateRemaining(
      Number(this.model.totale_dovuto || 0),
      Number(this.model.acconto || 0)
    );
  }

  private updateAll() {
    const dogs = this.allDogs.filter((d) => this.model.id_cani.includes(d.id));
    this.model.retta = calculateDailyRate(dogs);

    if (this.model.data_arrivo && this.model.data_uscita) {
      const start = normalizeDate(this.model.data_arrivo)!;
      const end = normalizeDate(this.model.data_uscita)!;
      this.model.totale_dovuto = calculateTotal(this.model.retta, start, end);
    }

    this.model.rimanente = calculateRemaining(
      Number(this.model.totale_dovuto || 0),
      Number(this.model.acconto || 0)
    );
  }

  async onSubmit(frontModel: StayFormModel) {
    frontModel.data_arrivo = normalizeDate(frontModel.data_arrivo);
    frontModel.data_uscita = normalizeDate(frontModel.data_uscita);
    const payload = toBackendStay(frontModel);
    await this.pb.updateRecord('stays', this.id, payload);
    for (const occ of this.existingOccupation) {
      await this.pb.deleteRecord('occupations', occ.id);
    }

    for (const entry of frontModel.cani) {
      if (!entry.id_area || !entry.id_box) continue;

      await this.pb.createRecord('occupations', {
        dog: entry.dog_id,
        box: entry.id_box,
        area: entry.id_area,
        arrival_date: frontModel.data_arrivo,
        departure_date: frontModel.data_uscita,
        stay: this.id,
      });
    }

    this.router.navigate(['/lista-soggiorni']);
  }
}
