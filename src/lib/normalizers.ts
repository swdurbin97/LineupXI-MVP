import { POSITION_CODES, type PositionCode } from '../data/positions';

export const LEGACY_POSITION_MAP: Record<string, PositionCode> = {
  'GK': 'GK',
  'CB': 'CB',
  'CB1': 'CB',
  'CB2': 'CB',
  'LCB': 'CB',
  'RCB': 'CB',
  'LB': 'LB',
  'RB': 'RB',
  'LWB': 'LWB',
  'RWB': 'RWB',
  'CDM': 'CDM',
  'CM': 'CM',
  'CM1': 'CM',
  'CM2': 'CM',
  'CM3': 'CM',
  'LCM': 'CM',
  'RCM': 'CM',
  'CAM': 'CAM',
  'LM': 'LM',
  'RM': 'RM',
  'RAM': 'RAM',
  'LAM': 'LAM',
  'LW': 'LW',
  'RW': 'RW',
  'ST': 'ST',
  'ST1': 'ST',
  'ST2': 'ST',
  'CF': 'CF',
  'LF': 'LF',
  'RF': 'RF',
  'D': 'CB',
  'DEF': 'CB',
  'DEFENSE': 'CB',
  'DEFENDER': 'CB',
  'M': 'CM',
  'MID': 'CM',
  'MIDFIELD': 'CM',
  'MIDFIELDER': 'CM',
  'F': 'ST',
  'FWD': 'ST',
  'FORWARD': 'ST',
  'ATT': 'ST',
  'ATTACK': 'ST',
  'STRIKER': 'ST',
  'WING': 'LW',
  'WINGER': 'LW',
  'BACK': 'CB',
  'RIGHT ATTACKING MID': 'RAM',
  'RIGHT ATTACKING MIDFIELDER': 'RAM',
  'RIGHT AM': 'RAM',
  'R AM': 'RAM',
  'LEFT ATTACKING MID': 'LAM',
  'LEFT ATTACKING MIDFIELDER': 'LAM',
  'LEFT AM': 'LAM',
  'L AM': 'LAM',
  'CENTRE BACK': 'CB',
  'CENTER BACK': 'CB',
  'CENTRE FORWARD': 'CF',
  'CENTER FORWARD': 'CF',
  'CENTRE MID': 'CM',
  'CENTER MID': 'CM',
  'CENTRE MIDFIELDER': 'CM',
  'CENTER MIDFIELDER': 'CM',
};

export function normalizePosition(input: string | undefined | null): PositionCode | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const normalized = input.trim().toUpperCase().replace(/[-_]/g, ' ');

  if (POSITION_CODES.includes(normalized as PositionCode)) {
    return normalized as PositionCode;
  }

  if (normalized in LEGACY_POSITION_MAP) {
    return LEGACY_POSITION_MAP[normalized];
  }

  const withoutNumbers = normalized.replace(/\d+$/, '');
  if (POSITION_CODES.includes(withoutNumbers as PositionCode)) {
    return withoutNumbers as PositionCode;
  }

  if (withoutNumbers in LEGACY_POSITION_MAP) {
    return LEGACY_POSITION_MAP[withoutNumbers];
  }

  return null;
}

export function normalizePositionArray(
  input: string[] | undefined | null
): PositionCode[] {
  if (!input || !Array.isArray(input)) {
    return [];
  }

  return input
    .map(normalizePosition)
    .filter((pos): pos is PositionCode => pos !== null);
}

export function isValidPosition(code: string | undefined | null): code is PositionCode {
  if (!code) return false;
  return POSITION_CODES.includes(code as PositionCode);
}
