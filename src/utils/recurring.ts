import { Recurring } from '../types';

export function calcNextDue(recurring: Recurring): string {
  const base = new Date(recurring.nextDue);
  switch (recurring.type) {
    case 'daily': base.setDate(base.getDate() + 1); break;
    case 'weekly': base.setDate(base.getDate() + 7); break;
    case 'monthly': base.setMonth(base.getMonth() + 1); break;
  }
  return base.toISOString().slice(0, 10);
}
