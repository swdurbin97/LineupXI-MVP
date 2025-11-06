import type { PositionCode } from './positions';

// Sprint 2: Exact relations mapping (single source of truth)
export const RELATIONS: Record<PositionCode, PositionCode[]> = {
  GK: [],
  CB: [],
  LB: ['LWB'],
  LWB: ['LB'],
  RB: ['RWB'],
  RWB: ['RB'],
  CDM: ['CM'],
  CM: ['CDM', 'CAM'],
  CAM: ['CM', 'LAM', 'RAM', 'CF'],
  LAM: ['CAM', 'LF', 'LM'],
  RAM: ['CAM', 'RF', 'RM'],
  LM: ['LW', 'LAM'],
  RM: ['RW', 'RAM'],
  LF: ['LAM', 'CF'],
  RF: ['RAM', 'CF'],
  CF: ['ST', 'LF', 'RF', 'CAM'],
  LW: ['LM'],
  RW: ['RM'],
  ST: ['CF'],
};

export type CompatScore = 0.6 | 0.8;

// Scoring rules for related positions:
// 0.8 = same-side / direct role neighbors: FB↔WB, WM↔W, CDM↔CM, CM↔CAM, CF↔ST
// 0.6 = attacking-mid ↔ wide/forward neighbors: CAM↔LAM/RAM/CF; LAM/RAM↔LM/RM/LF/RF; LF/RF↔CF
function scoreFor(playerPos: PositionCode, slotPos: PositionCode): CompatScore | 0 {
  const relations = RELATIONS[playerPos] || [];
  if (!relations.includes(slotPos)) return 0;

  // 0.8 tier: same-side / direct role neighbors
  const tier08Pairs: Array<[PositionCode, PositionCode]> = [
    ['LB', 'LWB'], ['LWB', 'LB'],
    ['RB', 'RWB'], ['RWB', 'RB'],
    ['LM', 'LW'], ['LW', 'LM'],
    ['RM', 'RW'], ['RW', 'RM'],
    ['CDM', 'CM'], ['CM', 'CDM'],
    ['CM', 'CAM'], ['CAM', 'CM'],
    ['CF', 'ST'], ['ST', 'CF'],
  ];

  for (const [p1, p2] of tier08Pairs) {
    if (playerPos === p1 && slotPos === p2) return 0.8;
  }

  // 0.6 tier: attacking-mid ↔ wide/forward neighbors
  const tier06Pairs: Array<[PositionCode, PositionCode]> = [
    ['CAM', 'LAM'], ['LAM', 'CAM'],
    ['CAM', 'RAM'], ['RAM', 'CAM'],
    ['CAM', 'CF'], ['CF', 'CAM'],
    ['LAM', 'LM'], ['LM', 'LAM'],
    ['LAM', 'LF'], ['LF', 'LAM'],
    ['RAM', 'RM'], ['RM', 'RAM'],
    ['RAM', 'RF'], ['RF', 'RAM'],
    ['LF', 'CF'], ['CF', 'LF'],
    ['RF', 'CF'], ['CF', 'RF'],
  ];

  for (const [p1, p2] of tier06Pairs) {
    if (playerPos === p1 && slotPos === p2) return 0.6;
  }

  return 0;
}

// Build scored compatibility matrix from RELATIONS
// COMPAT[playerPos][slotPos] = score (exact self-match 1.0 is implicit, not stored)
export const COMPAT: Record<PositionCode, Partial<Record<PositionCode, CompatScore>>> =
  Object.keys(RELATIONS).reduce((acc, key) => {
    const playerPos = key as PositionCode;
    const relatedPositions = RELATIONS[playerPos];
    const scores: Partial<Record<PositionCode, CompatScore>> = {};

    for (const slotPos of relatedPositions) {
      const score = scoreFor(playerPos, slotPos);
      if (score > 0 && (score === 0.6 || score === 0.8)) {
        scores[slotPos] = score;
      }
    }

    acc[playerPos] = scores;
    return acc;
  }, {} as Record<PositionCode, Partial<Record<PositionCode, CompatScore>>>);

// Get compatibility score between slot position and player position
// Returns 1.0 for exact match, 0.8 or 0.6 for alternates, 0 for no compatibility
export function getCompatibilityScore(slotPos: PositionCode, playerPos: PositionCode): number {
  if (slotPos === playerPos) return 1.0;
  return COMPAT[playerPos]?.[slotPos] ?? 0;
}

// Legacy compatibility functions (preserved for backwards compatibility)
export const POSITION_COMPATIBILITY: Record<PositionCode, PositionCode[]> = {
  GK: ['GK'],
  CB: ['CB', 'CDM'],
  LB: ['LB', 'LWB', 'LM', 'CB'],
  RB: ['RB', 'RWB', 'RM', 'CB'],
  LWB: ['LWB', 'LB', 'LM'],
  RWB: ['RWB', 'RB', 'RM'],
  CDM: ['CDM', 'CM', 'CB'],
  CM: ['CM', 'CDM', 'CAM'],
  CAM: ['CAM', 'CM', 'CF', 'LAM', 'RAM'],
  LM: ['LM', 'LWB', 'LW', 'LAM'],
  RM: ['RM', 'RWB', 'RW', 'RAM'],
  LAM: ['LAM', 'LM', 'LW', 'CAM'],
  RAM: ['RAM', 'RM', 'RW', 'CAM'],
  LW: ['LW', 'LM', 'LF', 'ST', 'LAM'],
  RW: ['RW', 'RM', 'RF', 'ST', 'RAM'],
  ST: ['ST', 'CF', 'LF', 'RF'],
  CF: ['CF', 'ST', 'CAM'],
  LF: ['LF', 'ST', 'LW'],
  RF: ['RF', 'ST', 'RW'],
};

export function getCompatiblePositions(position: PositionCode): PositionCode[] {
  return POSITION_COMPATIBILITY[position] || [position];
}

export function arePositionsCompatible(pos1: PositionCode, pos2: PositionCode): boolean {
  const compatible = POSITION_COMPATIBILITY[pos1] || [];
  return compatible.includes(pos2);
}
