import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { UploadState } from '@/hooks/useUploadViewModel';

interface ValidationBannersProps {
  uploadState: UploadState;
}

export default function ValidationBanners({ uploadState }: ValidationBannersProps) {
  if (uploadState.status === 'error') {
    return (
      <div className="mt-4 p-4 bg-red-500/10 border border-red-500/25 rounded-lg space-y-1.5 text-xs text-red-400">
        <div className="flex items-center gap-1.5 font-bold">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>Validation Failures ({uploadState.errors.length}):</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 font-mono text-[10px]">
          {uploadState.errors.slice(0, 4).map((err) => (
            <li key={err}>{err}</li>
          ))}
          {uploadState.errors.length > 4 && (
            <li>... and {uploadState.errors.length - 4} more validation issues</li>
          )}
        </ul>
      </div>
    );
  }

  if (uploadState.status === 'success') {
    return (
      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg flex items-center justify-between text-xs text-emerald-400">
        <div className="flex items-center gap-1.5 font-bold">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>CSV structure validated successfully! ({uploadState.data.length} gates ready)</span>
        </div>
      </div>
    );
  }

  return null;
}
