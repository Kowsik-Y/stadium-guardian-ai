import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { type CsvGateRow, parseCsvFile } from '@/lib/csvParser';

export type UploadState =
  | { status: 'idle' }
  | { status: 'error'; errors: string[] }
  | { status: 'success'; data: CsvGateRow[] };

export function useUploadViewModel() {
  const { setStadiumState, runAiReasoningEngine, aiAnalyzing, incidents } = useApp();
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [fileName, setFileName] = useState<string>('');

  const handleCsvParse = (file: File) => {
    setFileName(file.name);
    setUploadState({ status: 'idle' });

    parseCsvFile(
      file,
      (data) => setUploadState({ status: 'success', data }),
      (errors) => setUploadState({ status: 'error', errors }),
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCsvParse(file);
  };

  const handleApplyData = async () => {
    if (uploadState.status !== 'success') return;

    const dataToApply = uploadState.data;

    setStadiumState((prev) => {
      const nextGates = { ...prev.gates };
      dataToApply.forEach((row) => {
        const key = row.gate;
        nextGates[key] = {
          ...nextGates[key],
          density: row.density,
          arrival_rate: row.arrival_rate,
          wait_time: row.wait_time,
        };
      });
      return { ...prev, gates: nextGates };
    });

    setUploadState({ status: 'idle' });
    setFileName('');

    await runAiReasoningEngine();
  };

  const loadPresetMock = (presetData: string) => {
    const blob = new Blob([presetData], { type: 'text/csv' });
    const file = new File([blob], 'stadium_data.csv', { type: 'text/csv' });
    handleCsvParse(file);
  };

  return {
    state: {
      uploadState,
      fileName,
      aiAnalyzing,
      incidents,
    },
    actions: {
      handleFileUpload,
      handleApplyData,
      loadPresetMock,
    },
  };
}
