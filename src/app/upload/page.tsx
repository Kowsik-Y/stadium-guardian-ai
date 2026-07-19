'use client';

import AiResultCard from '@/components/upload/AiResultCard';
import PreviewTable from '@/components/upload/PreviewTable';
import SchemaRulesSidebar from '@/components/upload/SchemaRulesSidebar';
import SimulationPresets from '@/components/upload/SimulationPresets';
import UploadDropzone from '@/components/upload/UploadDropzone';
import UploadHeader from '@/components/upload/UploadHeader';
import ValidationBanners from '@/components/upload/ValidationBanners';
import { useUploadViewModel } from '@/hooks/useUploadViewModel';

export default function UploadTestBed() {
  const { state, actions } = useUploadViewModel();
  const { uploadState, fileName, aiAnalyzing, incidents } = state;
  const { handleFileUpload, handleApplyData, loadPresetMock } = actions;

  return (
    <div className="space-y-6">
      <UploadHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Upload Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
            <UploadDropzone fileName={fileName} handleFileUpload={handleFileUpload} />
            <ValidationBanners uploadState={uploadState} />

            {uploadState.status === 'success' && (
              <PreviewTable
                data={uploadState.data}
                handleApplyData={handleApplyData}
                aiAnalyzing={aiAnalyzing}
              />
            )}

            <SimulationPresets loadPresetMock={loadPresetMock} />
          </div>

          <AiResultCard incidents={incidents} />
        </div>

        {/* Right Column: Rules & Schema Instructions */}
        <SchemaRulesSidebar />
      </div>
    </div>
  );
}
