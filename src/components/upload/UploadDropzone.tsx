import { UploadCloud } from 'lucide-react';
import type React from 'react';

interface UploadDropzoneProps {
  fileName: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadDropzone({ fileName, handleFileUpload }: UploadDropzoneProps) {
  return (
    <>
      <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-4 flex items-center gap-1.5">
        <UploadCloud className="h-4.5 w-4.5 text-emerald-400" />
        CSV Telemetry Ingestion Portal
      </h4>

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
        <p className="text-xs text-slate-500 mt-1">Accepts standard comma-separated text files</p>
      </div>
    </>
  );
}
