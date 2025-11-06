import { describe, it, expect } from 'vitest';
import { computeLineupStatus } from '../lib/lineupStatus';

describe('computeLineupStatus', () => {
  const createPlayer = (id: string) => ({ id, name: `Player ${id}`, jersey: 1, primaryPos: 'CB' });
  const teamPlayers = Array.from({ length: 20 }, (_, i) => createPlayer(`p${i + 1}`));

  it('returns canSave=true when 11 starters and Available=0', () => {
    const working = {
      onField: {
        's1': 'p1', 's2': 'p2', 's3': 'p3', 's4': 'p4', 's5': 'p5',
        's6': 'p6', 's7': 'p7', 's8': 'p8', 's9': 'p9', 's10': 'p10', 's11': 'p11'
      },
      benchSlots: ['p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19']
    };

    const status = computeLineupStatus(working, teamPlayers);

    expect(status.starters).toBe(11);
    expect(status.availableCount).toBe(0);
    expect(status.canSave).toBe(true);
    expect(status.reasons).toEqual([]);
  });

  it('returns canSave=false when 10 starters and Available=0', () => {
    const working = {
      onField: {
        's1': 'p1', 's2': 'p2', 's3': 'p3', 's4': 'p4', 's5': 'p5',
        's6': 'p6', 's7': 'p7', 's8': 'p8', 's9': 'p9', 's10': 'p10', 's11': null
      },
      benchSlots: ['p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18']
    };

    const status = computeLineupStatus(working, teamPlayers);

    expect(status.starters).toBe(10);
    expect(status.availableCount).toBe(0);
    expect(status.canSave).toBe(false);
    expect(status.reasons).toEqual(['10/11 on field']);
  });

  it('returns canSave=false when 11 starters and Available=3', () => {
    const working = {
      onField: {
        's1': 'p1', 's2': 'p2', 's3': 'p3', 's4': 'p4', 's5': 'p5',
        's6': 'p6', 's7': 'p7', 's8': 'p8', 's9': 'p9', 's10': 'p10', 's11': 'p11'
      },
      benchSlots: ['p12', 'p13', 'p14', 'p15', 'p16', null, null, null]
    };

    const status = computeLineupStatus(working, teamPlayers);

    expect(status.starters).toBe(11);
    expect(status.availableCount).toBe(3);
    expect(status.canSave).toBe(false);
    expect(status.reasons).toEqual(['3 player(s) still in Available']);
  });

  it('returns canSave=false when both conditions unmet', () => {
    const working = {
      onField: {
        's1': 'p1', 's2': 'p2', 's3': 'p3', 's4': 'p4', 's5': 'p5',
        's6': 'p6', 's7': 'p7', 's8': 'p8', 's9': null, 's10': null, 's11': null
      },
      benchSlots: ['p9', 'p10', null, null, null, null, null, null]
    };

    const status = computeLineupStatus(working, teamPlayers);

    expect(status.starters).toBe(8);
    expect(status.availableCount).toBe(9);
    expect(status.canSave).toBe(false);
    expect(status.reasons).toEqual(['8/11 on field', '9 player(s) still in Available']);
  });

  it('returns canSave=true even with 0 GK on field (no GK requirement)', () => {
    const working = {
      onField: {
        's1': 'p1', 's2': 'p2', 's3': 'p3', 's4': 'p4', 's5': 'p5',
        's6': 'p6', 's7': 'p7', 's8': 'p8', 's9': 'p9', 's10': 'p10', 's11': 'p11'
      },
      benchSlots: ['p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19']
    };

    const status = computeLineupStatus(working, teamPlayers);

    expect(status.canSave).toBe(true);
    expect(status.reasons).toEqual([]);
  });

  it('handles empty onField gracefully', () => {
    const working = {
      onField: {},
      benchSlots: []
    };

    const status = computeLineupStatus(working, teamPlayers);

    expect(status.starters).toBe(0);
    expect(status.availableCount).toBe(20);
    expect(status.canSave).toBe(false);
  });

  it('deduplicates onField IDs when computing starters count', () => {
    const working = {
      onField: {
        's1': 'p1', 's2': 'p1', 's3': 'p1'
      },
      benchSlots: []
    };

    const status = computeLineupStatus(working, teamPlayers);

    expect(status.starters).toBe(1);
  });

  it('handles null working lineup', () => {
    const status = computeLineupStatus(null, teamPlayers);

    expect(status.starters).toBe(0);
    expect(status.availableCount).toBe(20);
    expect(status.canSave).toBe(false);
  });
});
