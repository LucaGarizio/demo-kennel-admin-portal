export type KennelRow =
  | { kind: 'month'; label: string }
  | { kind: 'day'; key: string; display: string; date: Date };
