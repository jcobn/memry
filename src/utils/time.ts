import { DAY_TO_MILLIS } from "src/Dashboard";

export function daysBetween(a: number, b: number): number {
  const d1 = new Date(a);
  const d2 = new Date(b);

  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  return Math.round((d2.getTime() - d1.getTime()) / DAY_TO_MILLIS);
}

export function daysLate(nextReview: number): number {
  return Math.max(0, daysBetween(nextReview, Date.now()));
}

export function now(): number {
  return Date.now();
}
export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
