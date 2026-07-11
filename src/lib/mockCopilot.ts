import { STADIUM_ZONES } from './types';

// ─── Response type ────────────────────────────────────────────────────────────

/**
 * Structured response shape returned by the AI Copilot — matches the Gemini
 * JSON schema so the UI renders identically in both live-AI and sandbox modes.
 */
interface CopilotResponse {
  incident_type: string;
  priority: string;
  reasoning: string;
  action_plan: {
    recommended_action: string;
    target_zone: string;
    priority: string;
  };
  translations: {
    en: string;
    es: string;
    fr: string;
    ar: string;
  };
  message_for_volunteer: string;
}

// ─── Classification rule type ─────────────────────────────────────────────────

/**
 * A single classification rule in the heuristic cascade.
 *
 * Rules are evaluated in priority order (index 0 = highest priority). The first
 * rule whose `matcher` returns true wins and its `build` function is called to
 * produce the response. This declarative structure makes priority ordering
 * explicit and keeps each branch independently readable and testable.
 */
interface ClassificationRule {
  /** Unique rule identifier — used in comments and future analytics logging. */
  id: string;
  /** Returns true when this rule should fire for the given normalised query. */
  matcher: (query: string, originalInput: string) => boolean;
  /** Builds the structured response for this rule. */
  build: (query: string, originalInput: string) => CopilotResponse;
}

// ─── Rule table ───────────────────────────────────────────────────────────────

/**
 * Ordered priority cascade of classification rules.
 *
 * Index 0 is evaluated first — a query matching multiple rules (e.g. "collapsed
 * near gate c") resolves to the highest-priority rule (MEDICAL, not CROWD).
 */
