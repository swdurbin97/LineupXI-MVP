import { describe, it, expect } from 'vitest';
import { friendlyPlacementMessage, getFriendlyReason } from '../lib/placementMessages';

describe('Friendly Placement Messages', () => {
  describe('friendlyPlacementMessage', () => {
    it('maps "exact primary" to "Perfect match"', () => {
      const result = friendlyPlacementMessage('exact primary', 'John Doe', 'CB');
      expect(result).toBe('John Doe → CB (Perfect match)');
    });

    it('maps "exact secondary" to "Secondary match"', () => {
      const result = friendlyPlacementMessage('exact secondary', 'Jane Smith', 'ST');
      expect(result).toBe('Jane Smith → ST (Secondary match)');
    });

    it('maps "alternate (0.8)" to "Good fit"', () => {
      const result = friendlyPlacementMessage('alternate (0.8)', 'Bob Wilson', 'CDM');
      expect(result).toBe('Bob Wilson → CDM (Good fit)');
    });

    it('maps "alternate (0.6)" to "Acceptable fit"', () => {
      const result = friendlyPlacementMessage('alternate (0.6)', 'Alice Brown', 'CAM');
      expect(result).toBe('Alice Brown → CAM (Acceptable fit)');
    });

    it('maps "no compatible slots (GK rule)" to "Bench (GK rule)"', () => {
      const result = friendlyPlacementMessage('no compatible slots (GK rule)', 'Charlie', 'Bench');
      expect(result).toBe('Charlie → Bench (Bench (GK rule))');
    });

    it('maps "bench fallback (score=0)" to "Bench (no fit)"', () => {
      const result = friendlyPlacementMessage('bench fallback (score=0)', 'David', 'Bench');
      expect(result).toBe('David → Bench (Bench (no fit))');
    });

    it('is case-insensitive', () => {
      const result = friendlyPlacementMessage('EXACT PRIMARY', 'Test Player', 'LB');
      expect(result).toBe('Test Player → LB (Perfect match)');
    });

    it('does not leak raw internal reason tokens', () => {
      const reasons = [
        'exact primary',
        'exact secondary',
        'alternate (0.8)',
        'alternate (0.6)',
        'no compatible slots (GK rule)',
        'bench fallback (score=0)'
      ];

      reasons.forEach(reason => {
        const result = friendlyPlacementMessage(reason, 'Player', 'Position');
        expect(result).not.toContain('exact primary');
        expect(result).not.toContain('exact secondary');
        expect(result).not.toContain('fallback');
        expect(result).not.toContain('score=0');
      });
    });
  });

  describe('getFriendlyReason', () => {
    it('returns "Perfect match" for exact primary', () => {
      expect(getFriendlyReason('exact primary')).toBe('Perfect match');
    });

    it('returns "Secondary match" for exact secondary', () => {
      expect(getFriendlyReason('exact secondary')).toBe('Secondary match');
    });

    it('returns "Good fit" for 0.8 alternate', () => {
      expect(getFriendlyReason('alternate (0.8)')).toBe('Good fit');
    });

    it('returns "Acceptable fit" for 0.6 alternate', () => {
      expect(getFriendlyReason('alternate (0.6)')).toBe('Acceptable fit');
    });

    it('returns "Bench (GK rule)" for GK rule violations', () => {
      expect(getFriendlyReason('no compatible slots (GK rule)')).toBe('Bench (GK rule)');
    });

    it('returns "Bench (no fit)" for score=0 fallback', () => {
      expect(getFriendlyReason('bench fallback (score=0)')).toBe('Bench (no fit)');
    });

    it('returns original reason if no mapping exists', () => {
      expect(getFriendlyReason('custom reason')).toBe('custom reason');
    });
  });
});
