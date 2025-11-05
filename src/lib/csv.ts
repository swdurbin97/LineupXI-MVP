import { Player } from './types';
import { normalizePosition, isValidPosition } from './normalizers';
import type { PositionCode } from '../data/positions';

export interface CSVImportResult {
  players: Player[];
  summary: {
    total: number;
    imported: number;
    skipped: number;
    normalized: number;
    errors: Array<{ row: number; reason: string }>;
  };
}

export function playersToCSV(players: Player[]): string {
  if (!players || players.length === 0) return '';

  const headers = ['Name', 'Jersey', 'Position', 'Foot', 'Status', 'Notes'];
  const rows = players.map(p => {
    const position = p.primaryPos && isValidPosition(p.primaryPos) ? p.primaryPos : '';
    return [
      p.name,
      p.jersey.toString(),
      position,
      p.foot || 'R',
      p.status || 'available',
      p.notes || ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function csvToPlayers(csv: string): CSVImportResult {
  const lines = csv.trim().split('\n');
  const players: Player[] = [];
  const errors: Array<{ row: number; reason: string }> = [];
  let normalized = 0;

  if (lines.length < 2) {
    return {
      players: [],
      summary: { total: 0, imported: 0, skipped: 0, normalized: 0, errors: [] }
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 2) {
      errors.push({ row: i + 1, reason: 'Invalid CSV format' });
      continue;
    }

    const values = matches.map(m => m.replace(/^"|"$/g, '').trim());

    const name = values[0] || '';
    const jersey = parseInt(values[1]) || 0;

    if (!name || !jersey) {
      errors.push({ row: i + 1, reason: 'Missing required field (name or jersey)' });
      continue;
    }

    const rawPosition = values[2];
    const normalizedPosition = normalizePosition(rawPosition);

    if (rawPosition && !normalizedPosition) {
      errors.push({ row: i + 1, reason: `Invalid position: "${rawPosition}"` });
      continue;
    }

    if (rawPosition && normalizedPosition && rawPosition.toUpperCase() !== normalizedPosition) {
      normalized++;
    }

    const player: Player = {
      id: `player-${Date.now()}-${i}`,
      name,
      jersey,
      primaryPos: normalizedPosition || undefined,
      foot: (values[3] as 'L' | 'R' | 'B') || 'R',
      status: (values[4] as Player['status']) || 'available',
      notes: values[5] || undefined
    };

    players.push(player);
  }

  return {
    players,
    summary: {
      total: lines.length - 1,
      imported: players.length,
      skipped: errors.length,
      normalized,
      errors
    }
  };
}