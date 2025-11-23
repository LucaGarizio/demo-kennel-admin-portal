export function calculateDailyRate(dogs: any[]): number {
  if (!dogs || dogs.length === 0) return 0;

  const smallCount = dogs.filter((d) => d.taglia === 'Piccola').length;
  const bigCount = dogs.length - smallCount;

  if (dogs.length === 1) {
    return dogs[0].taglia === 'Piccola' ? 15 : 18;
  }

  if (dogs.length === 2) {
    if (smallCount === 2) return 25;
    if (bigCount === 2) return 30;
    return 30;
  }

  const base = smallCount * 15 + bigCount * 18;
  return Math.round(base - base * 0.2);
}

export function calculateTotal(dailyRate: number, start: Date, end: Date): number {
  if (!dailyRate || !start || !end) return 0;

  const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endMid = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  let between = Math.ceil((endMid.getTime() - startMid.getTime()) / 86400000);

  if (between < 0) between = 0;

  let totalDays = 1 + between;

  if (end.getHours() < 12) totalDays -= 1;

  if (totalDays < 1) totalDays = 1;

  return totalDays * dailyRate;
}

export function calculateRemaining(total: number, deposit: number): number {
  const diff = (total || 0) - (deposit || 0);
  return diff < 0 ? 0 : diff;
}
