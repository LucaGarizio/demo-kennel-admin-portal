export interface Owner {
  id: string;
  name: string;
  surname: string;
}

export interface Dog {
  id: string;
  nome: string;
  owner_id: string;
}

export interface Area {
  id: string;
  nome_area: string;
}

export interface Box {
  id: string;
  numero: string;
  area_id: string | null;
  double: boolean;

  expand?: {
    area?: Area;
  };
}

export interface Occupation {
  id: string;
  dog: string;
  box: string;
  area: string;
  arrival_date: string;
  departure_date: string;

  expand?: {
    dog?: Dog;
    box?: {
      id: string;
      number: string;
      expand?: {
        area?: Area;
      };
    };
  };
}

export interface Stay {
  id: string;
  owner_id: string;
  dog_ids: string[];
  arrival_date: string;
  departure_date: string;
  postpone_at?: string | null;
  reminder?: boolean | null;

  boarding_fee: number;
  deposit: number;
  outstanding_balance: number;
  total_due: number;
  payment_type?: string;
  notes?: string;

  expand?: {
    owner_id?: Owner;
    dog_ids?: Dog[];
  };
}

export interface StayFormModel {
  id_proprietario: string | null;
  id_cani: string[];

  cani: {
    dog_id: string;
    id_area: string | null;
    id_box: string | null;
    boxOptions: BoxOption[];
  }[];

  data_arrivo: Date | null;
  data_uscita: Date | null;

  retta: number | null;
  acconto: number | null;
  rimanente: number | null;
  totale_dovuto: number | null;

  tipo_pagamento: string | null;

  note: string;
  ritirato: boolean;
}

export interface OwnerOption {
  id: string;
  nomeCompleto: string;
}

export interface DogOption {
  id: string;
  nome: string;
  owner_id: string;
}

export interface AreaOption {
  id: string;
  nome_area: string;
}

export interface BoxOption {
  id: string;
  numero: string;
  area_id: string | null;
  double: boolean;
  covered: boolean;
}
