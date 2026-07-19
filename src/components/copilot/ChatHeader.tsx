import { Bot } from 'lucide-react';

export default function ChatHeader() {
  return (
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
  );
}
