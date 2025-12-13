import { normalizeDate, toPocketDate, toPocketDateTime } from './date-utils';

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
    extra: back.extra || '',
    accettazione_regolamento: back.accettazione_regolamento ?? true,
    documents: back.documents || [],
    signature: back.signature || null,
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
    extra: back.extra || '',
    id_proprietario: back.owner_id,
  };
}

export function toBackendStay(front: any) {
  return {
    owner_id: front.id_proprietario,
    dog_ids: front.id_cani || [],
    area_id: front.area_id || null,
    box_id: front.box_id || null,
    arrival_date: toPocketDateTime(front.data_arrivo),
    departure_date: toPocketDateTime(front.data_uscita),
    boarding_fee: Number(front.retta) || 0,
    deposit: Number(front.acconto) || 0,
    total_due: Number(front.totale_dovuto) || 0,
    outstanding_balance: Number(front.rimanente) || 0,
    notes: front.note || '',
    payment_type: front.tipo_pagamento || null,
  };
}

// export function fromBackendStay(back: any) {
//   return {
//     id: back.id,
//     id_proprietario: back.owner_id,
//     id_cani: back.dog_ids || [],
//     area_id: back.area_id || null,
//     box_id: back.box_id || null,
//     data_arrivo: back.arrival_date ? new Date(back.arrival_date) : null,
//     data_uscita: back.departure_date ? new Date(back.departure_date) : null,
//     retta: back.boarding_fee,
//     acconto: back.deposit,
//     totale_dovuto: back.total_due,
//     rimanente: back.outstanding_balance,
//     note: back.notes || '',
//     tipo_pagamento:
//       back.payment_type === 'Contanti'
//         ? 'cash'
//         : back.payment_type === 'Pagamento elettronico'
//         ? 'electronic'
//         : back.payment_type || null,
//   };
export function fromBackendStay(back: any) {
  return {
    id: back.id,
    id_proprietario: back.owner_id,
    id_cani: back.dog_ids || [],
    area_id: back.area_id || null,
    box_id: back.box_id || null,

    // ⬇️ QUI È IL FIX
    data_arrivo: back.arrival_date ? normalizeDate(back.arrival_date) : null,
    data_uscita: back.departure_date ? normalizeDate(back.departure_date) : null,

    retta: back.boarding_fee,
    acconto: back.deposit,
    totale_dovuto: back.total_due,
    rimanente: back.outstanding_balance,
    note: back.notes || '',
    tipo_pagamento:
      back.payment_type === 'Contanti'
        ? 'cash'
        : back.payment_type === 'Pagamento elettronico'
        ? 'electronic'
        : back.payment_type || null,
  };
}
