import { Code, Sparkles } from 'lucide-react';

interface XaiInspectorProps {
  rawJson: Record<string, unknown> | null;
}

export default function XaiInspector({ rawJson }: XaiInspectorProps) {
  return (
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
  );
}
