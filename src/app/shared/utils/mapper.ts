import { toPocketDate } from './date-utils';

export function toBackendOwner(front: any) {
  return {
    name: front.nome,
    surname: front.cognome,
    place_of_birth: front.luogo_di_nascita,
    birth_date: toPocketDate(front.data_di_nascita),
    province: front.provincia,
    residence: front.residenza,
    address: front.indirizzo,
    id_card_number: front.n_carta_identita,
    id_card_issue_date: toPocketDate(front.rilascio_carta),
    id_card_expiration_date: toPocketDate(front.scadenza_carta),
    tax_code: front.codice_fiscale,
    phone_number: front.cell,
    email: front.email,
  };
}

export function fromBackendOwner(back: any) {
  return {
    id: back.id,
    nome: back.name,
    cognome: back.surname,
    luogo_di_nascita: back.place_of_birth,
    data_di_nascita: back.birth_date ? new Date(back.birth_date) : null,
    provincia: back.province,
    residenza: back.residence,
    indirizzo: back.address,
    n_carta_identita: back.id_card_number,
    rilascio_carta: back.id_card_issue_date ? new Date(back.id_card_issue_date) : null,
    scadenza_carta: back.id_card_expiration_date ? new Date(back.id_card_expiration_date) : null,
    codice_fiscale: back.tax_code,
    cell: back.phone_number,
    email: back.email,
  };
}

export function toBackendDog(front: any) {
  const sizeMap: Record<string, string> = {
    Piccola: 'small',
    Media: 'medium',
    Grande: 'big',
  };

  const required = ['nome', 'sesso', 'razza', 'taglia', 'id_proprietario', 'chip', 'vax'];

  for (const field of required) {
    if (!front[field]) {
      throw new Error(`Campo obbligatorio mancante: ${field}`);
    }
  }

  return {
    name: front.nome,
    race: front.razza,
    sex: front.sesso,
    size: sizeMap[front.taglia],
    owner_id: front.id_proprietario,
    microchip: front.chip,
    vax: front.vax === 'Si',
    scared: front.paura === 'Si' ? true : false,
    extra: front.extra || '',
  };
}

export function fromBackendDog(back: any) {
  return {
    id: back.id,
    nome: back.name,
    sesso: back.sex,
    razza: back.race,
    taglia: back.size === 'small' ? 'Piccola' : back.size === 'medium' ? 'Media' : 'Grande',
    chip: back.microchip,
    vax: back.vax ? 'Si' : 'No',
    paura: back.scared ? 'Si' : 'No',
    extra: back.extra || '',
  };
}

export function toBackendStay(front: any) {
  return {
    owner_id: front.owner_id,
    dog_ids: front.dog_ids || [],
    area_id: front.area_id || null,
    box_id: front.box_id || null,
    arrival_date: toPocketDate(front.arrival_date),
    departure_date: toPocketDate(front.departure_date),
    boarding_fee: Number(front.boarding_fee) || 0,
    deposit: Number(front.deposit) || 0,
    amount_paid: Number(front.amount_paid) || 0,
    total_due: Number(front.total_due) || 0,
    outstanding_balance: Number(front.outstanding_balance) || 0,
    notes: front.notes || '',
  };
}

export function fromBackendStay(back: any) {
  return {
    id: back.id,
    owner_id: back.owner_id,
    dog_ids: back.dog_ids || [],
    area_id: back.area_id || null,
    box_id: back.box_id || null,
    arrival_date: back.arrival_date ? new Date(back.arrival_date) : null,
    departure_date: back.departure_date ? new Date(back.departure_date) : null,
    boarding_fee: back.boarding_fee,
    deposit: back.deposit,
    amount_paid: back.amount_paid,
    total_due: back.total_due,
    outstanding_balance: back.outstanding_balance,
    notes: back.notes || '',
  };
}
