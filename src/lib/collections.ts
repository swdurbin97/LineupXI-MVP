export type AnyCollection<T> =
  | T[]
  | ReadonlyArray<T>
  | Record<string, T>
  | Map<string, T>
  | Set<T>
  | { current?: any }  // React ref wrapper
  | undefined
  | null;

function unwrapRef<T>(col: AnyCollection<T>): any {
  if (!col) return undefined;
  return (typeof col === 'object' && col !== null && 'current' in col)
    ? (col as any).current
    : col;
}

export function valuesOf<T>(col: AnyCollection<T>): T[] {
  const raw = unwrapRef<T>(col);
  if (!raw) return [];

  if (Array.isArray(raw)) return raw as T[];

  if (raw instanceof Map) return Array.from(raw.values()) as T[];
  if (raw instanceof Set) return Array.from(raw.values()) as T[];

  if (typeof raw === 'object') {
    // plain object dictionary
    return Object.values(raw) as T[];
  }
  return [];
}

export function findIn<T>(col: AnyCollection<T>, pred: (x: T) => boolean): T | undefined {
  const arr = valuesOf<T>(col);
  // Avoid calling .find on non-array by converting first.
  for (const x of arr) {
    if (pred(x)) return x;
  }
  return undefined;
}
