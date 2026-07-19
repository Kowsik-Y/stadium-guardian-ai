import { Bot } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useCopilotViewModel';
import MessageBubble from './MessageBubble';

interface MessageFeedProps {
  messages: ChatMessage[];
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageFeed({ messages, loading, messagesEndRef }: MessageFeedProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

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
  );
}
