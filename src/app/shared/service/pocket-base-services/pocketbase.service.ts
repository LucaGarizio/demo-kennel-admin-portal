import { Injectable } from '@angular/core';
import PocketBase, { RecordListOptions } from 'pocketbase';

@Injectable({ providedIn: 'root' })
export class PocketbaseService {
  readonly pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:8090');

    const authData = localStorage.getItem('pb_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      this.pb.authStore.save(parsed.token, parsed.model);
    }

    this.pb.authStore.onChange(() => {
      localStorage.setItem(
        'pb_auth',
        JSON.stringify({
          token: this.pb.authStore.token,
          model: this.pb.authStore.model,
        })
      );
    });
  }

  get isAuth() {
    return this.pb.authStore.isValid;
  }

  async login(email: string, password: string) {
    const res = await this.pb.collection('users').authWithPassword(email, password);
    localStorage.setItem(
      'pb_auth',
      JSON.stringify({ token: this.pb.authStore.token, model: this.pb.authStore.model })
    );
    return res;
  }

  logout() {
    this.pb.authStore.clear();
    localStorage.removeItem('pb_auth');
  }

  async getAll(collection: string, batch = 200, options: any = {}) {
    return await this.pb.collection(collection).getFullList({ batch, ...options });
  }

  async getOne(collection: string, id: string, options: any = {}) {
    try {
      return await this.pb.collection(collection).getOne(id, options);
    } catch (err) {
      console.error(`Errore getOne su ${collection}:`, err);
      throw err;
    }
  }

  async getList(collection: string, page = 1, perPage = 20, options?: RecordListOptions) {
    const result = await this.pb.collection(collection).getList(page, perPage, options);
    return result.items;
  }

  async createRecord(collection: string, data: any) {
    return await this.pb.collection(collection).create(data);
  }

  async updateRecord(collection: string, id: string, data: any) {
    return await this.pb.collection(collection).update(id, data);
  }

  async deleteRecord(collection: string, id: string) {
    return await this.pb.collection(collection).delete(id);
  }

  async getRecord(collection: string, id: string) {
    try {
      return await this.pb.collection(collection).getOne(id);
    } catch (err) {
      console.error(`Errore nel recupero record ${id} da ${collection}:`, err);
      throw err;
    }
  }

  async getById(collection: string, id: string, options: any = {}) {
    try {
      return await this.pb.collection(collection).getOne(id, options);
    } catch (err) {
      console.error(`Errore getById su ${collection}:`, err);
      throw err;
    }
  }

  // SIGNATURE
  // --- SESSIONE FIRMA --- //

  async createSignSession(model: any) {
    const sessionId = crypto.randomUUID();

    const expires_at = new Date(Date.now() + 600000).toISOString();

    return await this.pb.collection('sign_session').create({
      session_id: sessionId,
      model_json: model,
      expires_at,
    });
  }

  async getSignSession(sessionId: string) {
    const res = await this.pb.collection('sign_session').getFirstListItem(`
    session_id="${sessionId}"
  `);
    return res;
  }

  async saveSignature(recordId: string, file: File) {
    return await this.pb.collection('sign_session').update(recordId, {
      signature: file,
    });
  }
}
