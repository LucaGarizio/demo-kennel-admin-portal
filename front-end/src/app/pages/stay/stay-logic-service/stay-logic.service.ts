import { Injectable } from '@angular/core';
import { StayFormService } from '../../../shared/service/stay-service/stay.service';
import { PocketbaseService } from '../../../shared/service/pocket-base-services/pocketbase.service';

import { normalizeDate, toPocketDateTime, formatDateTime } from '../../../shared/utils/date-utils';
import {
  calculateDailyRate,
  calculateTotal,
  calculateRemaining,
} from '../../../shared/service/stay-service/stay-price.service';
import { StayFormModel, DogOption, BoxOption } from '../../../shared/types/stay.types';

@Injectable({
  providedIn: 'root',
})
export class StayLogicService {
  constructor(private stayForm: StayFormService, private pb: PocketbaseService) {}

  initModel(): StayFormModel {
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
      tipo_pagamento: null,
      note: '',
      ritirato: false,
    };
  }

  async loadAllOptions() {
    const [owners, dogs, areas, boxes] = await Promise.all([
      this.stayForm.loadOwners(),
      this.stayForm.loadDogs(),
      this.stayForm.loadAreas(),
      this.stayForm.loadBoxes(),
    ]);
    return { owners, dogs, areas, boxes };
  }

  updateTotals(model: StayFormModel, allDogs: DogOption[]) {
    const selectedDogs = allDogs.filter((d) => model.id_cani.includes(d.id));
    model.retta = calculateDailyRate(selectedDogs);

    if (model.data_arrivo && model.data_uscita) {
      const start = normalizeDate(model.data_arrivo)!;
      const end = normalizeDate(model.data_uscita)!;
      model.totale_dovuto = calculateTotal(model.retta, start, end);
    }

    model.rimanente = calculateRemaining(
      Number(model.totale_dovuto || 0),
      Number(model.acconto || 0)
    );
  }

  async checkConflicts(model: StayFormModel, allBoxes: BoxOption[], allDogs: DogOption[]) {
    const arrival = normalizeDate(model.data_arrivo);
    const departure = normalizeDate(model.data_uscita);
    if (!arrival || !departure) return null;

    for (const cane of model.cani) {
      if (!cane.id_box) continue;

      const box = allBoxes.find((b) => b.id === cane.id_box);
      const isDouble = box?.double === true;

      const conflicts = await this.pb.getAll('occupations', 200, {
        filter: `
        box = "${cane.id_box}"
        && dog != "${cane.dog_id}"
        && arrival_date <= "${toPocketDateTime(departure)}"
        && departure_date >= "${toPocketDateTime(arrival)}"
      `,
        expand: 'dog',
      });

      if (conflicts.length > 0) {
        const dogInfo = allDogs.find((d) => d.id === cane.dog_id);

        return {
          conflicts,
          hasBlocking: !isDouble || conflicts.length >= 2,
          isDoubleBoxConflict: isDouble && conflicts.length === 1,
          incomingDogName: dogInfo?.nome || 'questo cane',
        };
      }
    }
    return null;
  }

  getConflictDogNames(conflicts: any[]): string {
    if (!conflicts || conflicts.length === 0) return 'Altro cane';
    return conflicts
      .map((o) => o.expand?.dog?.nome || o.expand?.dog?.name)
      .filter(Boolean)
      .join(', ');
  }
}
