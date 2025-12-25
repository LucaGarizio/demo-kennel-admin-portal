export const DOG_LIST_COLUMNS = [
  'name',
  'race',
  'sex',
  'size',
  'microchip',
  'vax',
  'scared',
  'notes',
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
  notes: 'Note',
  owner_id: 'Proprietario',
};
