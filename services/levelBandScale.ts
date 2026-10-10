import type { Level } from '@/types/api';

export type BandScaleSegment = {
  id_level: number;
  /** Short label under the segment, e.g. "Low". */
  label: string;
  /** Full band name, e.g. "Division 3 Low". */
  name: string;
  levelMin: number;
  levelMax: number;
};

/** Highest decimal part inside a division (axis runs N.99 -> N.00). */
const DIVISION_SPAN = 0.99;

/** "Division 3 Mid" -> 3. Returns null when no number can be parsed. */
export function parseDivisionNumber(bandName: string | null | undefined): number | null {
  if (!bandName) return null;
  const match = bandName.match(/\d+/);
  if (!match) return null;
  const value = Number.parseInt(match[0], 10);
  return Number.isFinite(value) ? value : null;
}

/** "Division 3 Mid" -> "Mid" (last word of the name). */
export function bandSegmentLabel(bandName: string): string {
  const words = bandName.trim().split(/\s+/);
  return words[words.length - 1] ?? bandName;
}

/**
 * Segments of the division family that `bandName` belongs to, ordered along the
 * inverted axis (strongest numbers first: Low -> Mid -> High).
 */
export function divisionSegments(
  bandName: string | null | undefined,
  levels: Level[] | null | undefined
): BandScaleSegment[] {
  const division = parseDivisionNumber(bandName);
  if (division === null || !levels) return [];

  return levels
    .filter((l) => parseDivisionNumber(l.name) === division)
    .map((l) => ({
      id_level: l.id_level,
      label: bandSegmentLabel(l.name),
      name: l.name,
      levelMin: Number(l.level_min),
      levelMax: Number(l.level_max),
    }))
    .filter((s) => Number.isFinite(s.levelMin) && Number.isFinite(s.levelMax))
    .sort((a, b) => b.levelMin - a.levelMin);
}

/**
 * Pointer position on the inverted axis as a 0..1 fraction:
 * N.99 -> 0 (left, Low) ... N.00 -> 1 (right, High).
 */
export function pointerFraction(
  bandName: string | null | undefined,
  level: string | number
): number | null {
  const division = parseDivisionNumber(bandName);
  const value = typeof level === 'number' ? level : Number.parseFloat(level);
  if (division === null || !Number.isFinite(value)) return null;

  const fraction = (division + DIVISION_SPAN - value) / DIVISION_SPAN;
  return Math.min(1, Math.max(0, fraction));
}
