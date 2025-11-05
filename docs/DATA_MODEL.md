# Data Model

This document describes the core data structures used throughout the LineupXI MVP application.

---

## Core Entities

### Team

Represents a youth soccer team managed by a coach.

```typescript
interface Team {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Team name (e.g., "U12 Eagles")
  colors?: {
    primary?: string;            // Primary team color
    secondary?: string;          // Secondary team color
  };
  players: Player[];             // Array of players on this team
}
```

**Storage:** Local storage key pattern: `teams` (array of Team objects)

---

### Player

Represents an individual player on a team.

```typescript
interface Player {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Player's full name
  jersey: number;                // Jersey/shirt number
  primaryPos?: PositionCode;     // Primary position (e.g., "CB", "ST")
  secondaryPos?: PositionCode[]; // Alternative positions player can play
  foot?: 'L' | 'R' | 'B';        // Preferred foot (Left/Right/Both)
  notes?: string;                // Coach's notes about the player
  status?: 'available' | 'injured' | 'unavailable'; // Availability status
}
```

**Position Codes:** See [Position Codes](#position-codes) section below.

---

### Lineup

Represents a specific lineup configuration for a team using a particular formation.

```typescript
interface Lineup {
  teamId: string;                           // Reference to Team.id
  formationCode: string;                    // Formation identifier (e.g., "442", "433")
  onField: Record<SlotId, string | null>;   // Maps slot IDs to player IDs
  bench: string[];                          // DEPRECATED - kept for backwards compatibility
  benchSlots: (string | null)[];            // Array of 8 bench slots (player IDs or null)
  roles: {
    captain?: string;                       // Player ID of team captain
    gk?: string;                            // Player ID of starting goalkeeper
    pk?: string;                            // Player ID taking penalty kicks
    ck?: string;                            // Player ID taking corner kicks
    fk?: string;                            // Player ID taking free kicks
  };
}
```

**Slot IDs:** Format is `{formationCode}:{positionCode}:{index}` (e.g., `"442:CB:0"`, `"433:ST:0"`)

**Storage:** Embedded within saved lineups (see SavedLineup below)

---

### SavedLineup

Represents a named, saved lineup configuration that can be loaded later.

```typescript
interface SavedLineup {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // User-provided name for this lineup
  teamId: string;                // Reference to Team.id
  formationCode: string;         // Formation code (e.g., "442")
  lineup: Lineup;                // The actual lineup configuration
  createdAt: number;             // Timestamp (milliseconds since epoch)
  updatedAt: number;             // Last modified timestamp
}
```

**Storage:** Local storage key pattern: `savedLineups` (array of SavedLineup objects)

---

## Position Codes

LineupXI uses a standardized set of 19 position codes to represent all soccer field positions.

### Goalkeeper (1)
- `GK` - Goalkeeper

### Defenders (6)
- `CB` - Center Back
- `LCB` - Left Center Back
- `RCB` - Right Center Back
- `LB` - Left Back
- `RB` - Right Back
- `LWB` - Left Wing Back
- `RWB` - Right Wing Back

### Midfielders (7)
- `CDM` - Central Defensive Midfielder
- `CM` - Center Midfielder
- `LCM` - Left Center Midfielder
- `RCM` - Right Center Midfielder
- `CAM` - Central Attacking Midfielder
- `LM` - Left Midfielder
- `RM` - Right Midfielder

### Forwards (5)
- `LW` - Left Winger
- `RW` - Right Winger
- `ST` - Striker
- `CF` - Center Forward
- `LF` - Left Forward
- `RF` - Right Forward

**Note:** Position codes are always uppercase and do not include numeric suffixes (e.g., "CB", not "CB1" or "CB2").

---

## Formation Slots

Each formation defines specific slots where players can be positioned. A slot represents a single position on the field within a formation.

```typescript
interface FormationSlot {
  code: string;      // Position code (e.g., "CB", "ST")
  x: number;         // Horizontal position (0-100, percentage from left)
  y: number;         // Vertical position (0-100, percentage from top)
}
```

**Example:** In a 4-4-2 formation, there are typically:
- 1 goalkeeper slot
- 4 defender slots (2 center backs, left back, right back)
- 4 midfielder slots
- 2 striker slots

---

## Data Flow

1. **Team Management:** Teams and players are created/edited in the TeamSheets page
2. **CSV Import:** Player data can be bulk-imported via CSV, creating/updating players
3. **Lineup Building:** Players are dragged from the bench/available pool onto formation slots
4. **Saving:** Completed lineups are saved with a name and stored locally
5. **Loading:** Saved lineups can be loaded back into the builder for editing or viewing

---

## Storage Strategy

**MVP:** All data is stored in browser localStorage as JSON.

**Future Considerations:** Migration to Supabase backend for:
- Multi-device access
- Team sharing between coaches
- Cloud backup and sync
- Analytics and insights

---

## Type Definitions

All TypeScript type definitions are centralized in:
- `src/lib/types.ts` - Core types (Team, Player, Lineup)
- `src/types/lineup.ts` - Lineup-specific types
- `src/types/formation.ts` - Formation-specific types

---

## Validation Rules

### Player Validation
- Name: Required, non-empty string
- Jersey: Required positive integer (typically 1-99)
- Position: Must be a valid PositionCode from the canonical list

### Team Validation
- Name: Required, non-empty string
- Players: Must have unique jersey numbers within a team

### Lineup Validation
- Each formation slot can hold at most one player
- A player cannot appear in multiple slots simultaneously
- Bench has exactly 8 slots
- Formation code must match a known formation
