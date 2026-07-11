import { describe, expect, it } from 'vitest';
import { generateMockCopilot } from '@/lib/mockCopilot';

describe('AI Copilot Heuristics & Dialect Translation Classifier', () => {
  it('should identify Moroccan Arabic overcrowding crisis', () => {
    const text = 'عباد بزاف هنا، كاين مخنق والناس عياو مقادينش نتنفسو، كاين لي طاح!';
    const result = generateMockCopilot(text);

    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('CROWD');
    expect(result.translations).toBeDefined();
    expect(result.translations?.en).toBeDefined();
    expect(result.translations?.fr).toBeDefined();
    expect(result.translations?.es).toBeDefined();
    expect(result.translations?.ar).toBeDefined();
    expect(result.action_plan).toBeDefined();
    expect(result.action_plan?.target_zone).toBe('Gate F Turnstiles');
  });

  it('should identify respiratory medical crises', () => {
    const text = 'My mother cannot breathe and needs help';
    const result = generateMockCopilot(text);

    expect(result.incident_type).toBe('CRITICAL_EMERGENCY');
    expect(result.priority).toBe('MEDICAL');
    expect(result.action_plan?.recommended_action).toContain('Medical Response');
  });

  it('should identify sanitation overflows', () => {
    const text = 'Smart bin B-104 is full and overflowing';
    const result = generateMockCopilot(text);

    expect(result.priority).toBe('SUSTAINABILITY');
    expect(result.action_plan?.recommended_action).toContain('CREW-DELTA-04');
  });

  it('should identify snack stand inventory restock queries', () => {
    const text = 'Concession stand World Cup Snacks is running low on water and snacks';
    const result = generateMockCopilot(text);

    expect(result.priority).toBe('SUSTAINABILITY');
    expect(result.action_plan?.recommended_action).toContain('C-CREW-03');
  });

  it('should classify basic questions as routine information', () => {
    const text = 'Where is the restroom near Gate B?';
    const result = generateMockCopilot(text);

    expect(result.incident_type).toBe('ROUTINE');
    expect(result.priority).toBe('STANDARD');
    expect(result.action_plan?.target_zone).toBe('Gate B Concourse');
  });
});
