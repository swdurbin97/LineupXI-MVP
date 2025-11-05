import type { PositionCode } from './positions';

export const POSITION_COMPATIBILITY: Record<PositionCode, PositionCode[]> = {
  GK: ['GK'],

  CB: ['CB', 'LCB', 'RCB', 'CDM'],
  LCB: ['LCB', 'CB', 'LB'],
  RCB: ['RCB', 'CB', 'RB'],
  LB: ['LB', 'LCB', 'LWB', 'LM'],
  RB: ['RB', 'RCB', 'RWB', 'RM'],
  LWB: ['LWB', 'LB', 'LM'],
  RWB: ['RWB', 'RB', 'RM'],

  CDM: ['CDM', 'CM', 'CB'],
  CM: ['CM', 'CDM', 'CAM', 'LCM', 'RCM'],
  LCM: ['LCM', 'CM', 'LM'],
  RCM: ['RCM', 'CM', 'RM'],
  CAM: ['CAM', 'CM', 'CF', 'LW', 'RW'],
  LM: ['LM', 'LCM', 'LWB', 'LW'],
  RM: ['RM', 'RCM', 'RWB', 'RW'],

  LW: ['LW', 'LM', 'LF', 'ST'],
  RW: ['RW', 'RM', 'RF', 'ST'],
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
