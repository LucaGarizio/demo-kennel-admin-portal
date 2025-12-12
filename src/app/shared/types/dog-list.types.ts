export interface DogListRecord {
  id: string;
  name: string;
  race: string;
  sex: 'M' | 'F';
  size: 'Piccola' | 'Media' | 'Grande';
  microchip: string;
  vax: 'Si' | 'No';
  scared: 'Si' | 'No';
  extra: string;
  owner_id: string;
  raw: any;
}

export type DogListRow = DogListRecord['raw'];
