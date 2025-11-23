import { Injectable } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';

import { OwnerOption, DogOption, AreaOption, BoxOption } from '../types/stay.types';

@Injectable({ providedIn: 'root' })
export class StayFormService {
  constructor(private pb: PocketbaseService) {}

  async loadOwners(): Promise<OwnerOption[]> {
    const owners = await this.pb.getAll('owner', 200);
    return owners.map((o: any) => ({
      id: o.id,
      nomeCompleto: `${o.name} ${o.surname}`,
    }));
  }

  async loadDogs(): Promise<DogOption[]> {
    const dogs = await this.pb.getAll('dogs', 200);
    return dogs.map((d: any) => ({
      id: d.id,
      nome: d.name,
      owner_id: d.owner_id,
    }));
  }

  async loadAreas(): Promise<AreaOption[]> {
    const areas = await this.pb.getAll('area', 200);
    return areas.map((a: any) => ({
      id: a.id,
      nome_area: a.nome_area ?? a.name ?? 'Area',
    }));
  }

  async loadBoxes(): Promise<BoxOption[]> {
    const boxes = await this.pb.getAll('box', 200, { expand: 'area' });
    return boxes.map((b: any) => ({
      id: b.id,
      numero: b.number,
      area_id: b.expand?.area?.id || null,
      double: b.double,
    }));
  }

  filterDogs(ownerId: string, allDogs: DogOption[]): DogOption[] {
    return allDogs.filter((d) => d.owner_id === ownerId);
  }

  filterBoxes(areaId: string, allBoxes: BoxOption[]): BoxOption[] {
    return allBoxes.filter((b) => b.area_id === areaId);
  }
}
