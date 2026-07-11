'use client';

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Download,
  Info,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import Papa from 'papaparse';
import type React from 'react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface CsvGateRow {
  gate: string;
  density: number;
  arrival_rate: number;
  wait_time: number;
}

export default function UploadTestBed() {
  const { setStadiumState, runAiReasoningEngine, aiAnalyzing, incidents } = useApp();
  const [csvData, setCsvData] = useState<CsvGateRow[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean>(false);

  const handleCsvParse = (file: File) => {
    setFileName(file.name);
    setErrors([]);
    setSuccess(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        const parsedGates: CsvGateRow[] = [];
        const parseErrors: string[] = [];

        // Validate headers
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          const required = ['gate', 'density', 'arrival_rate', 'wait_time'];
          const missing = required.filter((h) => !headers.includes(h));

          if (missing.length > 0) {
            setErrors([`Invalid CSV columns. Missing required headers: ${missing.join(', ')}`]);
            return;
          }
        } else {
          setErrors(['The uploaded CSV is empty.']);
          return;
        }

        // Validate and convert rows
        data.forEach((row: Record<string, string>, index) => {
          const lineNum = index + 2; // header is line 1
          const gateName = row.gate?.trim();
          const density = parseInt(row.density, 10);
          const arrivalRate = parseInt(row.arrival_rate, 10);
          const waitTime = parseInt(row.wait_time, 10);

          if (!gateName) {
            parseErrors.push(`Row ${lineNum}: 'gate' name is blank.`);
          }
          if (Number.isNaN(density) || density < 0 || density > 100) {
            parseErrors.push(
              `Row ${lineNum}: 'density' must be a number between 0 and 100 (got "${row.density}").`,
            );
          }
          if (Number.isNaN(arrivalRate) || arrivalRate < 0) {
            parseErrors.push(
              `Row ${lineNum}: 'arrival_rate' must be a positive number (got "${row.arrival_rate}").`,
            );
          }
          if (Number.isNaN(waitTime) || waitTime < 0) {
            parseErrors.push(
              `Row ${lineNum}: 'wait_time' must be a positive number (got "${row.wait_time}").`,
            );
          }

          if (parseErrors.length === 0) {
            parsedGates.push({
              gate: gateName.startsWith('Gate') ? gateName : `Gate ${gateName}`,
              density,
              arrival_rate: arrivalRate,
              wait_time: waitTime,
            });
          }
        });

        if (parseErrors.length > 0) {
          setErrors(parseErrors);
          setCsvData(null);
        } else {
          setCsvData(parsedGates);
          setSuccess(true);
        }
      },
      error: (error) => {
        setErrors([`CSV parsing failed: ${error.message}`]);
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCsvParse(file);
  };

  const handleApplyData = async () => {
    if (!csvData) return;

    setStadiumState((prev) => {
      const nextGates = { ...prev.gates };
      csvData.forEach((row) => {
        const key = row.gate; // e.g. "Gate A"
        nextGates[key] = {
          ...nextGates[key],
          density: row.density,
          arrival_rate: row.arrival_rate,
          wait_time: row.wait_time,
        };
      });
      return { ...prev, gates: nextGates };
    });

    setSuccess(false);
    setCsvData(null);
    setFileName('');

    // Automatically trigger AI reasoning on the newly loaded telemetry
    await runAiReasoningEngine();
  };

  // Helper to trigger simulated presets
  const loadPresetMock = (presetData: string) => {
    const blob = new Blob([presetData], { type: 'text/csv' });
    const file = new File([blob], 'stadium_data.csv', { type: 'text/csv' });
    handleCsvParse(file);
  };

  const PRESET_NORMAL = `gate,density,arrival_rate,wait_time
Gate A,40,100,5
Gate B,50,180,9
Gate C,45,150,6
Gate D,30,80,4`;

  const PRESET_CRITICAL = `gate,density,arrival_rate,wait_time
Gate A,40,110,5
Gate B,60,200,10
Gate C,88,620,24
Gate D,30,80,4`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 font-sans">
          Synthetic Data Test Bed
        </h1>
        <p className="text-sm text-slate-400">
          Upload custom CSV telemetry packets to stress-test Gemini&apos;s Explainable Decision
          engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Upload Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
            <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <UploadCloud className="h-4.5 w-4.5 text-emerald-400" />
              CSV Telemetry Ingestion Portal
            </h4>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative bg-slate-950/20 group">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Upload CSV File"
              />
              <UploadCloud className="h-10 w-10 text-slate-500 group-hover:text-emerald-400 transition-colors mb-3" />
              <p className="text-sm font-semibold text-slate-350">
                {fileName ? `Selected: ${fileName}` : 'Drag & drop your stadium_data.csv here'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accepts standard comma-separated text files
              </p>
            </div>

            {/* Feedback Banners */}
            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/25 rounded-lg space-y-1.5 text-xs text-red-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  <span>Validation Failures ({errors.length}):</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 font-mono text-[10px]">
                  {errors.slice(0, 4).map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                  {errors.length > 4 && <li>... and {errors.length - 4} more validation issues</li>}
                </ul>
              </div>
            )}

            {success && csvData && (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg flex items-center justify-between text-xs text-emerald-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <span>
                      CSV structure validated successfully! ({csvData.length} gates ready)
                    </span>
                  </div>
                </div>

                {/* Parsed Preview Table */}
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-4">Gate</th>
                        <th className="py-2.5 px-4 text-center">Crowd Density</th>
                        <th className="py-2.5 px-4 text-center">Arrival Rate</th>
                        <th className="py-2.5 px-4 text-center">Wait Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 text-slate-300">
                      {csvData.map((row) => (
                        <tr key={`csv-row-${row.gate}`} className="hover:bg-slate-900/30">
                          <td className="py-2.5 px-4 font-bold">{row.gate}</td>
                          <td className="py-2.5 px-4 text-center">{row.density}%</td>
                          <td className="py-2.5 px-4 text-center">{row.arrival_rate} fans/m</td>
                          <td className="py-2.5 px-4 text-center">{row.wait_time} mins</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleApplyData}
                  disabled={aiAnalyzing}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  {aiAnalyzing
                    ? 'AI Reasoning Engine Processing...'
                    : 'Apply Live Telemetry & Analyze with AI'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Simulated CSV Presets */}
            <div className="mt-8 pt-6 border-t border-slate-850">
              <span className="text-xs font-semibold text-slate-400 block mb-3">
                Load Test Presets (Instant CSV Simulation):
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => loadPresetMock(PRESET_NORMAL)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 text-xs font-medium text-slate-350 rounded-lg hover:text-slate-100 transition-colors"
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  Moderate Baseline Preset
                </button>
                <button
                  onClick={() => loadPresetMock(PRESET_CRITICAL)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-800 hover:border-red-500/30 bg-slate-950 text-xs font-medium text-red-400 rounded-lg hover:bg-red-500/5 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Gate C Overcrowded Preset
                </button>
              </div>
            </div>
          </div>

          {/* AI Decision Result from CSV */}
          {incidents.length > 0 && incidents[0].problem.includes('Volunteer Alert') && (
            <div className="p-5 bg-gradient-to-br from-emerald-950/20 to-slate-900 border border-emerald-500/25 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-sm text-slate-200">
                  Latest AI Telemetry Resolution Plan
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="text-slate-350">
                  <strong className="text-slate-200">State:</strong> {incidents[0].problem}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Reasoning:</strong> {incidents[0].reasoning}
                </p>
                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850 mt-2 font-mono text-[10px] text-emerald-400/90">
                  <span className="font-bold uppercase tracking-wider block text-slate-500 mb-1">
                    DISPATCH MATRIX
                  </span>
                  Recommended Action: {incidents[0].recommended_action}
                  <br />
                  Target Zone: {incidents[0].target_zone}
                  <br />
                  Assigned Team: {incidents[0].dispatched_resource_id}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Rules & Schema Instructions */}
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
                <br />- <code className="text-slate-400">density</code>: numeric percentage (0 to
                100)
                <br />- <code className="text-slate-400">arrival_rate</code>: count rate (people per
                min)
                <br />- <code className="text-slate-400">wait_time</code>: numeric wait time in
                minutes
              </p>
            </div>

            <p className="text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <strong>Optimization Note:</strong> After parsing the file, the data is pushed
              directly into our O(1) Gate mapping state. This overrides the synthetic sensor streams
              and triggers a server-side AI evaluation block.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
