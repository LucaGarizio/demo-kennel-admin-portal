export type FilterType = 'text' | 'date' | 'select';

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: any[];
}
