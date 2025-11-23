export interface OwnerListRecord {
  id: string;

  name: string;
  surname: string;
  place_of_birth: string;
  birth_date: string;
  province: string;
  residence: string;
  address: string;
  id_card_number: string;
  id_card_issue_date: string;
  id_card_expiration_date: string;
  tax_code: string;
  phone_number: string;
  email: string;
  documents: string[];
  raw: any;
}

export type OwnerListRow = OwnerListRecord['raw'];
