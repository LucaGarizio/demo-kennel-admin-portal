export type FilterType = 'text' | 'date' | 'select';

export interface FilterConfig {
  key: string; // es: "data_arrivo"
  label: string; // es: "Data Arrivo"
  type: FilterType; // es: "date"
  options?: any[]; // solo per select
}
