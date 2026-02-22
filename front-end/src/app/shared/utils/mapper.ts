import { normalizeDate, toPocketDate, toPocketDateTime } from './date-utils';

export interface OwnerFrontend {
  nome: string;
  cognome: string;
  luogo_di_nascita: string;
  data_di_nascita: string | Date | null;
  provincia: string;
  residenza: string;
  indirizzo: string;
  n_carta_identita: string;
  rilascio_carta: string | Date | null;
  scadenza_carta: string | Date | null;
  codice_fiscale: string;
  cell: string;
  email: string;
  note?: string;
  signature?: any;
}

export interface OwnerBackend {
  id?: string;
  name: string;
  surname: string;
  place_of_birth: string;
  birth_date: string | null | undefined;
  province: string;
  residence: string;
  address: string;
  id_card_number: string;
  id_card_issue_date: string | null | undefined;
  id_card_expiration_date: string | null | undefined;
  tax_code: string;
  phone_number: string;
  email: string;
  notes?: string;
  accettazione_regolamento?: boolean;
  documents?: string[];
  signature?: string | null;
}

export function toBackendOwner(front: Partial<OwnerFrontend>): Partial<OwnerBackend> {
  return {
    name: front.nome,
    surname: front.cognome,
    place_of_birth: front.luogo_di_nascita,
    birth_date: toPocketDate(front.data_di_nascita as string | Date | undefined),
    province: front.provincia,
    residence: front.residenza,
    address: front.indirizzo,
    id_card_number: front.n_carta_identita,
    id_card_issue_date: toPocketDate(front.rilascio_carta as string | Date | undefined),
    id_card_expiration_date: toPocketDate(front.scadenza_carta as string | Date | undefined),
    tax_code: front.codice_fiscale,
    phone_number: front.cell,
    email: front.email,
    notes: front.note || '',
    accettazione_regolamento: (front as any).accettazione_regolamento,
    signature: front.signature || null,
  };
}

export function fromBackendOwner(back: Partial<OwnerBackend>): Partial<OwnerFrontend> & { id?: string; accettazione_regolamento?: boolean; documents?: string[] } {
  return {
    id: back.id,
    nome: back.name,
    cognome: back.surname,
    luogo_di_nascita: back.place_of_birth,
    data_di_nascita: back.birth_date ? new Date(back.birth_date) : null as any,
    provincia: back.province,
    residenza: back.residence,
    indirizzo: back.address,
    n_carta_identita: back.id_card_number,
    rilascio_carta: back.id_card_issue_date ? new Date(back.id_card_issue_date) : null as any,
    scadenza_carta: back.id_card_expiration_date ? new Date(back.id_card_expiration_date) : null as any,
    codice_fiscale: back.tax_code,
    cell: back.phone_number,
    email: back.email,
    note: back.notes || '',
    accettazione_regolamento: back.accettazione_regolamento ?? true,
    documents: back.documents || [],
    signature: back.signature || null,
  };
}

export interface DogFrontend {
  nome: string;
  razza: string;
  sesso: string;
  taglia: string;
  id_proprietario: string | null;
  chip: string;
  vax: string | boolean;
  paura: string | boolean;
  note?: string;
}

export interface DogBackend {
  id?: string;
  name: string;
  race: string;
  sex: string;
  size: string;
  owner_id: string | null | undefined;
  microchip: string;
  vax: boolean;
  scared: boolean;
  notes?: string;
}

export function toBackendDog(front: Partial<DogFrontend>): Partial<DogBackend> {
  const sizeMap: Record<string, string> = {
    Piccola: 'small',
    Media: 'medium',
    Grande: 'big',
  };

  const required = ['nome', 'sesso', 'razza', 'taglia', 'id_proprietario', 'chip', 'vax'];

  for (const field of required) {
    if (!(front as Record<string, any>)[field]) {
      throw new Error(`Campo obbligatorio mancante: ${field}`);
    }
  }

  return {
    name: front.nome,
    race: front.razza,
    sex: front.sesso,
    size: sizeMap[front.taglia as string],
    owner_id: front.id_proprietario,
    microchip: front.chip,
    vax: front.vax === 'Si' || front.vax === true,
    scared: front.paura === 'Si' || front.paura === true,
    notes: front.note || '',
  };
}

export function fromBackendDog(back: Partial<DogBackend>): Partial<DogFrontend> & { id?: string } {
  const taglia: 'Piccola' | 'Media' | 'Grande' =
    back.size === 'small' ? 'Piccola' : back.size === 'medium' ? 'Media' : 'Grande';

  const vax: 'Si' | 'No' = back.vax ? 'Si' : 'No';
  const paura: 'Si' | 'No' = back.scared ? 'Si' : 'No';

  return {
    id: back.id,
    nome: back.name,
    sesso: back.sex,
    razza: back.race,
    taglia,
    chip: back.microchip,
    vax,
    paura,
    note: back.notes || '',
    id_proprietario: back.owner_id,
  };
}

export interface StayFrontend {
  id_proprietario: string | null;
  id_cani: string[];
  area_id?: string | null;
  box_id?: string | null;
  data_arrivo: string | Date;
  data_uscita: string | Date;
  retta: number | string;
  acconto: number | string;
  totale_dovuto: number | string;
  rimanente: number | string;
  note?: string;
  tipo_pagamento?: string;
  ritirato?: boolean;
}

export interface StayBackend {
  id?: string;
  owner_id: string | null | undefined;
  dog_ids: string[];
  area_id?: string | null;
  box_id?: string | null;
  arrival_date: string | null | undefined;
  departure_date: string | null | undefined;
  postpone_at?: string | null;
  boarding_fee: number;
  deposit: number;
  total_due: number;
  outstanding_balance: number;
  notes?: string;
  payment_type?: string | null;
  is_picked_up?: boolean;
}

export function toBackendStay(front: Partial<StayFrontend>): Partial<StayBackend> {
  return {
    owner_id: front.id_proprietario,
    dog_ids: front.id_cani || [],
    area_id: front.area_id || null,
    box_id: front.box_id || null,
    arrival_date: toPocketDateTime(front.data_arrivo as string | Date | undefined),
    departure_date: toPocketDateTime(front.data_uscita as string | Date | undefined),
    boarding_fee: Number(front.retta) || 0,
    deposit: Number(front.acconto) || 0,
    total_due: Number(front.totale_dovuto) || 0,
    outstanding_balance: Number(front.rimanente) || 0,
    notes: front.note || '',
    payment_type: front.tipo_pagamento || null,
    is_picked_up: front.ritirato === true,
  };
}

export function fromBackendStay(back: Partial<StayBackend>): Partial<StayFrontend> & { id?: string; postpone_at?: string | null } {
  return {
    id: back.id,
    id_proprietario: back.owner_id,
    id_cani: back.dog_ids || [],
    area_id: back.area_id || undefined,
    box_id: back.box_id || undefined,
    data_arrivo: back.arrival_date ? normalizeDate(back.arrival_date) : null as any,
    data_uscita: back.departure_date ? normalizeDate(back.departure_date) : null as any,
    postpone_at: back.postpone_at ? back.postpone_at : null,
    retta: back.boarding_fee,
    acconto: back.deposit,
    totale_dovuto: back.total_due,
    rimanente: back.outstanding_balance,
    note: back.notes || '',
    tipo_pagamento:
      back.payment_type === 'cash' || back.payment_type === 'Contante'
        ? 'cash'
        : back.payment_type === 'electronic' || back.payment_type === 'Pagamento elettronico'
        ? 'electronic'
        : back.payment_type || null as any,
    ritirato: back.is_picked_up ?? false,
  };
}
