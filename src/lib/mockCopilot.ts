import { STADIUM_ZONES } from './types';

/**
 * Deterministic heuristic fallback for the AI Copilot used when the
 * Gemini API key is absent (sandbox / evaluation mode).
 *
 * Processes free-text volunteer input through a priority-ordered cascade:
 * 1. Medical emergency keywords (highest priority — immediate CRITICAL_EMERGENCY)
 * 2. Moroccan Arabic dialect crowd-crush markers
 * 3. Spanish-language crowd confusion near Gate C
 * 4. Smart bin overflow reports (extracts bin ID via regex)
 * 4.5. Concession / food-stock restock queries
 * 5. Standard restroom / navigation queries
 * 6. Default fallback: ROUTINE / STANDARD for everything else
 *
 * Each branch returns a fully structured response matching the Gemini JSON
 * schema so the UI renders identically whether it is using live AI or this
 * sandbox stub.
 *
 * @param inputText - The raw volunteer text message to classify.
 * @returns A structured copilot response object with incident_type, priority,
 *   reasoning, action_plan, translations, and message_for_volunteer.
 */
export function generateMockCopilot(inputText: string) {
  const query = inputText.toLowerCase().trim();

  // Case 1: Medical / Breathing Emergency
  if (
    query.includes('breathe') ||
    query.includes('heart') ||
    query.includes('medical') ||
    query.includes('pain') ||
    query.includes('unconscious') ||
    query.includes('collapsed')
  ) {
    return {
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
    };
  }

  // Case 2: Moroccan Arabic overcrowding alert / dialect register
  if (
    query.includes('عباد بزاف') ||
    query.includes('مخنق') ||
    query.includes('طاح') ||
    query.includes('عياو') ||
    query.includes('tah') ||
    query.includes('bezaf')
  ) {
    return {
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
    };
  }

  // Case 3: Spanish crowd confusion / gate redirections
  if (
    query.includes('spanish') ||
    query.includes('confundidos') ||
    query.includes('gate c') ||
    query.includes('espanol')
  ) {
    return {
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
    };
  }

  // Case 4: Smart bin overflow / Sustainability
  if (
    query.includes('bin') ||
    query.includes('trash') ||
    query.includes('garbage') ||
    query.includes('overflow')
  ) {
    // Extract bin ID if present, otherwise default to B-104
    const binMatch = query.match(/b-\d{3}/i);
    const binId = binMatch ? binMatch[0].toUpperCase() : 'B-104';
    const zone = binId === 'B-104' ? STADIUM_ZONES.CONCOURSE_C_WEST : STADIUM_ZONES.CURRENT_SECTOR;

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
  }

  // Case 4.5: Concessions / Snack Stock low
  if (
    query.includes('snack') ||
    query.includes('concession') ||
    query.includes('food') ||
    query.includes('drink') ||
    query.includes('water')
  ) {
    return {
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
    };
  }

  // Case 5: Normal navigation request
  if (
    query.includes('restroom') ||
    query.includes('toilet') ||
    query.includes('bathroom') ||
    query.includes('wc')
  ) {
    return {
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
    };
  }

  // Default fallback for any query
  return {
    incident_type: 'ROUTINE',
    priority: 'STANDARD',
    reasoning: `Processed general query: '${inputText}'. Checked for emergencies and found none. General support active.`,
    action_plan: {
      recommended_action: 'Provide general information or search assistance.',
      target_zone: 'General Concourse',
      priority: 'LOW',
    },
    translations: {
      en: `Understood: "${inputText}". How can I assist you further?`,
      es: `Entendido: "${inputText}". ¿En qué más puedo ayudarle?`,
      fr: `Compris : "${inputText}". Comment puis-je vous aider davantage ?`,
      ar: `مفهوم: "${inputText}". كيف يمكنني مساعدتك أكثر؟`,
    },
    message_for_volunteer:
      'Offer friendly assistance. If you are unsure of the answer, check the main control dashboard.',
  };
}
