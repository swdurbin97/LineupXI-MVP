import { describe, it, expect } from 'vitest';
import { getCompatibilityScore, findBestSlotForPlayer, type FormationSlotData } from '../lib/placement';
import type { Player } from '../lib/types';
import type { PositionCode } from '../data/positions';

describe('Position Compatibility System', () => {
  describe('getCompatibilityScore', () => {
    it('returns 1.0 for exact self-match', () => {
      expect(getCompatibilityScore('CB' as PositionCode, 'CB' as PositionCode)).toBe(1.0);
      expect(getCompatibilityScore('ST' as PositionCode, 'ST' as PositionCode)).toBe(1.0);
      expect(getCompatibilityScore('GK' as PositionCode, 'GK' as PositionCode)).toBe(1.0);
    });

    it('returns 0.8 for same-side/direct role neighbors', () => {
      expect(getCompatibilityScore('LWB' as PositionCode, 'LB' as PositionCode)).toBe(0.8);
      expect(getCompatibilityScore('LB' as PositionCode, 'LWB' as PositionCode)).toBe(0.8);
      expect(getCompatibilityScore('CM' as PositionCode, 'CDM' as PositionCode)).toBe(0.8);
      expect(getCompatibilityScore('CM' as PositionCode, 'CAM' as PositionCode)).toBe(0.8);
      expect(getCompatibilityScore('ST' as PositionCode, 'CF' as PositionCode)).toBe(0.8);
      expect(getCompatibilityScore('LW' as PositionCode, 'LM' as PositionCode)).toBe(0.8);
    });

    it('returns 0.6 for attacking-mid ↔ wide/forward neighbors', () => {
      expect(getCompatibilityScore('LAM' as PositionCode, 'CAM' as PositionCode)).toBe(0.6);
      expect(getCompatibilityScore('CAM' as PositionCode, 'CF' as PositionCode)).toBe(0.6);
      expect(getCompatibilityScore('LAM' as PositionCode, 'LF' as PositionCode)).toBe(0.6);
      expect(getCompatibilityScore('LF' as PositionCode, 'CF' as PositionCode)).toBe(0.6);
      expect(getCompatibilityScore('RAM' as PositionCode, 'RM' as PositionCode)).toBe(0.6);
    });

    it('returns 0 for incompatible positions', () => {
      expect(getCompatibilityScore('GK' as PositionCode, 'ST' as PositionCode)).toBe(0);
      expect(getCompatibilityScore('CB' as PositionCode, 'ST' as PositionCode)).toBe(0);
      expect(getCompatibilityScore('RB' as PositionCode, 'LB' as PositionCode)).toBe(0);
    });

    it('respects GK and CB having no relations', () => {
      expect(getCompatibilityScore('CB' as PositionCode, 'GK' as PositionCode)).toBe(0);
      expect(getCompatibilityScore('CB' as PositionCode, 'CDM' as PositionCode)).toBe(0);
      expect(getCompatibilityScore('GK' as PositionCode, 'CB' as PositionCode)).toBe(0);
    });
  });

  describe('findBestSlotForPlayer', () => {
    const createSlot = (id: string, code: PositionCode, x = 50, y = 50): FormationSlotData => ({
      slot_id: id,
      slot_code: code,
      x,
      y,
    });

    const createPlayer = (id: string, primary: PositionCode, secondaries?: PositionCode[]): Player => ({
      id,
      name: `Player ${id}`,
      jersey: 1,
      primaryPos: primary,
      secondaryPos: secondaries,
    });

    it('prioritizes exact primary position match', () => {
      const player = createPlayer('p1', 'ST' as PositionCode);
      const slots = [
        createSlot('slot1', 'CF' as PositionCode, 40, 50),
        createSlot('slot2', 'ST' as PositionCode, 50, 50),
        createSlot('slot3', 'LW' as PositionCode, 60, 50),
      ];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot2');
      }
      expect(result.reason).toBe('exact primary');
    });

    it('prioritizes exact secondary over primary alternates', () => {
      const player = createPlayer('p1', 'CM' as PositionCode, ['ST' as PositionCode]);
      const slots = [
        createSlot('slot1', 'CAM' as PositionCode, 40, 50), // CM→CAM is 0.8 (primary alternate)
        createSlot('slot2', 'ST' as PositionCode, 50, 50),  // Exact secondary match
      ];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot2');
      }
      expect(result.reason).toBe('exact secondary');
    });

    it('chooses higher compatibility score (0.8 over 0.6)', () => {
      const player = createPlayer('p1', 'CM' as PositionCode);
      const slots = [
        createSlot('slot1', 'LAM' as PositionCode, 40, 50), // No relation
        createSlot('slot2', 'CAM' as PositionCode, 50, 50), // CM→CAM = 0.8
      ];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot2');
      }
      expect(result.reason).toBe('alternate (0.8)');
    });

    it('uses x-coordinate tie-breaker when scores are equal', () => {
      const player = createPlayer('p1', 'CM' as PositionCode);
      const slots = [
        createSlot('slot1', 'CDM' as PositionCode, 60, 50), // CM→CDM = 0.8
        createSlot('slot2', 'CAM' as PositionCode, 40, 50), // CM→CAM = 0.8
        createSlot('slot3', 'CDM' as PositionCode, 50, 50), // CM→CDM = 0.8
      ];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot2'); // Lowest x = 40
      }
    });

    it('uses y-coordinate tie-breaker after x', () => {
      const player = createPlayer('p1', 'CM' as PositionCode);
      const slots = [
        createSlot('slot1', 'CDM' as PositionCode, 50, 60), // Same x, higher y
        createSlot('slot2', 'CAM' as PositionCode, 50, 40), // Same x, lower y
      ];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot2'); // Lower y = 40
      }
    });

    it('uses slotId lexicographic tie-breaker after x/y', () => {
      const player = createPlayer('p1', 'CM' as PositionCode);
      const slots = [
        createSlot('slot_z', 'CDM' as PositionCode, 50, 50),
        createSlot('slot_a', 'CAM' as PositionCode, 50, 50),
        createSlot('slot_m', 'CDM' as PositionCode, 50, 50),
      ];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot_a'); // Lexicographically first
      }
    });

    it('enforces GK rule: never places non-GK into GK slot', () => {
      const player = createPlayer('p1', 'CB' as PositionCode);
      const slots = [createSlot('slot1', 'GK' as PositionCode, 50, 50)];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('bench');
      expect(result.reason).toBe('bench fallback');
    });

    it('allows GK player into GK slot', () => {
      const player = createPlayer('p1', 'GK' as PositionCode);
      const slots = [createSlot('slot1', 'GK' as PositionCode, 50, 50)];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot1');
      }
      expect(result.reason).toBe('exact primary');
    });

    it('allows player with GK as secondary into GK slot', () => {
      const player = createPlayer('p1', 'CB' as PositionCode, ['GK' as PositionCode]);
      const slots = [createSlot('slot1', 'GK' as PositionCode, 50, 50)];

      const result = findBestSlotForPlayer(player, slots, {}, []);

      expect(result.target.type).toBe('field');
      expect(result.reason).toBe('exact secondary');
    });

    it('falls back to bench when no compatible field slots', () => {
      const player = createPlayer('p1', 'GK' as PositionCode);
      const slots = [createSlot('slot1', 'ST' as PositionCode, 50, 50)];
      const bench = [null, null, null, null, null, null, null, null];

      const result = findBestSlotForPlayer(player, slots, {}, bench);

      expect(result.target.type).toBe('bench');
      expect(result.target.benchIndex).toBe(0);
      expect(result.reason).toBe('bench fallback');
    });

    it('finds first open bench slot', () => {
      const player = createPlayer('p1', 'GK' as PositionCode);
      const slots = [createSlot('slot1', 'ST' as PositionCode, 50, 50)];
      const bench = ['p2', 'p3', null, null, null, null, null, null];

      const result = findBestSlotForPlayer(player, slots, {}, bench);

      expect(result.target.type).toBe('bench');
      expect(result.target.benchIndex).toBe(2);
    });

    it('appends to bench if all slots filled', () => {
      const player = createPlayer('p1', 'GK' as PositionCode);
      const slots = [createSlot('slot1', 'ST' as PositionCode, 50, 50)];
      const bench = ['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];

      const result = findBestSlotForPlayer(player, slots, {}, bench);

      expect(result.target.type).toBe('bench');
      expect(result.target.benchIndex).toBe(8); // Append
    });

    it('skips already-filled slots', () => {
      const player = createPlayer('p1', 'ST' as PositionCode);
      const slots = [
        createSlot('slot1', 'ST' as PositionCode, 50, 50),
        createSlot('slot2', 'CF' as PositionCode, 60, 50),
      ];
      const onField = { slot1: 'p2' };

      const result = findBestSlotForPlayer(player, slots, onField, []);

      expect(result.target.type).toBe('field');
      if (result.target.type === 'field') {
        expect(result.target.slotId).toBe('slot2'); // Falls to CF (0.8)
      }
      expect(result.reason).toBe('alternate (0.8)');
    });

    it('is deterministic: same inputs produce same output', () => {
      const player = createPlayer('p1', 'CM' as PositionCode);
      const slots = [
        createSlot('slot1', 'CDM' as PositionCode, 50, 50),
        createSlot('slot2', 'CAM' as PositionCode, 50, 50),
      ];

      const result1 = findBestSlotForPlayer(player, slots, {}, []);
      const result2 = findBestSlotForPlayer(player, slots, {}, []);
      const result3 = findBestSlotForPlayer(player, slots, {}, []);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});
