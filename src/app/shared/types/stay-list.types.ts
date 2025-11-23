export interface StayListRecord {
  id: string;
  owner: string;
  dogs: string;
  area: string;
  box: string;
  arrival_date: string;
  departure_date: string;
  boarding_fee: number;
  deposit: number;
  amount_paid: number;
  outstanding_balance: number;
  total_due: number;
  raw: any;
}

export type StayListRow = StayListRecord['raw'];
