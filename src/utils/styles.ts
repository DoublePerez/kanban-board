import { hexToRgba } from "./colors";

/**
 * Priority badge style for task cards (prominent — solid accent for High).
 */
export function getCardPriorityStyle(
  priority: string,
  accent: string,
  selected?: boolean,
): { backgroundColor: string; color: string } | Record<string, never> {
  if (selected === false) return { backgroundColor: "rgba(255,255,255,0.04)", color: "#555" };
  switch (priority) {
    case "High": return { backgroundColor: accent, color: "#000" };
    case "Medium": return { backgroundColor: hexToRgba(accent, 0.15), color: "#bbb" };
    case "Low": return { backgroundColor: hexToRgba(accent, 0.06), color: "#999" };
    default: return {};
  }
}

/**
 * Priority selector style for add-task forms (subtle — tinted for High).
 */
export function getFormPriorityStyle(
  priority: string,
  accent: string,
  selected: boolean,
): { backgroundColor: string; color: string } | Record<string, never> {
  if (!selected) return { backgroundColor: "rgba(255,255,255,0.04)", color: "#555" };
  switch (priority) {
    case "High": return { backgroundColor: hexToRgba(accent, 0.15), color: "#ddd" };
    case "Medium": return { backgroundColor: hexToRgba(accent, 0.08), color: "#bbb" };
    case "Low": return { backgroundColor: hexToRgba(accent, 0.04), color: "#999" };
    default: return {};
  }
}
