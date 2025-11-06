import { valuesOf, findIn } from './collections';

export type FormationLike = {
  code?: string;        // e.g., '3-1-4-2'
  key?: string;         // alt key if present
  id?: string;          // sometimes used
  name?: string;        // '3-1-4-2'
  slots?: any[];        // must exist for a valid formation
  slot_map?: any[];     // alternative name for slots
};

/** Normalize input like '3142' or '3-1-4-2' → canonical hyphenated */
export function normalizeFormationKey(input?: string): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim();
  if (!s) return undefined;
  // already hyphenated
  if (s.includes('-')) return s;
  // if only digits like '442', '3142', try to hyphenate by common patterns
  // we try longest-first split patterns seen in app: 3|1|4|2, 4|4|2, 4|2|3|1 etc.
  const digits = s.replace(/\D/g, '');
  if (!digits) return s;

  const patterns = [
    [1,1,1,1,1], // fallback: '53210' → '5-3-2-1-0'
    [1,1,1,1],   // '3142' -> '3-1-4-2'
    [1,1,1],     // '442'  -> '4-4-2'
  ];
  for (const pat of patterns) {
    if (pat.reduce((a,b)=>a+b,0) === digits.length) {
      let i = 0;
      const parts = pat.map(len => digits.slice(i, i+=len));
      return parts.join('-');
    }
  }
  return s;
}

export function variantsFor(code?: string): string[] {
  const hyph = normalizeFormationKey(code);
  const compact = (hyph || '').replace(/-/g, '');
  const uniq = Array.from(new Set([code ?? '', hyph ?? '', compact].filter(Boolean)));
  return uniq;
}

/** Resolve a formation object from any collection (Array/Object/Map/Ref). */
export function resolveFormation(formationsAny: any, codeMaybe: string | undefined): FormationLike | undefined {
  const variants = variantsFor(codeMaybe);
  const items = valuesOf<FormationLike>(formationsAny);

  // Helper to check if a formation has valid slots
  const hasSlots = (f: FormationLike | undefined) => {
    if (!f) return false;
    return (f.slots?.length ?? 0) > 0 || (f.slot_map?.length ?? 0) > 0;
  };

  // 1) Try matching by .code exactly (hyphenated), then .code without hyphens
  for (const v of variants) {
    const byCode = findIn(items, f => f?.code === v || f?.code === normalizeFormationKey(v));
    if (hasSlots(byCode)) return byCode;
  }

  // 2) Try .key / .id / .name with variants
  for (const v of variants) {
    const match = findIn(items, f =>
      f?.key === v || f?.id === v || f?.name === v ||
      f?.key === normalizeFormationKey(v) || f?.name === normalizeFormationKey(v)
    );
    if (hasSlots(match)) return match;
  }

  // 3) As a last resort, if the collection itself is a dictionary keyed by hyphen code
  if (formationsAny && typeof formationsAny === 'object' && !Array.isArray(formationsAny)) {
    for (const v of variants) {
      const k = normalizeFormationKey(v);
      const cand = formationsAny[v] ?? (k ? formationsAny[k] : undefined);
      if (hasSlots(cand)) return cand;
    }
  }

  return undefined;
}
