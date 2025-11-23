export const DOG_LIST_COLUMNS = [
  'name',
  'race',
  'sex',
  'size',
  'microchip',
  'vax',
  'scared',
  'extra',
  'owner_id',
] as const;

export const DOG_LIST_LABELS: Record<string, string> = {
  name: 'Nome',
  race: 'Razza',
  sex: 'Sesso',
  size: 'Taglia',
  microchip: 'Microchip',
  vax: 'Vaccinato',
  scared: 'Spaventato',
  extra: 'Extra',
  owner_id: 'Proprietario',
};
