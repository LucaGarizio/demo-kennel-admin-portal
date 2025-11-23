import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IndexFormComponent } from '../../../index-form/index-form';
import { StayFormService } from '../../../shared/service/stay.service';
import { OwnerOption, DogOption, AreaOption, BoxOption } from '../../../shared/types/stay.types';
import { toBackendStay } from '../../../shared/utils/mapper';
import { StayFormModel } from '../../../shared/types/stay.types';
import { PocketbaseService } from '../../../../services/pocketbase.service';
import { normalizeDate } from '../../../shared/utils/date-utils';
import {
  calculateDailyRate,
  calculateTotal,
  calculateRemaining,
} from '../../../shared/service/stay-price.service';

@Component({
  selector: 'app-stay-create',
  standalone: true,
  imports: [CommonModule, IndexFormComponent],
  templateUrl: './stay-create.html',
  styleUrls: ['./stay-create.scss'],
})
export class StayCreateComponent {
  model: StayFormModel = this.initModel();

  ownerOptions: OwnerOption[] = [];
  dogOptions: DogOption[] = [];
  allDogs: DogOption[] = [];

  areaOptions: AreaOption[] = [];
  boxOptions: BoxOption[] = [];
  allBoxes: BoxOption[] = [];

  constructor(
    private stayForm: StayFormService,
    private pb: PocketbaseService,
    private router: Router
  ) {}

  async ngOnInit() {
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

  onOwnerSelected(ownerId: string) {
    this.model.id_proprietario = ownerId;

    this.dogOptions = ownerId ? this.stayForm.filterDogs(ownerId, this.allDogs) : this.allDogs;

    this.model.id_cani = this.model.id_cani.filter((cid) =>
      this.dogOptions.some((d) => d.id === cid)
    );

    this.updateAll();
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

  async onSubmit(frontModel: StayFormModel) {
    const dogId = frontModel.id_cani?.[0];
    const boxId = frontModel.id_box;

    frontModel.data_arrivo = normalizeDate(frontModel.data_arrivo);
    frontModel.data_uscita = normalizeDate(frontModel.data_uscita);

    const payload = toBackendStay(frontModel);
    const stay = await this.pb.createRecord('stays', payload);

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
