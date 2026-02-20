import { formatYmdLocal } from '../../../shared/utils/date-utils';

const FIXED_HOLIDAYS = [
  '01-01',
  '01-06',
  '04-25',
  '05-01',
  '06-02',
  '08-15',
  '11-01',
  '12-08',
  '12-25',
  '12-26',
];

const HOLIDAY_NAMES: Record<string, string> = {
  '01-01': 'Capodanno',
  '01-06': 'Epifania',
  '04-25': 'Festa della Liberazione',
  '05-01': 'Festa del Lavoro',
  '06-02': 'Festa della Repubblica',
  '08-15': 'Ferragosto',
  '11-01': 'Ognissanti',
  '12-08': 'Immacolata Concezione',
  '12-25': 'Natale',
  '12-26': 'Santo Stefano',
};

function toMmDdLocal(date: Date): string {
  return formatYmdLocal(date).slice(5, 10);
}

function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function isHoliday(date: Date): boolean {
  if (!(date instanceof Date)) date = new Date(date);

  const mmdd = toMmDdLocal(date);

  if (FIXED_HOLIDAYS.includes(mmdd)) return true;

  const year = date.getFullYear();
  const easter = computeEaster(year);
  if (formatYmdLocal(date) === formatYmdLocal(easter)) return true;

  const pasquetta = new Date(easter);
  pasquetta.setDate(easter.getDate() + 1);
  if (formatYmdLocal(date) === formatYmdLocal(pasquetta)) return true;

  return false;
}

export function getHolidayName(date: Date): string | null {
  if (!(date instanceof Date)) date = new Date(date);

  const mmdd = toMmDdLocal(date);

  if (HOLIDAY_NAMES[mmdd]) {
    return HOLIDAY_NAMES[mmdd];
  }

  const year = date.getFullYear();
  const easter = computeEaster(year);
  if (formatYmdLocal(date) === formatYmdLocal(easter)) {
    return 'Pasqua';
  }

  const pasquetta = new Date(easter);
  pasquetta.setDate(easter.getDate() + 1);
  if (formatYmdLocal(date) === formatYmdLocal(pasquetta)) {
    return 'Pasquetta';
  }

  return null;
}
