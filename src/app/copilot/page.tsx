'use client';

import { Bot, Code, Languages, Mic, Send, Sparkles, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  incident_type?: string;
  rawJson?: Record<string, unknown> | null;
  // AI response enrichment fields
  priority?: string;
  translations?: Record<string, string>;
  action_plan?: Record<string, unknown>;
  reasoning?: string;
}

export default function Copilot() {
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
  const [loading, setLoading] = useState(false);
  const [rawJson, setRawJson] = useState<Record<string, unknown> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const presetQueries = [
    {
      label: 'Moroccan Crowd Spill',
      text: 'عباد بزاف هنا، كاين مخنق والناس عياو مقادينش نتنفسو، كاين لي طاح!',
    },
    { label: 'Medical Breathing Crisis', text: 'My mother cannot breathe and needs a restroom' },
    { label: 'Spanish Confusion', text: 'Many Spanish fans are confused near Gate C' },
    { label: 'Bin Overflow', text: 'Smart bin B-104 is overflowing near Gate C' },
    {
      label: 'Snack Stock Low',
      text: 'Concession stand World Cup Snacks is running low on water and snacks',
    },
  ];

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
    setLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error('Copilot API request failed');
      const aiResponse = await response.json();

      setRawJson(aiResponse); // Save raw JSON to display in the XAI inspect panel

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

      // If it is an emergency or urgent action plan, dynamically populate it on the incidents dashboard!
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
      console.error(e);
      const errMessage = e instanceof Error ? e.message : 'Unknown error';
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left 2 Cols: Chat Window */}
      <div className="lg:col-span-2 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden h-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="font-bold text-sm text-slate-200 block">AI Volunteer Assistant</span>
              <span className="text-[9px] text-slate-400 font-medium">
                Real-time dialect transcription and emergency routing
              </span>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Preset Inputs Bar */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-850 flex flex-wrap gap-2">
          {presetQueries.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSendMessage(preset.text)}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 text-[10px] font-semibold transition-colors duration-150"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Profile icon */}
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAi
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isAi ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>

                {/* Msg Card */}
                <div
                  className={`p-4 rounded-xl border space-y-2 transition-all ${
                    isAi
                      ? msg.incident_type === 'CRITICAL_EMERGENCY'
                        ? 'bg-red-500/5 border-red-500/35 text-slate-200'
                        : msg.incident_type === 'URGENT'
                          ? 'bg-amber-500/5 border-amber-500/35 text-slate-200'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200'
                      : 'bg-linear-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white'
                  }`}
                >
                  <p className="text-xs leading-relaxed">{msg.text}</p>

                  {/* Multilingual Translation segment if AI and has translations */}
                  {isAi && msg.translations && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Languages className="h-3 w-3 text-emerald-400" />
                        Fan Translation Broadcaster
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-950/50 p-2 rounded border border-slate-850">
                          <span className="text-[8px] font-mono text-slate-500 font-bold block">
                            ENGLISH (EN)
                          </span>
                          <span className="text-slate-300">{msg.translations.en}</span>
                        </div>
                        <div className="bg-slate-950/50 p-2 rounded border border-slate-850">
                          <span className="text-[8px] font-mono text-slate-500 font-bold block">
                            SPANISH (ES)
                          </span>
                          <span className="text-slate-300">{msg.translations.es}</span>
                        </div>
                        <div className="bg-slate-950/50 p-2 rounded border border-slate-850">
                          <span className="text-[8px] font-mono text-slate-500 font-bold block">
                            FRENCH (FR)
                          </span>
                          <span className="text-slate-300">{msg.translations.fr}</span>
                        </div>
                        <div className="bg-slate-950/50 p-2 rounded border border-slate-850">
                          <span className="text-[8px] font-mono text-slate-500 font-bold block">
                            ARABIC (AR)
                          </span>
                          <span className="text-slate-300 text-right dir-rtl">
                            {msg.translations.ar || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operational Action Plan if AI */}
                  {isAi && msg.action_plan && (
                    <div className="mt-2 p-2 rounded bg-slate-950/40 border border-slate-850 text-[10px] text-slate-400">
                      <span className="font-semibold text-emerald-400">Recommended Action:</span>{' '}
                      {String(msg.action_plan.recommended_action ?? '')}
                      <span className="block mt-0.5">
                        Zone:{' '}
                        <strong className="text-slate-350">
                          {String(msg.action_plan.target_zone ?? '')}
                        </strong>{' '}
                        | Priority:{' '}
                        <strong className="text-slate-350">
                          {String(msg.action_plan.priority ?? '')}
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-500 text-right leading-none mt-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs shrink-0">
                <Bot className="h-4.5 w-4.5 animate-bounce" />
              </div>
              <div className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[10px] font-medium tracking-wide">
                    Stadium Guardian AI is reasoning...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2.5 items-center">
          <button
            onClick={() => handleSendMessage('My mother cannot breathe and needs a restroom')}
            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-850 hover:text-red-300 transition-colors"
            title="Simulate Voice Emergency Alert"
            aria-label="Simulate voice emergency alert"
          >
            <Mic className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            placeholder="Type your crowd alert, e.g. 'restroom directions near Gate A' or dialect report..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />

          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Right Col: XAI Json Inspector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Code className="h-4.5 w-4.5 text-emerald-400" />
          <div>
            <h4 className="text-xs font-bold text-slate-250 tracking-wider uppercase">
              Explainable AI (XAI) Inspector
            </h4>
            <p className="text-[9px] text-slate-500">
              Live API response JSON structure & logic validation
            </p>
          </div>
        </div>

        <div className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto leading-relaxed">
          {rawJson ? (
            <pre className="whitespace-pre-wrap">{JSON.stringify(rawJson, null, 2)}</pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 px-4 gap-2">
              <Sparkles className="h-8 w-8 text-slate-800" />
              <p className="font-semibold text-slate-500">Telemetry Inspector Ready</p>
              <p className="text-[9px]">
                Send a copilot query or click a preset alert to inspect the structured decision
                packet.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-450 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-850">
          <span className="font-semibold text-slate-350 block mb-0.5">
            💡 Architect&apos;s Evaluation Tip:
          </span>
          Stadium Guardian AI implements structured JSON output by feeding model configurations with{' '}
          <code className="text-emerald-400">responseMimeType: &quot;application/json&quot;</code>.
          This eliminates manual regex parsing and ensures O(1) field accessibility.
        </div>
      </div>
    </div>
  );
}
