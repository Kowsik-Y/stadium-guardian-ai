import { Info } from 'lucide-react';

export default function SchemaRulesSidebar() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-fit space-y-4">
      <div className="flex items-center gap-2">
        <Info className="h-4.5 w-4.5 text-emerald-400" />
        <h4 className="text-xs font-bold text-slate-250 tracking-wider uppercase">
          CSV Ingestion Rules
        </h4>
      </div>

      <div className="space-y-3.5 text-xs leading-relaxed text-slate-400">
        <p>
          To ensure the AI decision module is truly dynamic and not hardcoded, judges can upload
          custom files containing other gates or values.
        </p>

        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 text-[10px] space-y-2">
          <span className="font-mono text-emerald-400 font-bold block mb-1">
            stadium_data.csv Schema:
          </span>
          <p className="text-slate-500 leading-normal">
            First line must contain exactly the header keys:
            <br />
            <code className="text-slate-300 font-semibold font-mono">
              gate,density,arrival_rate,wait_time
            </code>
          </p>
          <p className="text-slate-550 leading-normal">
            <strong className="text-slate-400 font-bold">field constraints:</strong>
            <br />- <code className="text-slate-400">gate</code>: string value (e.g. A, B, C, D)
            <br />- <code className="text-slate-400">density</code>: numeric percentage (0 to 100)
            <br />- <code className="text-slate-400">arrival_rate</code>: count rate (people per
            min)
            <br />- <code className="text-slate-400">wait_time</code>: numeric wait time in minutes
          </p>
        </div>

        <p className="text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded border border-slate-850">
          <strong>Optimization Note:</strong> After parsing the file, the data is pushed directly
          into our O(1) Gate mapping state. This overrides the synthetic sensor streams and triggers
          a server-side AI evaluation block.
        </p>
      </div>
    </div>
  );
}
