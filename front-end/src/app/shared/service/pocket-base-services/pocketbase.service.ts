import { Injectable, signal } from '@angular/core';
import PocketBase, { RecordListOptions } from 'pocketbase';
import { environment } from '../../../../environments/environment';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class PocketbaseService {
  readonly pb: PocketBase;
  readonly isAuth = signal<boolean>(false);

  constructor(private messageService: MessageService) {
    this.pb = new PocketBase(environment.pbUrl);

    const authData = localStorage.getItem('pb_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      this.pb.authStore.save(parsed.token, parsed.model);
    }
    
    this.isAuth.set(this.pb.authStore.isValid);

    this.pb.authStore.onChange(() => {
      localStorage.setItem(
        'pb_auth',
        JSON.stringify({
          token: this.pb.authStore.token,
          model: this.pb.authStore.model,
        })
      );
      this.isAuth.set(this.pb.authStore.isValid);
    });
  }

  get baseUrl(): string {
    return this.pb.baseUrl;
  }

  private handleError(contextMsg: string, err: any) {
    console.error(contextMsg, err);

    let detail = 'Si è verificato un errore imprevisto.';
    const originalMsg = err?.message || '';

    // Mappatura errori PocketBase -> Italiano user-friendly
    const lowMsg = originalMsg.toLowerCase();

    if (lowMsg.includes('failed to authenticate')) {
      detail = 'Credenziali non valide o sessione scaduta.';
    } else if (lowMsg.includes('identity or password')) {
      detail = 'Email o password errati.';
    } else if (lowMsg.includes('not found')) {
      detail = 'Risorsa non trovata.';
    } else if (lowMsg.includes('missing or invalid credentials')) {
      detail = 'Accesso negato: credenziali mancanti o non valide.';
    } else if (lowMsg.includes('validation failed')) {
      detail = 'I dati inseriti non sono validi. Controlla i campi e riprova.';
    } else if (lowMsg.includes('failed to create record')) {
      detail = 'Impossibile creare il record. Verifica i dati inseriti.';
    } else if (lowMsg.includes('failed to update record')) {
      detail = 'Impossibile aggiornare il record.';
    } else if (lowMsg.includes('something went wrong')) {
      detail = 'Si è verificato un errore sul server.';
    } else if (err?.status === 0) {
      detail = 'Impossibile connettersi al server. Controlla la tua connessione.';
    } else if (err?.status === 403) {
      detail = 'Non hai i permessi necessari per eseguire questa operazione.';
    } else if (originalMsg) {
      // Se non abbiamo una traduzione specifica, cerchiamo di non mostrare messaggi troppo tecnici
      // ma lasciamo un fallback se utile al debug (facoltativo)
      detail = originalMsg; 
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Errore',
      detail: detail,
      life: 5000,
    });
    throw err;
  }

  async login(email: string, password: string) {
    try {
      const res = await this.pb.collection('users').authWithPassword(email, password);
      localStorage.setItem(
        'pb_auth',
        JSON.stringify({ token: this.pb.authStore.token, model: this.pb.authStore.model })
      );
      return res;
    } catch (err) {
      this.handleError('Errore durante il login:', err);
      throw err;
    }
  }

  logout() {
    this.pb.authStore.clear();
    localStorage.removeItem('pb_auth');
  }

  async getAll<T = any>(collection: string, batch = 200, options: any = {}): Promise<T[]> {
    try {
      return (await this.pb.collection(collection).getFullList({ batch, ...options })) as T[];
    } catch (err) {
      this.handleError(`Errore getAll su ${collection}:`, err);
      throw err;
    }
  }

  async getList<T = any>(collection: string, page = 1, perPage = 20, options?: RecordListOptions): Promise<T[]> {
    try {
      const result = await this.pb.collection(collection).getList(page, perPage, options);
      return result.items as T[];
    } catch (err) {
      this.handleError(`Errore getList su ${collection}:`, err);
      throw err;
    }
  }

  async getOne<T = any>(collection: string, id: string, options: any = {}): Promise<T> {
    try {
      return (await this.pb.collection(collection).getOne(id, options)) as T;
    } catch (err) {
      this.handleError(`Errore recupero record ${id} da ${collection}:`, err);
      throw err;
    }
  }

  async createRecord<T = any>(collection: string, data: any): Promise<T> {
    try {
      return (await this.pb.collection(collection).create(data)) as T;
    } catch (err) {
      this.handleError(`Errore creazione record in ${collection}:`, err);
      throw err;
    }
  }

  async updateRecord<T = any>(collection: string, id: string, data: any): Promise<T> {
    try {
      return (await this.pb.collection(collection).update(id, data)) as T;
    } catch (err) {
      this.handleError(`Errore aggiornamento record ${id} in ${collection}:`, err);
      throw err;
    }
  }

  async deleteRecord(collection: string, id: string): Promise<boolean> {
    try {
      return await this.pb.collection(collection).delete(id);
    } catch (err) {
      this.handleError(`Errore eliminazione record ${id} in ${collection}:`, err);
      throw err;
    }
  }

  async createSignSession(model: any) {
    try {
      const sessionId = crypto.randomUUID();
      const expires_at = new Date(Date.now() + 600000).toISOString();

      return await this.pb.collection('sign_session').create({
        session_id: sessionId,
        model_json: model,
        expires_at,
      });
    } catch (err) {
      this.handleError('Errore creazione sessione firma:', err);
      throw err;
    }
  }

  async getSignSession(sessionId: string) {
    try {
      return await this.pb.collection('sign_session').getFirstListItem(`session_id="${sessionId}"`);
    } catch (err) {
      this.handleError('Errore recupero sessione firma:', err);
      throw err;
    }
  }

  async saveSignature(recordId: string, file: File) {
    try {
      return await this.pb.collection('sign_session').update(recordId, {
        signature: file,
      });
    } catch (err) {
      this.handleError('Errore salvataggio firma:', err);
      throw err;
    }
  }
}
