export const POSITION_CODES = [
  'GK',
  'RB',
  'RWB',
  'LB',
  'LWB',
  'CB',
  'CDM',
  'CM',
  'RM',
  'LM',
  'RAM',
  'LAM',
  'CAM',
  'RF',
  'LF',
  'CF',
  'RW',
  'LW',
  'ST',
] as const;

export type PositionCode = typeof POSITION_CODES[number];

export const POSITION_LABELS: Record<PositionCode, string> = {
  GK: 'Goalkeeper',
  RB: 'Right Back',
  RWB: 'Right Wing Back',
  LB: 'Left Back',
  LWB: 'Left Wing Back',
  CB: 'Center Back',
  CDM: 'Central Defensive Midfielder',
  CM: 'Center Midfielder',
  RM: 'Right Midfielder',
  LM: 'Left Midfielder',
  RAM: 'Right Attacking Midfielder',
  LAM: 'Left Attacking Midfielder',
  CAM: 'Central Attacking Midfielder',
  RF: 'Right Forward',
  LF: 'Left Forward',
  CF: 'Center Forward',
  RW: 'Right Winger',
  LW: 'Left Winger',
  ST: 'Striker',
};

export const POSITION_CATEGORIES = {
  goalkeeper: ['GK'],
  defender: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  midfielder: ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LAM', 'RAM'],
  forward: ['LW', 'RW', 'ST', 'CF', 'LF', 'RF'],
} as const;

export function isValidPositionCode(code: string): code is PositionCode {
  return POSITION_CODES.includes(code as PositionCode);
}

export function getPositionLabel(code: PositionCode): string {
  return POSITION_LABELS[code];
}

export function getPositionCategory(code: PositionCode): keyof typeof POSITION_CATEGORIES | null {
  for (const [category, codes] of Object.entries(POSITION_CATEGORIES)) {
    if (codes.includes(code as any)) {
      return category as keyof typeof POSITION_CATEGORIES;
    }
  }
  return null;
}