const CLASSIFICATION_RULES: ClassificationRule[] = [
  // ── Rule 1: Medical / Breathing Emergency (highest priority) ───────────────
  {
    id: 'MEDICAL_EMERGENCY',
    matcher: (q) =>
      q.includes('breathe') ||
      q.includes('heart') ||
      q.includes('medical') ||
      q.includes('pain') ||
      q.includes('unconscious') ||
      q.includes('collapsed'),
    build: () => ({
      incident_type: 'CRITICAL_EMERGENCY',
      priority: 'MEDICAL',
      reasoning:
        "The query contains high-stakes medical distress indicators ('cannot breathe' or respiratory/cardiac terms). Immediate escalation required to prevent injury or fatality.",
      action_plan: {
        recommended_action:
          'Dispatch Medical Response Unit Alpha and alert nearby first-aid volunteers.',
        target_zone: STADIUM_ZONES.CURRENT_SECTOR,
        priority: 'HIGH',
      },
      translations: {
        en: 'Emergency services have been dispatched. Stand by to receive first-aid responders.',
        es: 'Los servicios de emergencia están en camino. Por favor, mantenga la calma.',
        fr: "Les services d'urgence ont été dépêchés. Veuillez rester calme.",
        ar: 'تم إرسال فرق الإسعاف. يرجى الحفاظ على الهدوء وتسهيل وصولهم.',
      },
      message_for_volunteer:
        'Priority: MEDICAL. Do not attempt complex movement. Keep the area clear and wait for Medical Response Unit Alpha.',
    }),
  },

  // ── Rule 2: Moroccan Arabic overcrowding / crowd-crush dialect markers ─────
  {
    id: 'MOROCCAN_ARABIC_CROWD_CRUSH',
    matcher: (q) =>
      q.includes('عباد بزاف') ||
      q.includes('مخنق') ||
      q.includes('طاح') ||
      q.includes('عياو') ||
      q.includes('tah') ||
      q.includes('bezaf'),
    build: () => ({
      incident_type: 'CRITICAL_EMERGENCY',
      priority: 'CROWD',
      reasoning:
        "Raw text input uses Moroccan Arabic dialect ('عباد بزاف' meaning crowd is dense, 'مخنق' meaning bottleneck/suffocation, 'طاح' indicating casualties falling). This represents an active crowd crush risk.",
      action_plan: {
        recommended_action:
          'Halt entry turnstiles immediately, deploy Emergency Marshals, open emergency gates.',
        target_zone: STADIUM_ZONES.GATE_F_TURNSTILES,
        priority: 'HIGH',
      },
      translations: {
        en: 'Gate F is temporarily closed. Please guide fans to clear the corridor immediately.',
        es: 'La Puerta F está temporalmente cerrada. Por favor despejen el pasillo.',
        fr: 'La porte F est temporairement fermée. Veuillez libérer le couloir.',
        ar: 'البوابة F مغلقة مؤقتاً. يرجى التوجه بهدوء نحو البوابات الأخرى وتجنب التدافع.',
      },
      message_for_volunteer:
        'URGENT CROWD RISK. Turn turnstiles off immediately. Direct spectators away from Gate F towards empty plazas.',
    }),
  },

  // ── Rule 3: Spanish crowd confusion / gate redirection ─────────────────────
  {
    id: 'SPANISH_CROWD_REDIRECT',
    matcher: (q) =>
      q.includes('spanish') ||
      q.includes('confundidos') ||
      q.includes('gate c') ||
      q.includes('espanol'),
    build: () => ({
      incident_type: 'URGENT',
      priority: 'CROWD',
      reasoning:
        'Spanish-speaking spectators are accumulating and confused near Gate C. Standard signage is insufficient. Redirection to Gate D is required.',
      action_plan: {
        recommended_action:
          'Redirect Spanish fans towards Gate D using multilingual megaphone scripts.',
        target_zone: STADIUM_ZONES.GATE_C_PLAZA,
        priority: 'MEDIUM',
      },
      translations: {
        en: 'Gate C is congested. Please guide fans to Gate D.',
        es: 'La Puerta C está congestionada. Por favor diríjanse a la puerta D.',
        fr: 'La porte C est encombrée. Veuillez vous diriger vers la porte D.',
        ar: 'البوابة C مزدحمة. يرجى التوجه إلى البوابة D.',
      },
      message_for_volunteer:
        "Please speak calmly. Point towards Gate D and repeat the Spanish phrase: 'Por favor diríjanse a la puerta D'.",
    }),
  },

  // ── Rule 4: Smart bin overflow / sustainability dispatch ───────────────────
  {
    id: 'BIN_OVERFLOW',
    matcher: (q) =>
      q.includes('bin') || q.includes('trash') || q.includes('garbage') || q.includes('overflow'),
    build: (q) => {
      // Extract explicit bin ID (e.g. B-201) or fall back to the default overflow bin
      const binMatch = q.match(/b-\d{3}/i);
      const binId = binMatch ? binMatch[0].toUpperCase() : 'B-104';
      const zone =
        binId === 'B-104' ? STADIUM_ZONES.CONCOURSE_C_WEST : STADIUM_ZONES.CURRENT_SECTOR;

      return {
        incident_type: 'ROUTINE',
        priority: 'SUSTAINABILITY',
        reasoning: `Smart waste bin ${binId} reported as overflowing. High traffic zones require proactive sanitation dispatch to maintain cleanliness and route safety.`,
        action_plan: {
          recommended_action: `Dispatch sanitation crew CREW-DELTA-04 to empty bin ${binId}.`,
          target_zone: zone,
          priority: 'LOW',
        },
        translations: {
          en: `Sanitation crew is clearing waste bin ${binId}. Please use alternative bins nearby.`,
          es: `El personal está limpiando la papelera ${binId}. Por favor use otros contenedores.`,
          fr: `L'équipe nettoie la poubelle ${binId}. Veuillez utiliser d'autres corbeilles.`,
          ar: `يجري الآن تفريغ صندوق النفايات ${binId}. يرجى استخدام الصناديق المجاورة.`,
        },
        message_for_volunteer: `Sanitation crew CREW-DELTA-04 has been notified and dispatched to ${zone}. No volunteer physical cleanup required.`,
      };
    },
  },

  // ── Rule 4.5: Concession / food stock restock ──────────────────────────────
  {
    id: 'CONCESSION_RESTOCK',
    matcher: (q) =>
      q.includes('snack') ||
      q.includes('concession') ||
      q.includes('food') ||
      q.includes('drink') ||
      q.includes('water'),
    build: () => ({
      incident_type: 'ROUTINE',
      priority: 'SUSTAINABILITY',
      reasoning:
        'Concession stand World Cup Snacks is reporting low stock (40% level) and queue wait time is 25 minutes. Restock dispatch is required.',
      action_plan: {
        recommended_action: 'Dispatch concession crew C-CREW-03 to restock World Cup Snacks.',
        target_zone: STADIUM_ZONES.CONCOURSE_C,
        priority: 'LOW',
      },
      translations: {
        en: 'Concession World Cup Snacks is currently being restocked. Shorter lines are available at Touchdown Tacos.',
        es: 'La concesión se está reabasteciendo. Hay líneas más cortas en Touchdown Tacos.',
        fr: 'Le stand est en cours de réapprovisionnement. Les files sont plus courtes à Touchdown Tacos.',
        ar: 'يجري الآن تزويد منصة الوجبات بالبضائع. تتوفر طوابير أقصر في منصات أخرى.',
      },
      message_for_volunteer:
        'Concession Restock Dispatched: C-CREW-03 is moving snacks to Gate C Concourse. Guide fans to nearby Touchdown Tacos if they query about wait times.',
    }),
  },

  // ── Rule 5: Standard navigation / restroom query ───────────────────────────
  {
    id: 'RESTROOM_NAVIGATION',
    matcher: (q) =>
      q.includes('restroom') || q.includes('toilet') || q.includes('bathroom') || q.includes('wc'),
    build: () => ({
      incident_type: 'ROUTINE',
      priority: 'STANDARD',
      reasoning:
        'Standard spectator navigational inquiry. No crowd, medical, or security hazards detected.',
      action_plan: {
        recommended_action:
          'Provide directions to the nearest restrooms adjacent to Gate B concessions.',
        target_zone: STADIUM_ZONES.CONCOURSE_B,
        priority: 'LOW',
      },
      translations: {
        en: 'Restrooms are located directly behind section 104, past the food kiosks.',
        es: 'Los baños están ubicados justo detrás de la sección 104, pasando los quioscos de comida.',
        fr: 'Les toilettes se trouvent juste derrière la section 104, après les kiosques alimentaires.',
        ar: 'المراحيض تقع خلف القسم 104 مباشرة، بعد أكشاك الطعام.',
      },
      message_for_volunteer:
        'Direct the fan to walk down the main concourse corridor and turn left past the burger stand.',
    }),
  },
];

