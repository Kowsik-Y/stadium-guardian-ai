import { describe, expect, it } from 'vitest';
import { generateMockCopilot } from '@/lib/mockCopilot';

/**
 * Edge-case tests for the generateMockCopilot heuristic classifier.
 *
 * The standard happy-path tests live in copilot-translation.test.ts.
 * These tests specifically target boundary conditions and unusual inputs
 * that stress-test the classifier's robustness and guard against regressions.
 */

describe('generateMockCopilot — edge cases', () => {
  // ─── Input boundary conditions ───────────────────────────────────────────

  it('should handle empty string input without throwing', () => {
    expect(() => generateMockCopilot('')).not.toThrow();
  });

  it('should return a ROUTINE/STANDARD response for empty string input', () => {
    const result = generateMockCopilot('');
    expect(result.incident_type).toBe('ROUTINE');
    expect(result.priority).toBe('STANDARD');
  });

  it('should handle very long inputs (500+ characters) without throwing', () => {
    const longInput = 'a fan is asking about the exit '.repeat(20); // ~620 chars
    expect(() => generateMockCopilot(longInput)).not.toThrow();
    const result = generateMockCopilot(longInput);
    expect(result).toBeDefined();
    expect(result.incident_type).toBeDefined();
  });

  it('should handle inputs with only whitespace', () => {
    const result = generateMockCopilot('   \t\n  ');
    expect(result.incident_type).toBe('ROUTINE');
    expect(result.priority).toBe('STANDARD');
  });

  // ─── Case sensitivity ────────────────────────────────────────────────────

  it('should extract bin ID case-insensitively (b-104 === B-104)', () => {
    const lower = generateMockCopilot('bin b-104 is overflowing');
    const upper = generateMockCopilot('bin B-104 is overflowing');
    // Both should target the same crew
    expect(lower.action_plan?.recommended_action).toBe(upper.action_plan?.recommended_action);
  });

  it('should match medical keywords regardless of case', () => {
    const lower = generateMockCopilot('person cannot breathe');
    const upper = generateMockCopilot('PERSON CANNOT BREATHE');
    expect(lower.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(upper.incident_type).toBe('CRITICAL_EMERGENCY');
  });

  // ─── Structured response shape validation ────────────────────────────────

  it('should always return translations in all four required languages', () => {
    const inputs = [
      '',
      'My mother cannot breathe',
      'عباد بزاف هنا، كاين مخنق',
      'bin B-103 is overflowing',
      'Where is the restroom?',
      'Concession stand is out of water',
    ];

    for (const input of inputs) {
      const result = generateMockCopilot(input);
      expect(result.translations).toBeDefined();
      expect(result.translations?.en).toBeDefined();
      expect(result.translations?.es).toBeDefined();
      expect(result.translations?.fr).toBeDefined();
      expect(result.translations?.ar).toBeDefined();
    }
  });

  it('should always return an action_plan with required fields', () => {
    const inputs = [
      'Where is Gate B?',
      'The crowd is pushing near the entrance',
      'bin overflowing',
    ];

    for (const input of inputs) {
      const result = generateMockCopilot(input);
      expect(result.action_plan).toBeDefined();
      expect(result.action_plan?.recommended_action).toBeDefined();
      expect(result.action_plan?.target_zone).toBeDefined();
      expect(result.action_plan?.priority).toBeDefined();
    }
  });

  it('should always return a message_for_volunteer', () => {
    const result = generateMockCopilot('');
    expect(result.message_for_volunteer).toBeDefined();
    expect(typeof result.message_for_volunteer).toBe('string');
  });

  // ─── Mixed-language / transliteration inputs ─────────────────────────────

  it('should detect Moroccan Arabic via Latin transliteration triggers', () => {
    const result = generateMockCopilot('bezaf de monde ici, tah wahed');
    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('CROWD');
  });

  it('should classify non-emergency non-English input as ROUTINE', () => {
    // Generic French navigation query — no crisis keywords
    const result = generateMockCopilot('Où sont les toilettes?');
    // "toilettes" contains "toilet" as substring → should match restroom branch
    expect(result.incident_type).toBe('ROUTINE');
  });

  // ─── Priority ordering ────────────────────────────────────────────────────

  it('should prioritise medical over bin overflow when both appear in input', () => {
    // "breathe" (medical) + "bin overflow" (sustainability) — medical wins
    const result = generateMockCopilot('someone cannot breathe near the overflowing bin');
    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('MEDICAL');
  });
});
