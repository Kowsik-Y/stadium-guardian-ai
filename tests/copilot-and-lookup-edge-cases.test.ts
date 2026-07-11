/**
 * tests/copilot-and-lookup-edge-cases.test.ts
 *
 * Covers branches in generateMockCopilot() and the three lookup helpers
 * that are NOT exercised by the existing test suite:
 *
 *  copilot-translation.test.ts covers:  Moroccan Arabic, medical (breathe),
 *    bin B-104, concessions (water/snack), restroom
 *  mock-copilot-edge-cases.test.ts covers: empty/whitespace/long inputs,
 *    case-insensitive keywords, response-shape invariants, priority ordering
 *  stadium-state.test.ts covers: happy-path lookups with exact canonical IDs,
 *    and null for genuinely unknown IDs
 *
 *  This file adds:
 *    - Spanish-speaker redirect branch (Case 3 of the classifier)
 *    - Default fallback branch (no keyword matched)
 *    - Explicit bin ID extraction (e.g. B-201) vs. default B-104 fallback
 *    - Priority ordering: medical keyword beats Spanish/crowd keyword
 *    - Case-insensitivity and whitespace trimming in generateMockCopilot
 *    - lookupGate: abbreviation form ("C"), case-insensitive ("gate a"),
 *      whitespace-padded ("  Gate B  "), and empty-string returns null
 *    - lookupBin: lowercase ID, whitespace-padded ID, empty-string returns null
 *    - lookupConcession: lowercase ID, whitespace-padded ID, empty-string returns null
 */

import { describe, expect, it } from 'vitest';
import { generateMockCopilot } from '@/lib/mockCopilot';
import {
  getInitialStadiumState,
  lookupBin,
  lookupConcession,
  lookupGate,
} from '@/lib/stadiumState';

// ─────────────────────────────────────────────────────────────────────────────
// generateMockCopilot — untested classifier branches
// ─────────────────────────────────────────────────────────────────────────────

