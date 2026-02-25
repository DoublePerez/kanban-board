/**
 * @module utils/validation
 * Input sanitization and validation for user-provided data.
 * Applied at the boundary between user input and state updates
 * to prevent oversized payloads in localStorage.
 */

import {
  MAX_TASK_TITLE_LENGTH,
  MAX_TASK_DESCRIPTION_LENGTH,
  MAX_PROJECT_NAME_LENGTH,
  MAX_INITIALS_LENGTH,
} from "@/constants";

/** Clamp and trim a task title. Returns empty string if input is blank. */
export function sanitizeTaskTitle(raw: string): string {
  return raw.trim().slice(0, MAX_TASK_TITLE_LENGTH);
}

/** Clamp and trim a task description. */
export function sanitizeTaskDescription(raw: string): string {
  return raw.trim().slice(0, MAX_TASK_DESCRIPTION_LENGTH);
}

/** Clamp and trim a project name. Returns empty string if input is blank. */
export function sanitizeProjectName(raw: string): string {
  return raw.trim().slice(0, MAX_PROJECT_NAME_LENGTH);
}

/** Sanitize initials: uppercase, letters only, max 3 chars. */
export function sanitizeInitials(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, MAX_INITIALS_LENGTH);
}
