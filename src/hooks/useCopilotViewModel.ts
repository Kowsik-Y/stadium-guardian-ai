import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  incident_type?: string;
  priority?: string;
  translations?: Record<string, string>;
  action_plan?: Record<string, unknown>;
  reasoning?: string;
}

export type CopilotState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Record<string, unknown> }
  | { status: 'error'; message: string };

export function useCopilotViewModel() {
  const { addIncident } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am Stadium Guardian AI, your emergency-aware operational co-pilot. Report crowd anomalies, medical situations, garbage overflows, or request fan translation cards here.',
      timestamp: new Date().toLocaleTimeString(),
      incident_type: 'ROUTINE',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [copilotState, setCopilotState] = useState<CopilotState>({ status: 'idle' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setCopilotState({ status: 'loading' });

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error('Copilot API request failed');
      const aiResponse = await response.json();

      setCopilotState({ status: 'success', data: aiResponse });

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse.message_for_volunteer,
        timestamp: new Date().toLocaleTimeString(),
        incident_type: aiResponse.incident_type,
        priority: aiResponse.priority,
        translations: aiResponse.translations,
        action_plan: aiResponse.action_plan,
        reasoning: aiResponse.reasoning,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (aiResponse.incident_type !== 'ROUTINE' || aiResponse.priority === 'SUSTAINABILITY') {
        await addIncident({
          incident_type: aiResponse.incident_type,
          problem: `Volunteer Alert: "${textToSend.slice(0, 40)}${textToSend.length > 40 ? '...' : ''}"`,
          reasoning: aiResponse.reasoning,
          recommended_action:
            aiResponse.action_plan?.recommended_action || 'Investigate volunteer report',
          confidence: aiResponse.confidence || 95,
          message_for_volunteer: aiResponse.message_for_volunteer,
          target_zone: aiResponse.action_plan?.target_zone || 'Concourse',
          dispatched_resource_id:
            aiResponse.priority === 'MEDICAL'
              ? 'MEDICAL-ALPHA'
              : aiResponse.priority === 'SUSTAINABILITY'
                ? 'CREW-DELTA-04'
                : 'MARSHAL-ALERT',
          algorithmic_routing_priority: aiResponse.action_plan?.priority || 'LOW',
          broadcast_payload: {
            language_code: 'en',
            staff_script: aiResponse.message_for_volunteer,
            fan_announcement: aiResponse.translations?.es || null,
          },
        });
      }
    } catch (e: unknown) {
      console.error('[Copilot] Failed to submit volunteer query:', e);
      const errMessage = e instanceof Error ? e.message : 'Unknown error';

      setCopilotState({ status: 'error', message: errMessage });

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai' as const,
          text: `Error calling Gemini Copilot (${errMessage}). Check API configuration or continue using simulated logic.`,
          timestamp: new Date().toLocaleTimeString(),
          incident_type: 'CRITICAL_EMERGENCY',
        },
      ]);
    }
  };

  return {
    state: {
      messages,
      inputText,
      copilotState,
      messagesEndRef,
    },
    actions: {
      setInputText,
      handleSendMessage,
    },
  };
}
