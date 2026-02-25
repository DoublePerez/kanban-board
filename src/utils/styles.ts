/**
 * @module utils/styles
 * Dynamic style generators for priority badges.
 * Two variants exist because task cards use bold, prominent badges
 * while the add-task form uses subtle, tinted badges.
 */

import { hexToRgba } from "./colors";

/** CSS properties for a priority badge. */
type BadgeStyle = { backgroundColor: string; color: string };

/**
 * Priority badge style for **task cards** (prominent).
 * - High: solid accent background with dark text
 * - Medium: 15% accent tint
 * - Low: 6% accent tint
 *
 * @param priority - "High" | "Medium" | "Low"
 * @param accent   - Current accent hex color
 * @param selected - When `false`, returns a deselected/muted style
 */
export function getCardPriorityStyle(
  priority: string,
  accent: string,
  selected?: boolean,
): BadgeStyle | Record<string, never> {
  if (selected === false) return { backgroundColor: "rgba(255,255,255,0.04)", color: "#555" };
  switch (priority) {
    case "High": return { backgroundColor: accent, color: "#000" };
    case "Medium": return { backgroundColor: hexToRgba(accent, 0.15), color: "#bbb" };
    case "Low": return { backgroundColor: hexToRgba(accent, 0.06), color: "#999" };
    default: return {};
  }
}

/**
 * Priority badge style for **add-task forms** (subtle).
 * Uses lower opacity values than card badges for a less dominant look.
 *
 * @param priority - "High" | "Medium" | "Low"
 * @param accent   - Current accent hex color
 * @param selected - Whether this priority level is currently selected
 */
export function getFormPriorityStyle(
  priority: string,
  accent: string,
  selected: boolean,
): BadgeStyle | Record<string, never> {
  if (!selected) return { backgroundColor: "rgba(255,255,255,0.04)", color: "#555" };
  switch (priority) {
    case "High": return { backgroundColor: hexToRgba(accent, 0.15), color: "#ddd" };
    case "Medium": return { backgroundColor: hexToRgba(accent, 0.08), color: "#bbb" };
    case "Low": return { backgroundColor: hexToRgba(accent, 0.04), color: "#999" };
    default: return {};
  }
}
