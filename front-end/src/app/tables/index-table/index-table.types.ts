export type ColumnType = 'text' | 'currency' | 'date' | 'boolean' | 'documents' | 'signature' | 'link' | 'array_link';

export interface ColumnConfig {
  key: string;
  label: string;
  type?: ColumnType;
  sortable?: boolean;
}
