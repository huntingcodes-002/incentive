import { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';

export function MobileHoldCaseUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('idle');
    }
  };

  const handleProcess = () => {
    setUploadStatus('processing');
    setTimeout(() => {
      setUploadStatus('success');
    }, 2000);
  };

  const downloadTemplate = () => {
    alert('Template download started...');
  };

  return (
    <div className="p-3 pb-20">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-gray-900 mb-1">Hold Case Upload</h1>
        <p className="text-gray-500 text-xs">Upload hold cases list for incentive processing</p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-900 text-xs">Admin/Ops Only</p>
          <p className="text-blue-700 text-xs mt-1">Upload Excel files with hold cases to exclude from incentive calculations</p>
        </div>
      </div>

      {/* Download Template */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-gray-900 text-sm mb-2">Step 1: Download Template</h3>
        <p className="text-gray-600 text-xs mb-3">Download the Excel template and fill in hold case details</p>
        <button
          onClick={downloadTemplate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Download Excel Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-gray-900 text-sm mb-2">Step 2: Upload Filled Template</h3>
        <p className="text-gray-600 text-xs mb-3">Upload the completed Excel file with hold cases</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3">
          <input
            type="file"
            id="hold-file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
          />
          <label htmlFor="hold-file-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mb-1">
              {uploadedFile ? uploadedFile.name : 'Tap to upload Excel file'}
            </p>
            <p className="text-gray-400 text-xs">XLSX, XLS (Max 10MB)</p>
          </label>
        </div>

        {uploadedFile && uploadStatus === 'idle' && (
          <button
            onClick={handleProcess}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Process Upload
          </button>
        )}

        {uploadStatus === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-900 text-xs">Processing file...</span>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-emerald-900 text-sm">Upload Successful!</p>
              <p className="text-emerald-700 text-xs">45 hold cases processed and marked</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Uploads */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-gray-900 text-sm mb-3">Recent Uploads</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-900 text-xs">hold_cases_jan2025.xlsx</p>
                <p className="text-gray-500 text-xs">Jan 15, 2025 - 45 cases</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-900 text-xs">hold_cases_dec2024.xlsx</p>
                <p className="text-gray-500 text-xs">Dec 20, 2024 - 38 cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
