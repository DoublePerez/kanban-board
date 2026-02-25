/**
 * @module utils/colors
 * Color conversion utilities for dynamic theming.
 */

/**
 * Convert a hex color string to an rgba() CSS value.
 * @param hex   - 7-character hex string, e.g. "#34D399"
 * @param alpha - Opacity from 0 (transparent) to 1 (opaque)
 * @returns CSS rgba() string, e.g. "rgba(52,211,153,0.15)"
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
