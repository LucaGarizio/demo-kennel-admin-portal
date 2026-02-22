import { Injectable } from '@angular/core';
import { PocketbaseService } from '../pocket-base-services/pocketbase.service';
import { StayListRecord, StayListRow } from '../../types/stay-list.types';
import { formatDateTime, formatDateIt, formatTime, formatYmdLocal, formatShortDateIt, normalizeDate } from '../../utils/date-utils';
import { StayBackend, DogBackend, OwnerBackend } from '../../utils/mapper';

export interface OccupationBackend {
  id: string;
  arrival_date: string;
  departure_date: string;
  expand?: {
    dog?: DogBackend;
    box?: {
      numero?: string;
      number?: string;
      expand?: {
        area?: {
          nome_area?: string;
        };
      };
    };
  };
}

export type ExpandedStayBackend = StayBackend & {
  expand?: {
    owner_id?: OwnerBackend;
    dog_ids?: DogBackend[];
  }
};

@Injectable({ providedIn: 'root' })
export class StayListService {
  constructor(private pb: PocketbaseService) {}

  private formatPayment(type: string | null | undefined): string {
    return type === 'cash' ? 'Contante' : type === 'electronic' ? 'Pagamento elettronico' : '';
  }

  getTotal(stays: StayListRecord[]): number {
    return stays.reduce((sum, s) => sum + (s.total_due || 0), 0);
  }

  async loadStays(filter: string = ''): Promise<StayListRecord[]> {
    const stays = await this.pb.getAll<ExpandedStayBackend>('stays', 200, {
      expand: 'owner_id,dog_ids',
      filter,
      requestKey: null,
    });

    const occs = await this.pb.getAll<OccupationBackend>('occupations', 500, {
      expand: 'dog,box,box.area',
      requestKey: null,
    });

    stays.sort(
      (a: ExpandedStayBackend, b: ExpandedStayBackend) => 
        new Date(b.arrival_date || 0).getTime() - new Date(a.arrival_date || 0).getTime()
    );

    return stays.map((stay: ExpandedStayBackend) => this.mapStayRecord(stay, occs));
  }

  private mapStayRecord(stay: ExpandedStayBackend, occupations: OccupationBackend[]): StayListRecord {
    const dogs = stay.expand?.dog_ids ?? [];

    const relatedOccs = occupations.filter((o: OccupationBackend) =>
      dogs.some((d: DogBackend) => o.expand?.dog?.id === d.id)
    );

    const validOccs = relatedOccs.filter((o: OccupationBackend) => {
      return o.arrival_date <= (stay.departure_date || '') && o.departure_date >= (stay.arrival_date || '');
    });

    const areas = Array.from(
      new Set(
        validOccs.map((o: OccupationBackend) => o.expand?.box?.expand?.area?.nome_area).filter((v: any) => !!v)
      )
    );

    const boxes = validOccs
      .map((o: OccupationBackend) => o.expand?.box?.numero ?? o.expand?.box?.number)
      .filter((v: any) => !!v);

    const now = new Date();
    const today = formatYmdLocal(now);
    
    const arrivalDate = normalizeDate(stay.arrival_date);
    const isArrivalToday = arrivalDate ? formatYmdLocal(arrivalDate) === today : false;

    const departureDate = normalizeDate(stay.departure_date);
    const isDepartureToday = departureDate ? formatYmdLocal(departureDate) === today : false;

    return {
      id: stay.id!,
      owner: stay.expand?.owner_id
        ? `${stay.expand.owner_id.name} ${stay.expand.owner_id.surname}`
        : '',
      owner_phone: stay.expand?.owner_id?.phone_number || '',
      dogs: dogs.map((d: DogBackend) => d.name).join(', '),
      area: areas.join(', '),
      box: boxes.join(', '),

      arrival_date: formatDateTime(stay.arrival_date as string | Date | null),
      arrival_time: formatTime(stay.arrival_date as string | Date | null),
      departure_date: formatDateTime(stay.departure_date as string | Date | null),
      departure_time: isDepartureToday
        ? formatTime(stay.departure_date as string | Date | null)
        : `${formatShortDateIt(stay.departure_date as string | Date | null)} ${formatTime(stay.departure_date as string | Date | null)}`,
      notes: stay.notes || '',
      boarding_fee: stay.boarding_fee,
      deposit: stay.deposit,
      amount_paid: (stay as any).amount_paid,
      outstanding_balance: stay.outstanding_balance,
      total_due: stay.total_due,
      payment_type: this.formatPayment(stay.payment_type),
      is_picked_up: stay.is_picked_up ? 'Sì' : 'No',
      overdue: !stay.is_picked_up && departureDate ? departureDate < now : false,

      raw: stay,
    };
  }

  private findOccupation(dogId: string, stay: ExpandedStayBackend, occupations: OccupationBackend[]) {
    return occupations.find((o: OccupationBackend) => {
      return (
        o.expand?.dog?.id === dogId &&
        o.arrival_date <= (stay.departure_date || '') &&
        o.departure_date >= (stay.arrival_date || '')
      );
    });
  }

  private extractAreaBox(occ: OccupationBackend) {
    return {
      area: occ.expand?.box?.expand?.area?.nome_area ?? '',
      box: occ.expand?.box?.number ?? '',
    };
  }

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

  async buildFilterClause(filters: Record<string, any>): Promise<string> {
    const clauses: string[] = [];

    const dogClause = await this.buildDogFilter(filters);
    if (dogClause) clauses.push(dogClause);

    const periodClause = this.buildPeriodFilter(filters);
    if (periodClause) clauses.push(periodClause);

    const yearMonthClause = this.buildYearMonthFilter(filters);
    if (yearMonthClause) clauses.push(yearMonthClause);

    const paymentClause = this.buildPaymentFilter(filters);
    if (paymentClause) clauses.push(paymentClause);

    return clauses.join(' && ');
  }

  private async buildDogFilter(filters: Record<string, any>): Promise<string | null> {
    if (!filters['dog_name']) return null;
    const dogIds = await this.searchDogsByName(filters['dog_name']);
    if (dogIds.length === 0) return `dog_ids = ""`;
    const clause = dogIds.map((id) => `dog_ids ?~ "${id}"`).join(' || ');
    return `(${clause})`;
  }

  private buildPeriodFilter(filters: Record<string, any>): string | null {
    const today = new Date().toISOString().split('T')[0];
    switch (filters['period']) {
      case 'arrivi_oggi':
        return `arrival_date ~ "${today}"`;
      case 'uscite_oggi':
        return `departure_date ~ "${today}"`;
      default:
        return null;
    }
  }

  private buildPaymentFilter(filters: Record<string, any>): string | null {
    if (!filters['payment_type'] || filters['payment_type'] === 'all') return null;
    return `payment_type = "${filters['payment_type']}"`;
  }

  private buildYearMonthFilter(filters: Record<string, any>): string | null {
    const year = filters['year'];
    const month = filters['month'];

    if (!year || year === 'all') return null;

    if (!month || month === 'all') {
      return `arrival_date ~ "${year}"`;
    }

    const y = Number(year);
    const m = Number(month) - 1;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    return `(arrival_date >= "${startStr}" && arrival_date <= "${endStr}")`;
  }

  async searchDogsByName(name: string): Promise<string[]> {
    if (!name) return [];

    const dogs = await this.pb.getAll<DogBackend>('dogs', 200, {
      filter: `name ~ "${name}"`,
      requestKey: null,
    });

    return dogs.map((d: DogBackend) => d.id || '');
  }
}
