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
      if (v !== null && v !== undefined) {
        if (k === 'signature' && typeof v === 'string') continue;
        fd.append(k, String(v));
      }
    }
    for (const f of files) fd.append('documents', f);

    return this.pb.createRecord('owner', fd);
  }

  async updateOwner(id: string, model: OwnerFormModel, newFiles: File[]) {
    const record = await this.pb.pb.collection('owner').getOne(id);

    const fd = new FormData();

    Object.entries(toBackendOwner(model)).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        if (k === 'signature' && typeof v === 'string' && v.startsWith('http')) return;
        fd.append(k, String(v));
      }
    });

    if (Array.isArray(record['documents'])) {
      for (const name of record['documents']) {
        const url = this.pb.pb.getFileUrl(record, name);
        const blob = await fetch(url).then((r) => r.blob());
        fd.append('documents', new File([blob], name, { type: blob.type }));
      }
    }

    for (const f of newFiles) {
      fd.append('documents', f);
    }

    return this.pb.pb.collection('owner').update(id, fd);
  }

  deleteDocument(id: string, documents: string[]) {
    return this.pb.updateRecord('owner', id, { documents });
  }
}
