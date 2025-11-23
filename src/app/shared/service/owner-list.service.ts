import { Injectable } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { OwnerListRecord, OwnerListRow } from '../types/owner-list.types';
import { formatDateIt } from '../utils/date-utils';

@Injectable({ providedIn: 'root' })
export class OwnerListService {
  constructor(private pb: PocketbaseService) {}

  /** ===============================
   * Carica tutti i proprietari
   * =============================== */
  async loadOwners(): Promise<OwnerListRecord[]> {
    const data = await this.pb.getAll('owner');
    data.sort((a: any, b: any) => Date.parse(b.created) - Date.parse(a.created));

    return data.map((r: any) => this.mapOwner(r));
  }

  /** ===============================
   * Carica singolo proprietario
   * =============================== */
  async loadOwner(id: string): Promise<OwnerListRecord> {
    const record = await this.pb.getRecord('owner', id);
    return this.mapOwner(record);
  }

  /** =============================== */
  private mapOwner(r: any): OwnerListRecord {
    return {
      id: r.id,
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
      documents: r.documents || [],
      raw: r,
    };
  }

  /** ===============================
   * Elimina proprietario + suoi cani
   * =============================== */
  async deleteOwnerAndDogs(owner: OwnerListRow) {
    const dogs = await this.pb.getList('dogs', 1, 200, {
      filter: `owner_id="${owner.id}"`,
    });

    for (const d of dogs) await this.pb.deleteRecord('dogs', d.id);
    await this.pb.deleteRecord('owner', owner.id);
  }
}
