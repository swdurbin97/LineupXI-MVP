export const POSITION_CODES = [
  'GK',
  'CB',
  'LCB',
  'RCB',
  'LB',
  'RB',
  'LWB',
  'RWB',
  'CDM',
  'CM',
  'LCM',
  'RCM',
  'CAM',
  'LM',
  'RM',
  'LW',
  'RW',
  'ST',
  'CF',
  'LF',
  'RF',
] as const;

export type PositionCode = typeof POSITION_CODES[number];

export const POSITION_LABELS: Record<PositionCode, string> = {
  GK: 'Goalkeeper',
  CB: 'Center Back',
  LCB: 'Left Center Back',
  RCB: 'Right Center Back',
  LB: 'Left Back',
  RB: 'Right Back',
  LWB: 'Left Wing Back',
  RWB: 'Right Wing Back',
  CDM: 'Central Defensive Midfielder',
  CM: 'Center Midfielder',
  LCM: 'Left Center Midfielder',
  RCM: 'Right Center Midfielder',
  CAM: 'Central Attacking Midfielder',
  LM: 'Left Midfielder',
  RM: 'Right Midfielder',
  LW: 'Left Winger',
  RW: 'Right Winger',
  ST: 'Striker',
  CF: 'Center Forward',
  LF: 'Left Forward',
  RF: 'Right Forward',
};

export const POSITION_CATEGORIES = {
  goalkeeper: ['GK'],
  defender: ['CB', 'LCB', 'RCB', 'LB', 'RB', 'LWB', 'RWB'],
  midfielder: ['CDM', 'CM', 'LCM', 'RCM', 'CAM', 'LM', 'RM'],
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
