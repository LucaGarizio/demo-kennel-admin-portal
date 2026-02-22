import { Injectable } from '@angular/core';
import { PocketbaseService } from '../pocket-base-services/pocketbase.service';
import { OwnerListRecord, OwnerListRow } from '../../types/owner-list.types';
import { formatDateIt } from '../../utils/date-utils';
import { OwnerBackend } from '../../utils/mapper';

@Injectable({ providedIn: 'root' })
export class OwnerListService {
  constructor(private pb: PocketbaseService) {}

  async loadOwners(filter: string = ''): Promise<OwnerListRecord[]> {
    const data = await this.pb.getAll<OwnerBackend>('owner', 200, { filter });

    data.sort((a, b) => {
      const dateA = (a as any).created ? Date.parse((a as any).created) : 0;
      const dateB = (b as any).created ? Date.parse((b as any).created) : 0;
      return dateB - dateA;
    });

    return data.map((r) => this.mapOwner(r));
  }

  async loadOwner(id: string): Promise<OwnerListRecord> {
    const record = await this.pb.getOne<OwnerBackend>('owner', id);
    return this.mapOwner(record);
  }

  private mapOwner(r: OwnerBackend): OwnerListRecord {
    return {
      id: r.id || '',
      name: r.name,
      surname: r.surname,
      place_of_birth: r.place_of_birth,
      birth_date: formatDateIt(r.birth_date),
      province: r.province,
      residence: r.residence,
      address: r.address,
      id_card_number: r.id_card_number,
      id_card_issue_date: formatDateIt(r.id_card_issue_date),
      id_card_expiration_date: formatDateIt(r.id_card_expiration_date),
      tax_code: r.tax_code,
      phone_number: r.phone_number,
      email: r.email,
      notes: r.notes || null,
      documents: r.documents || [],
      signature: r.signature || null,
      raw: r,
    };
  }

  async deleteOwnerAndDogs(owner: OwnerListRow) {
    const dogs = await this.pb.getList('dogs', 1, 200, {
      filter: `owner_id="${owner.id}"`,
    });

    for (const d of dogs) await this.pb.deleteRecord('dogs', d.id);
    await this.pb.deleteRecord('owner', owner.id);
  }
}
