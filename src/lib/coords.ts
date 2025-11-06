export function asPercent(v: unknown, fallback = 0): number {
  const n = Number(v);
  if (!isFinite(n)) return fallback;
  // If value looks like 0..1, treat as normalized and scale to percent
  if (n > 0 && n <= 1) return n * 100;
  // Otherwise assume it's already a percentage in 0..100 space (some seeds use 0..100)
  return n;
}

/** Pick x/y from slot with robust fallbacks and convert to percent space */
export function xyPercent(slot: any): { leftPct: number; topPct: number } {
  // Strongly prefer *_pct when present
  const x = slot?.x_pct ?? slot?.x ?? slot?.left ?? slot?.cx ?? 0;
  const y = slot?.y_pct ?? slot?.y ?? slot?.top  ?? slot?.cy ?? 0;
  return { leftPct: asPercent(x, 0), topPct: asPercent(y, 0) };
}
