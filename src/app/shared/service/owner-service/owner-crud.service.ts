import { Injectable } from '@angular/core';
import { PocketbaseService } from '../pocket-base-services/pocketbase.service';
import { OwnerFormModel } from '../../types/owner.types';
import { toBackendOwner } from '../../utils/mapper';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  constructor(private pb: PocketbaseService) {}

  loadOwner(id: string) {
    return this.pb.getOne('owner', id);
  }

  // loadOwner(id: string) {
  //   return this.pb.getOne('owner', id, {
  //     fields: '*',
  //   });
  // }

  createOwner(model: OwnerFormModel, files: File[]) {
    const payload = toBackendOwner(model);

    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      fd.append(k, v ?? '');
    }
    for (const f of files) fd.append('documents', f);

    return this.pb.createRecord('owner', fd);
  }

  updateOwner(id: string, model: OwnerFormModel, files: File[]) {
    const payload = toBackendOwner(model);

    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      fd.append(k, v ?? '');
    }
    for (const f of files) fd.append('documents', f);

    return this.pb.updateRecord('owner', id, fd);
  }

  deleteDocument(id: string, documents: string[]) {
    return this.pb.updateRecord('owner', id, { documents });
  }
}
