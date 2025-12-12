import { Injectable } from '@angular/core';
import { PocketbaseService } from '../pocket-base-services/pocketbase.service';
import { StayListRecord, StayListRow } from '../../types/stay-list.types';
import { formatDateTime } from '../../utils/date-utils';

@Injectable({ providedIn: 'root' })
export class StayListService {
  constructor(private pb: PocketbaseService) {}

  private formatPayment(type: string | null | undefined): string {
    return type === 'cash' ? 'Contanti' : type === 'electronic' ? 'Pagamento elettronico' : '';
  }

  getTotal(stays: any[]): number {
    return stays.reduce((sum, s) => sum + (s.total_due || 0), 0);
  }

  async loadStays(filter: string = ''): Promise<StayListRecord[]> {
    const stays = await this.pb.getAll('stays', 200, {
      expand: 'owner_id,dog_ids',
      filter,
    });

    const occs = await this.pb.getAll('occupations', 500, {
      expand: 'dog,box,box.area',
    });

    stays.sort(
      (a: any, b: any) => new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime()
    );

    return stays.map((stay: any) => this.mapStayRecord(stay, occs));
  }

  private mapStayRecord(stay: any, occupations: any[]): StayListRecord {
    const dogs = stay.expand?.dog_ids ?? [];

    const relatedOccs = occupations.filter((o: any) =>
      dogs.some((d: any) => o.expand?.dog?.id === d.id)
    );

    const validOccs = relatedOccs.filter((o: any) => {
      return o.arrival_date <= stay.departure_date && o.departure_date >= stay.arrival_date;
    });

    const areas = Array.from(
      new Set(
        validOccs.map((o: any) => o.expand?.box?.expand?.area?.nome_area).filter((v: any) => !!v)
      )
    );

    // const boxes = Array.from(
    //   new Set(
    //     validOccs
    //       .map((o: any) => o.expand?.box?.numero ?? o.expand?.box?.number)
    //       .filter((v: any) => !!v)
    //   )
    // );
    const boxes = validOccs
      .map((o: any) => o.expand?.box?.numero ?? o.expand?.box?.number)
      .filter((v: any) => !!v);

    return {
      id: stay.id,
      owner: stay.expand?.owner_id
        ? `${stay.expand.owner_id.name} ${stay.expand.owner_id.surname}`
        : '',
      dogs: dogs.map((d: any) => d.name).join(', '),
      area: areas.join(', '),
      box: boxes.join(', '),

      arrival_date: formatDateTime(stay.arrival_date),
      departure_date: formatDateTime(stay.departure_date),
      boarding_fee: stay.boarding_fee,
      deposit: stay.deposit,
      amount_paid: stay.amount_paid,
      outstanding_balance: stay.outstanding_balance,
      total_due: stay.total_due,
      payment_type: this.formatPayment(stay.payment_type),

      raw: stay,
    };
  }

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

  async searchDogsByName(name: string): Promise<string[]> {
    if (!name) return [];

    const dogs = await this.pb.getAll('dogs', 200, {
      filter: `name ~ "${name}"`,
    });

    return dogs.map((d: any) => d.id);
  }
}
