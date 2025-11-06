export type RawSlot = any;

export type NormSlot = {
  id: string;                  // unique, stable key used by UI state
  expectedPos: string;         // PositionCode
  x: number;                   // normalized or raw
  y: number;
  // keep a reference to original
  _raw?: RawSlot;
};

function first<T>(...vals: (T | undefined | null)[]): T | undefined {
  return vals.find(v => v !== undefined && v !== null);
}

/**
 * Accepts formation.slot structures with varied shapes:
 * - { id, expectedPos, x, y }
 * - { id, pos, x, y }
 * - { slotId, role, x_pct, y_pct }
 * - { key, position, x, y }
 * - etc.
 */
export function normalizeSlot(raw: RawSlot, idx: number): NormSlot | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = String(
    first(
      raw.id,
      raw.slotId,
      raw.slot_id,
      raw.key,
      raw.name,          // some seeds used 'name' as id
      raw.uid,
      `slot_${idx}`      // last-resort fallback (should not happen in prod)
    )
  );

  const expectedPos = String(
    first(
      raw.expectedPos,
      raw.pos,
      raw.position,
      raw.role,
      raw.slot_code,     // common in our data
      raw.expected,      // older seed name
      raw.code           // sometimes the slot stored pos code in 'code'
    )
  ).toUpperCase();

  const x = Number(first(raw.x, raw.x_pct, raw.left, raw.cx, 0));
  const y = Number(first(raw.y, raw.y_pct, raw.top,  raw.cy, 0));

  if (!id || !expectedPos) return null;

  return { id, expectedPos, x, y, _raw: raw };
}

/** Get normalized slots from a formation with 'slots' or 'slot_map' shapes */
export function getNormalizedSlots(formation: any): NormSlot[] {
  const rawList = (formation?.slots ?? formation?.slot_map ?? []) as RawSlot[];
  return rawList
    .map((raw, idx) => normalizeSlot(raw, idx))
    .filter(Boolean) as NormSlot[];
}
