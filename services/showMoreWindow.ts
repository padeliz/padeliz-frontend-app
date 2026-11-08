/** Initial visible count and +2 “Show more” windowing for history lists. */
export const SHOW_MORE_INITIAL = 3;
export const SHOW_MORE_STEP = 2;

export function nextShowMoreCount(currentVisible: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(total, currentVisible + SHOW_MORE_STEP);
}

export function showMoreRemaining(visible: number, total: number): number {
  return Math.max(0, total - visible);
}
