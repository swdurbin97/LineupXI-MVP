export type LineupStatus = {
  starters: number;
  availableCount: number;
  canSave: boolean;
  reasons: string[];
};

export function computeLineupStatus(working: any, teamPlayers: any[]): LineupStatus {
  const onFieldIds = Object.values(working?.onField ?? {}).filter(Boolean) as string[];
  const benchIds = (working?.benchSlots ?? []).filter(Boolean) as string[];
  const starters = new Set(onFieldIds).size;

  const onFieldSet = new Set(onFieldIds);
  const benchSet = new Set(benchIds);
  const availableCount = teamPlayers.filter(
    p => !onFieldSet.has(p.id) && !benchSet.has(p.id)
  ).length;

  const reasons: string[] = [];
  if (starters !== 11) reasons.push(`${starters}/11 on field`);
  if (availableCount > 0) reasons.push(`${availableCount} player(s) still in Available`);

  return {
    starters,
    availableCount,
    canSave: starters === 11 && availableCount === 0,
    reasons
  };
}
