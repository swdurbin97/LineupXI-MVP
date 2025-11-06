import { getCompatibilityScore } from '../data/position-relations';
import type { PositionCode } from '../data/positions';
import type { Player } from './types';
import { getNormalizedSlots, type NormSlot } from './slots';

export { getCompatibilityScore };

export interface FormationSlotData {
  slot_id: string;
  slot_code: PositionCode;
  x?: number;
  y?: number;
}

export type FieldTarget = { type: 'field'; slotId: string };
export type BenchTarget = { type: 'bench'; benchIndex: number };
export type PlacementTarget = FieldTarget | BenchTarget;

export interface PlacementResult {
  target: PlacementTarget;
  reason: string;
}

export function findBestSlotForPlayer(
  player: Player,
  formationSlots: FormationSlotData[] | null | undefined,
  currentOnField: Record<string, string | null>,
  benchSlots: (string | null)[]
): PlacementResult {
  // Guard: no formation or empty slots
  if (!formationSlots || formationSlots.length === 0) {
    const benchIndex = benchSlots.findIndex(b => !b);
    return {
      target: { type: 'bench', benchIndex: benchIndex >= 0 ? benchIndex : benchSlots.length },
      reason: 'no formation/slots'
    };
  }

  // 1. Get open field slots
  const openSlots = formationSlots.filter(slot => !currentOnField[slot.slot_id]);

  // Guard: no open field slots
  if (openSlots.length === 0) {
    const benchIndex = benchSlots.findIndex(b => !b);
    return {
      target: { type: 'bench', benchIndex: benchIndex >= 0 ? benchIndex : benchSlots.length },
      reason: 'no open field slots'
    };
  }

  // 2. Apply GK rule: only filter out GK slot for non-GK players
  const playerIsGK =
    player.primaryPos === 'GK' ||
    (player.secondaryPos && player.secondaryPos.includes('GK' as PositionCode));

  const filteredSlots = openSlots.filter(slot => {
    // Keep non-GK slots for everyone
    if (slot.slot_code !== 'GK') return true;
    // Only keep GK slot if player is GK-capable
    return playerIsGK;
  });

  // Guard: after GK filter, no slots available
  if (filteredSlots.length === 0) {
    const benchIndex = benchSlots.findIndex(b => !b);
    return {
      target: { type: 'bench', benchIndex: benchIndex >= 0 ? benchIndex : benchSlots.length },
      reason: 'no compatible slots (GK rule)'
    };
  }

  // 3. Score each open slot
  const primaryPos = player.primaryPos || 'CB';
  const secondaryPositions = player.secondaryPos || [];

  interface ScoredSlot {
    slot: FormationSlotData;
    score: number;
    bucket: 1 | 2 | 3;
  }

  const scoredSlots: ScoredSlot[] = filteredSlots.map(slot => {
    // Check exact primary match
    if (slot.slot_code === primaryPos) {
      return { slot, score: 1.0, bucket: 1 as const };
    }

    // Check primary alternate score
    let bestScore = getCompatibilityScore(slot.slot_code, primaryPos);
    let bucket: 1 | 2 | 3 = bestScore > 0 ? 3 : 3;

    // Check exact secondary match (takes priority over alternates)
    for (const secPos of secondaryPositions) {
      if (slot.slot_code === secPos) {
        return { slot, score: 1.0, bucket: 2 as const };
      }
    }

    // Check secondary alternate scores
    for (const secPos of secondaryPositions) {
      const secScore = getCompatibilityScore(slot.slot_code, secPos);
      if (secScore > bestScore) {
        bestScore = secScore;
        bucket = 3;
      }
    }

    return { slot, score: bestScore, bucket };
  });

  // 4. Sort by priority: bucket (1 < 2 < 3), then score (high to low), then tie-break
  scoredSlots.sort((a, b) => {
    if (a.bucket !== b.bucket) return a.bucket - b.bucket;
    if (a.score !== b.score) return b.score - a.score;

    const ax = a.slot.x ?? Number.MAX_SAFE_INTEGER;
    const bx = b.slot.x ?? Number.MAX_SAFE_INTEGER;
    if (ax !== bx) return ax - bx;

    const ay = a.slot.y ?? Number.MAX_SAFE_INTEGER;
    const by = b.slot.y ?? Number.MAX_SAFE_INTEGER;
    if (ay !== by) return ay - by;

    return String(a.slot.slot_id).localeCompare(String(b.slot.slot_id));
  });

  // 5. Choose winner (must have score > 0)
  const winner = scoredSlots.find(s => s.score > 0);

  if (winner) {
    const reason =
      winner.bucket === 1
        ? 'exact primary'
        : winner.bucket === 2
        ? 'exact secondary'
        : `alternate (${winner.score.toFixed(1)})`;

    return {
      target: { type: 'field', slotId: winner.slot.slot_id },
      reason,
    };
  }

  // 6. No viable field slot (all scores = 0) → bench fallback
  const benchIndex = benchSlots.findIndex(slot => !slot);
  const idx = benchIndex >= 0 ? benchIndex : benchSlots.length;

  return {
    target: { type: 'bench', benchIndex: idx },
    reason: 'bench fallback (score=0)',
  };
}
