import { Injectable } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { DogFormModel } from '../types/dog.types';
import { toBackendDog } from '../utils/mapper';

@Injectable({ providedIn: 'root' })
export class DogService {
  constructor(private pb: PocketbaseService) {}

  loadOwners() {
    return this.pb.getAll('owner', 200);
  }

  loadDog(id: string) {
    return this.pb.getOne('dogs', id);
  }

  createDog(model: DogFormModel) {
    const payload = toBackendDog(model);
    return this.pb.createRecord('dogs', payload);
  }

  updateDog(id: string, model: DogFormModel) {
    const payload = toBackendDog(model);
    return this.pb.updateRecord('dogs', id, payload);
  }
}
