export type KennelRow =
  | { kind: 'month'; key: string; label: string }
  | { kind: 'day'; key: string; display: string; date: Date; monthKey: string };
