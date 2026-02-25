/**
 * @module utils/dates
 * Date comparison and formatting helpers for task due dates.
 * All functions parse ISO date strings (YYYY-MM-DD) at midnight local time
 * to avoid timezone-induced off-by-one errors.
 */

/** Abbreviated month names for display formatting. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format an ISO date string as "Mon DD" (e.g. "Feb 24").
 * @param dateStr - ISO date string, e.g. "2026-02-24"
 */
export function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Check whether a due date has passed (strictly before today).
 * Returns false if dateStr is null (no deadline = never overdue).
 */
export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}

/**
 * Number of full days a task is past its due date.
 * Returns 0 if the task is due today, negative if not yet due.
 */
export function daysOverdue(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Number of full days until a task's due date.
 * Returns 0 if due today, negative if already past.
 */
export function daysUntil(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
