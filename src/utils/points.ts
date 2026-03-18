import { Priority } from '../types';

export const POINTS: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 5,
};

export function getPoints(priority: Priority): number {
  return POINTS[priority];
}
