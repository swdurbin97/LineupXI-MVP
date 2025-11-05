import type { PositionCode } from './positions';

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
