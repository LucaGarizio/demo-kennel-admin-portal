import { Injectable } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { StayListRecord, StayListRow } from '../types/stay-list.types';
import { formatDateTime } from '../utils/date-utils';

@Injectable({ providedIn: 'root' })
export class StayListService {
  constructor(private pb: PocketbaseService) {}

  /** ============================
   *  CARICA TUTTI GLI STAY + OCCUPATIONS
   * ============================ */
  async loadStays(): Promise<StayListRecord[]> {
    const [stays, occs] = await Promise.all([
      this.pb.getAll('stays', 200, {
        expand: 'owner_id,dog_ids',
      }),
      this.pb.getAll('occupations', 500, {
        expand: 'dog,box,box.area',
      }),
    ]);

    stays.sort(
      (a: any, b: any) => new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime()
    );

    return stays.map((stay: any) => this.mapStayRecord(stay, occs));
  }

  /** ============================ */
  private mapStayRecord(stay: any, occupations: any[]): StayListRecord {
    const dogs = stay.expand?.dog_ids ?? [];
    const dog = dogs[0];

    const occ = dog ? this.findOccupation(dog.id, stay, occupations) : null;

    const { area, box } = occ ? this.extractAreaBox(occ) : { area: '', box: '' };

    return {
      id: stay.id,
      owner: stay.expand?.owner_id
        ? `${stay.expand.owner_id.name} ${stay.expand.owner_id.surname}`
        : '',
      dogs: dogs.map((d: any) => d.name).join(', '),
      area,
      box,
      arrival_date: formatDateTime(stay.arrival_date),
      departure_date: formatDateTime(stay.departure_date),
      boarding_fee: stay.boarding_fee,
      deposit: stay.deposit,
      amount_paid: stay.amount_paid,
      outstanding_balance: stay.outstanding_balance,
      total_due: stay.total_due,
      raw: stay,
    };
  }

  /** ============================ */
  private findOccupation(dogId: string, stay: any, occupations: any[]) {
    return occupations.find((o: any) => {
      return (
        o.expand?.dog?.id === dogId &&
        o.arrival_date <= stay.departure_date &&
        o.departure_date >= stay.arrival_date
      );
    });
  }

  /** ============================ */
  private extractAreaBox(occ: any) {
    return {
      area: occ.expand?.box?.expand?.area?.nome_area ?? '',
      box: occ.expand?.box?.number ?? '',
    };
  }

  /** ============================
   * DELETE STAY + OCCUPATION
   * ============================ */
  async deleteStayAndOccupation(stay: StayListRow): Promise<void> {
    const dog = stay.expand?.dog_ids?.[0];
    if (!dog) return;

    const arr = stay.arrival_date;
    const dep = stay.departure_date;

    const filter = `
      dog = "${dog.id}" &&
      arrival_date <= "${dep}" &&
      departure_date >= "${arr}"
    `;

    const occList = await this.pb.getAll('occupations', 100, { filter });
    for (const occ of occList) await this.pb.deleteRecord('occupations', occ.id);

    await this.pb.deleteRecord('stays', stay.id);
  }
}
