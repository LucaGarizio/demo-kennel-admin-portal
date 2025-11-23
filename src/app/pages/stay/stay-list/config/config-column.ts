export const STAY_LIST_COLUMNS = [
  'owner',
  'dogs',
  'area',
  'box',
  'arrival_date',
  'departure_date',
  'boarding_fee',
  'deposit',
  'outstanding_balance',
  'total_due',
] as const;

export const STAY_LIST_LABELS: Record<string, string> = {
  owner: 'Proprietario',
  dogs: 'Cani',
  area: 'Area',
  box: 'Box',
  arrival_date: 'Arrivo',
  departure_date: 'Uscita',
  boarding_fee: 'Retta',
  deposit: 'Acconto',
  outstanding_balance: 'Saldo residuo',
  total_due: 'Totale da pagare',
};
