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

  createOwner(model: OwnerFormModel, files: File[]) {
    const payload = toBackendOwner(model);

    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      fd.append(k, v !== null && v !== undefined ? String(v) : '');
    }
    for (const f of files) fd.append('documents', f);

    return this.pb.createRecord('owner', fd);
  }

  updateOwner(id: string, model: OwnerFormModel, files: File[]) {
    const payload = toBackendOwner(model);
    if (!files || files.length === 0) {
      return this.pb.updateRecord('owner', id, payload);
    }
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      fd.append(k, v !== null && v !== undefined ? String(v) : '');
    }
    for (const f of files) fd.append('documents', f);
    console.log('OWNER EXTRA:', model.note);

    return this.pb.updateRecord('owner', id, fd);
  }

  deleteDocument(id: string, documents: string[]) {
    return this.pb.updateRecord('owner', id, { documents });
  }
}