// ─── Default fallback ─────────────────────────────────────────────────────────

/** Builds the default ROUTINE/STANDARD response when no rule matches. */
function buildDefaultResponse(originalInput: string): CopilotResponse {
  return {
    incident_type: 'ROUTINE',
    priority: 'STANDARD',
    reasoning: `Processed general query: '${originalInput}'. Checked for emergencies and found none. General support active.`,
    action_plan: {
      recommended_action: 'Provide general information or search assistance.',
      target_zone: 'General Concourse',
      priority: 'LOW',
    },
    translations: {
      en: `Understood: "${originalInput}". How can I assist you further?`,
      es: `Entendido: "${originalInput}". ¿En qué más puedo ayudarle?`,
      fr: `Compris : "${originalInput}". Comment puis-je vous aider davantage ?`,
      ar: `مفهوم: "${originalInput}". كيف يمكنني مساعدتك أكثر؟`,
    },
    message_for_volunteer:
      'Offer friendly assistance. If you are unsure of the answer, check the main control dashboard.',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Deterministic heuristic fallback for the AI Copilot used when the
 * Gemini API key is absent (sandbox / evaluation mode).
 *
 * Evaluates `CLASSIFICATION_RULES` in priority order and returns the first
 * match. If no rule fires, returns the default ROUTINE/STANDARD response.
 * The rule-table architecture makes priority ordering explicit and keeps each
 * classification branch independently readable and testable.
 *
 * @param inputText - The raw volunteer text message to classify.
 * @returns A structured copilot response matching the Gemini JSON schema.
 */
export function generateMockCopilot(inputText: string): CopilotResponse {
  const query = inputText.toLowerCase().trim();

  for (const rule of CLASSIFICATION_RULES) {
    if (rule.matcher(query, inputText)) {
      return rule.build(query, inputText);
    }
  }

  return buildDefaultResponse(inputText);
}
