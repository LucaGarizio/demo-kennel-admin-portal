export interface OwnerFormModel {
  id?: string;

  nome: string;
  cognome: string;
  luogo_di_nascita: string;
  data_di_nascita: Date | null;
  provincia: string;
  residenza: string;
  indirizzo: string;
  n_carta_identita: string;
  rilascio_carta: Date | null;
  scadenza_carta: Date | null;
  codice_fiscale: string;
  cell: string;
  email: string;

  note: string;
  accettazione_regolamento: boolean;

  documents: string[];
}

export interface OwnerDocument {
  file: File;
}
