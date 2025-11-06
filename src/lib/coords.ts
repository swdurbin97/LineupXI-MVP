const PITCH_W = 105; // renderer's logical width
const PITCH_H = 68;  // renderer's logical height

function toPctAxis(v: unknown, axisMax: number): number {
  const n = Number(v);
  if (!isFinite(n)) return 0;

  // Normalized 0..1 → percent
  if (n > 0 && n <= 1) return n * 100;

  // Absolute 1..axisMax → percent of logical dim
  if (n > 1 && n <= axisMax) return (n / axisMax) * 100;

  // Otherwise assume already percent (0..100 or >100 if bad data)
  return n;
}

/**
 * Extracts x/y from a slot with robust fallbacks.
 * Critically: detect X and Y formats **independently**.
 * Y is flipped for CSS top-left origin.
 */
export function xyPercent(slot: any): { leftPct: number; topPct: number } {
  // Prefer explicit percent fields first
  const rawX = slot?.x_pct ?? slot?.x ?? slot?.left ?? slot?.cx ?? 0;
  const rawY = slot?.y_pct ?? slot?.y ?? slot?.top  ?? slot?.cy ?? 0;

  const xPct = toPctAxis(rawX, PITCH_W);
  const yPctDataSpace = toPctAxis(rawY, PITCH_H);

  // Flip Y from data space (bottom=0) to CSS (top=0)
  const yPctCss = 100 - yPctDataSpace;

  return { leftPct: xPct, topPct: yPctCss };
}
