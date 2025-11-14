import { toPocketDate } from './date-utils';

export function toBackendOwner(front: any) {
  return {
    name: front.nome,
    surname: front.cognome,
    place_of_birth: front.luogo_di_nascita,
    birth_date: toPocketDate(front.data_di_nascita),
    province: front.provincia,
    residence: front.residenza,
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

  const required = [
    'nome',
    'razza',
    'taglia',
    'data_arrivo',
    'data_uscita',
    'id_proprietario',
    'retta',
    'chip',
    'vax',
  ];

  for (const field of required) {
    if (!front[field]) {
      throw new Error(`Campo obbligatorio mancante: ${field}`);
    }
  }

  return {
    name: front.nome,
    race: front.razza,
    size: sizeMap[front.taglia],
    arrival_date: toPocketDate(front.data_arrivo),
    departure_date: toPocketDate(front.data_uscita),
    owner_id: front.id_proprietario,
    boarding_fee: front.retta,
    microchip: front.chip,
    vax: front.vax === 'Si',
    scared: front.paura === 'Si' ? true : false,
  };
}

export function fromBackendDog(back: any) {
  return {
    id: back.id,
    nome: back.name,
    razza: back.race,
    taglia: back.size === 'small' ? 'Piccola' : back.size === 'medium' ? 'Media' : 'Grande',
    data_arrivo: new Date(back.arrival_date),
    data_uscita: new Date(back.departure_date),
    id_proprietario: back.owner_id,
    retta: back.boarding_fee,
    chip: back.microchip,
    vax: back.vax ? 'Si' : 'No',
    paura: back.scared ? 'Si' : 'No',
  };
}
