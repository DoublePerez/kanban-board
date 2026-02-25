import { MONTH_ABBREVS } from "@/constants";

export function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${MONTH_ABBREVS[d.getMonth()]} ${d.getDate()}`;
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}

export function daysOverdue(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntil(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
