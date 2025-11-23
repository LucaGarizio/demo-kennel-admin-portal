import { Injectable } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { DogListRecord, DogListRow } from '../types/dog-list.types';

@Injectable({ providedIn: 'root' })
export class DogListService {
  constructor(private pb: PocketbaseService) {}

  async loadDogs(): Promise<DogListRecord[]> {
    const data = await this.pb.getAll('dogs', 200, {
      expand: 'owner_id',
    });

    data.sort((a: any, b: any) => Date.parse(b.created) - Date.parse(a.created));

    return data.map((r: any) => this.mapDog(r));
  }

  private mapDog(r: any): DogListRecord {
    return {
      id: r.id,
      name: r.name,
      race: r.race,
      sex: r.sex,
      size: r.size === 'small' ? 'Piccola' : r.size === 'medium' ? 'Media' : 'Grande',

      microchip: r.microchip,
      vax: r.vax ? 'Si' : 'No',
      scared: r.scared ? 'Si' : 'No',
      extra: r.extra || '',

      owner_id: r.expand?.owner_id
        ? `${r.expand.owner_id.name} ${r.expand.owner_id.surname}`
        : r.owner_id,

      raw: r,
    };
  }

  async deleteDog(row: DogListRow) {
    await this.pb.deleteRecord('dogs', row.id);
  }
}