describe('generateMockCopilot — Spanish-speaker redirect branch (Case 3)', () => {
  it('should classify "gate c" query as URGENT CROWD redirect', () => {
    const result = generateMockCopilot('There are too many people near gate c');
    expect(result.incident_type).toBe('URGENT');
    expect(result.priority).toBe('CROWD');
    expect(result.action_plan?.target_zone).toBe('Gate C Plaza');
  });

  it('should classify "confundidos" query as URGENT CROWD redirect', () => {
    const result = generateMockCopilot('Los fans estan confundidos y no saben a donde ir');
    expect(result.incident_type).toBe('URGENT');
    expect(result.priority).toBe('CROWD');
    expect(result.action_plan?.recommended_action).toContain('Gate D');
  });

  it('should classify "espanol" query as URGENT CROWD redirect', () => {
    const result = generateMockCopilot('Fan is speaking espanol and is lost');
    expect(result.incident_type).toBe('URGENT');
    expect(result.priority).toBe('CROWD');
  });

  it('should classify "spanish" keyword as URGENT CROWD redirect', () => {
    const result = generateMockCopilot('A group of spanish speaking fans need help');
    expect(result.incident_type).toBe('URGENT');
    expect(result.priority).toBe('CROWD');
    expect(result.translations?.es).toBeDefined();
  });

  it('should include multilingual translations in the Spanish-branch response', () => {
    const result = generateMockCopilot('spanish fans near gate c confused');
    expect(result.translations?.en).toBeDefined();
    expect(result.translations?.es).toBeDefined();
    expect(result.translations?.fr).toBeDefined();
    expect(result.translations?.ar).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('generateMockCopilot — default fallback branch', () => {
  it('should return ROUTINE/STANDARD for a query with no matching keywords', () => {
    const result = generateMockCopilot('What time does the match start?');
    expect(result.incident_type).toBe('ROUTINE');
    expect(result.priority).toBe('STANDARD');
    expect(result.action_plan?.recommended_action).toBe(
      'Provide general information or search assistance.',
    );
  });

  it('should echo the original input text inside the reasoning field', () => {
    const input = 'When does the halftime show begin?';
    const result = generateMockCopilot(input);
    expect(result.reasoning).toContain(input);
  });

  it('should include all four translation keys in the fallback response', () => {
    const result = generateMockCopilot('totally unrelated query xyz123');
    expect(result.translations?.en).toBeDefined();
    expect(result.translations?.es).toBeDefined();
    expect(result.translations?.fr).toBeDefined();
    expect(result.translations?.ar).toBeDefined();
  });

  it('should set target_zone to "General Concourse" in the fallback action plan', () => {
    const result = generateMockCopilot('Can I bring my camera inside?');
    expect(result.action_plan?.target_zone).toBe('General Concourse');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('generateMockCopilot — bin ID extraction (Case 4)', () => {
  it('should extract an explicit bin ID from the query (B-201)', () => {
    const result = generateMockCopilot('Trash bin B-201 might overflow near the south stand');
    expect(result.priority).toBe('SUSTAINABILITY');
    expect(result.action_plan?.recommended_action).toContain('B-201');
    // When a specific bin is identified, zone is Current Volunteer Sector
    expect(result.action_plan?.target_zone).toBe('Current Volunteer Sector');
  });

  it('should extract a three-digit bin ID in any position within the query', () => {
    const result = generateMockCopilot('Please check bin B-306 overflow situation');
    expect(result.action_plan?.recommended_action).toContain('B-306');
  });

  it('should fall back to default bin B-104 when no bin ID is present in the query', () => {
    const result = generateMockCopilot('There is garbage overflowing near the entrance');
    expect(result.priority).toBe('SUSTAINABILITY');
    expect(result.action_plan?.recommended_action).toContain('B-104');
    // Default bin zone is Gate C Concourse West
    expect(result.action_plan?.target_zone).toBe('Gate C Concourse West');
  });

  it('should extract bin ID case-insensitively from query text', () => {
    // The query uses uppercase "B-205" embedded in a sentence
    const result = generateMockCopilot('bin B-205 is full');
    expect(result.action_plan?.recommended_action).toContain('B-205');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('generateMockCopilot — priority ordering (medical > crowd)', () => {
  it('should prefer MEDICAL branch over Spanish/crowd branch when "collapsed" + "gate c" appear together', () => {
    // "collapsed" triggers Case 1 (MEDICAL); "gate c" would trigger Case 3 (CROWD)
    // Medical is checked first → it wins
    const result = generateMockCopilot('someone collapsed near gate c');
    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('MEDICAL');
  });

  it('should prefer MEDICAL branch over Moroccan Arabic branch when medical keyword appears first', () => {
    // "heart" is a medical keyword; "bezaf" is a Moroccan Arabic keyword
    const result = generateMockCopilot('heart attack bezaf crowd nearby');
    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('MEDICAL');
  });

  it('should prefer MEDICAL branch over bin-overflow branch', () => {
    // "unconscious" (medical) + "overflow" (bin)
    const result = generateMockCopilot('person is unconscious near the overflow bin area');
    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('MEDICAL');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('generateMockCopilot — case-insensitivity and whitespace trimming', () => {
  it('should normalise mixed-case input to match keywords (GATE C)', () => {
    // Function lower-cases and trims internally before matching
    const result = generateMockCopilot('  FANS NEAR GATE C ARE CONFUSED  ');
    expect(result.incident_type).toBe('URGENT');
    expect(result.priority).toBe('CROWD');
  });

  it('should normalise ALL-CAPS medical keyword input', () => {
    const result = generateMockCopilot('  PERSON COLLAPSED AT SECTION 202  ');
    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('MEDICAL');
  });

  it('should trim leading and trailing whitespace before keyword matching', () => {
    // This would hit the default fallback if trimming were not applied
    const trimmed = generateMockCopilot('  restroom  ');
    const notTrimmed = generateMockCopilot('restroom');
    expect(trimmed.incident_type).toBe(notTrimmed.incident_type);
    expect(trimmed.priority).toBe(notTrimmed.priority);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// lookupGate — edge cases not covered by stadium-state.test.ts
// ─────────────────────────────────────────────────────────────────────────────

describe('lookupGate — edge cases', () => {
  const { gates } = getInitialStadiumState();

  it('should find a gate using only the letter abbreviation (e.g. "C")', () => {
    const gate = lookupGate(gates, 'C');
    expect(gate).not.toBeNull();
    expect(gate?.gate).toBe('Gate C');
  });

  it('should find a gate using a lower-case canonical name (e.g. "gate a")', () => {
    const gate = lookupGate(gates, 'gate a');
    expect(gate).not.toBeNull();
    expect(gate?.gate).toBe('Gate A');
  });

  it('should find a gate when the ID has surrounding whitespace ("  Gate B  ")', () => {
    const gate = lookupGate(gates, '  Gate B  ');
    expect(gate).not.toBeNull();
    expect(gate?.gate).toBe('Gate B');
  });

  it('should return null for an empty string', () => {
    expect(lookupGate(gates, '')).toBeNull();
  });

  it('should return null for a whitespace-only string', () => {
    // An all-whitespace input trims to "" which hits the early null-guard
    expect(lookupGate(gates, '   ')).toBeNull();
  });

  it('should return null for a gate letter outside A–D (e.g. "E")', () => {
    expect(lookupGate(gates, 'E')).toBeNull();
  });

  it('should find all four seeded gates by abbreviation', () => {
    for (const letter of ['A', 'B', 'C', 'D'] as const) {
      const gate = lookupGate(gates, letter);
      expect(gate?.gate).toBe(`Gate ${letter}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// lookupBin — edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('lookupBin — edge cases', () => {
  const { bins } = getInitialStadiumState();

  it('should find a bin using a lower-case ID (e.g. "b-101")', () => {
    const bin = lookupBin(bins, 'b-101');
    expect(bin).not.toBeNull();
    expect(bin?.bin_id).toBe('B-101');
  });

  it('should find a bin when the ID has surrounding whitespace ("  B-102  ")', () => {
    const bin = lookupBin(bins, '  B-102  ');
    expect(bin).not.toBeNull();
    expect(bin?.bin_id).toBe('B-102');
  });

  it('should return null for an empty string', () => {
    // trim() of "" is "" — toUpperCase() is "" — bins[""] is undefined
    expect(lookupBin(bins, '')).toBeNull();
  });

  it('should return null for a whitespace-only ID', () => {
    expect(lookupBin(bins, '   ')).toBeNull();
  });

  it('should return null for an ID that does not exist in the map', () => {
    expect(lookupBin(bins, 'B-999')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// lookupConcession — edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('lookupConcession — edge cases', () => {
  const { concessions } = getInitialStadiumState();

  it('should find a concession using a lower-case ID (e.g. "c-101")', () => {
    const c = lookupConcession(concessions, 'c-101');
    expect(c).not.toBeNull();
    expect(c?.concession_id).toBe('C-101');
  });

  it('should find a concession when the ID has surrounding whitespace ("  C-102  ")', () => {
    const c = lookupConcession(concessions, '  C-102  ');
    expect(c).not.toBeNull();
  });

  it('should return null for an empty string', () => {
    expect(lookupConcession(concessions, '')).toBeNull();
  });

  it('should return null for a whitespace-only ID', () => {
    expect(lookupConcession(concessions, '   ')).toBeNull();
  });

  it('should return null for an ID that does not exist in the map', () => {
    expect(lookupConcession(concessions, 'C-999')).toBeNull();
  });
});
