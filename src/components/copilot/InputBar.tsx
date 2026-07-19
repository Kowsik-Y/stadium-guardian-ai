import { Mic, Send } from 'lucide-react';

interface InputBarProps {
  inputText: string;
  setInputText: (val: string) => void;
  handleSendMessage: (text: string) => void;
  loading: boolean;
}

export default function InputBar({
  inputText,
  setInputText,
  handleSendMessage,
  loading,
}: InputBarProps) {
  return (
    <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2.5 items-center">
      <button
        type="button"
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
        type="button"
        onClick={() => handleSendMessage(inputText)}
        disabled={!inputText.trim() || loading}
        className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Send message"
      >
        <Send className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
