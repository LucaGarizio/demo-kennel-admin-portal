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
      id_area: null,
      id_box: null,
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
    const dogId = stayModel.id_cani?.[0];
    if (!dogId) return;

    const occupations = await this.pb.getAll('occupations', 200, {
      expand: 'dog,box,box.area',
      filter: `dog="${dogId}"`,
    });

    const occ = occupations.find((o: any) => {
      const oArr = o['arrival_date'];
      const oDep = o['departure_date'];
      const sArr = stay['arrival_date'];
      const sDep = stay['departure_date'];
      return oArr <= sDep && oDep >= sArr;
    });

    this.existingOccupation = occ || null;

    const boxExpand = occ?.expand?.['box'];
    const areaExpand = boxExpand?.expand?.['area'];

    this.model = {
      id_proprietario: stayModel.id_proprietario,
      id_cani: stayModel.id_cani,
      id_area: areaExpand?.id || null,
      id_box: occ ? occ['box'] : null,
      data_arrivo: stayModel.data_arrivo,
      data_uscita: stayModel.data_uscita,
      retta: stayModel.retta,
      acconto: stayModel.acconto,
      rimanente: stayModel.rimanente,
      totale_dovuto: stayModel.totale_dovuto,
      note: stayModel.note,
    };

    this.onOwnerSelected(this.model.id_proprietario!);

    if (this.model.id_area) {
      this.onAreaSelected(this.model.id_area);
    }

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

  onAreaSelected(areaId: string) {
    this.model.id_area = areaId;
    this.boxOptions = this.stayForm.filterBoxes(areaId, this.allBoxes);

    if (!this.boxOptions.some((b) => b.id === this.model.id_box)) {
      this.model.id_box = null;
    }
  }

  onBoxSelected(boxId: string) {
    this.model.id_box = boxId;
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
    const dogId = frontModel.id_cani?.[0];
    const boxId = frontModel.id_box;

    const payload = toBackendStay(frontModel);
    await this.pb.updateRecord('stays', this.id, payload);

    if (this.existingOccupation) {
      await this.pb.deleteRecord('occupations', this.existingOccupation.id);
    }

    const fullBox = await this.pb.getOne('box', boxId!, { expand: 'area' });
    const areaId = fullBox.expand?.['area']?.id;

    await this.pb.createRecord('occupations', {
      dog: dogId,
      box: boxId,
      area: areaId,
      arrival_date: frontModel.data_arrivo,
      departure_date: frontModel.data_uscita,
    });

    this.router.navigate(['/lista-soggiorni']);
  }
}
