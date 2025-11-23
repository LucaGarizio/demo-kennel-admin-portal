export interface DogFormModel {
  id?: string;
  nome: string;
  sesso: 'M' | 'F';
  razza: string;
  taglia: 'Piccola' | 'Media' | 'Grande' | string;
  chip: string;
  vax: 'Si' | 'No';
  paura: 'Si' | 'No';
  id_proprietario: string | null;
  extra: string;
}

export interface OwnerOption {
  id: string;
  nomeCompleto: string;
}
