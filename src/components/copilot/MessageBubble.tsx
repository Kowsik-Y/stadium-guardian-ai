import { Bot, Languages, User } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useCopilotViewModel';

interface MessageBubbleProps {
  msg: ChatMessage;
}

export default function MessageBubble({ msg }: MessageBubbleProps) {
  const isAi = msg.sender === 'ai';

  return (
    <div className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
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
              <strong className="text-slate-350">{String(msg.action_plan.priority ?? '')}</strong>
            </span>
          </div>
        )}

        <div className="text-[9px] text-slate-500 text-right leading-none mt-1">
          {msg.timestamp}
        </div>
      </div>
    </div>
  );
}
