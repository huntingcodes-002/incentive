'use client';

import { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { uploadSalary, SalaryUploadResponse } from '@/lib/incentive-api';
import { useToast } from '@/hooks/useToast';

export function UploadSalary() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<SalaryUploadResponse | null>(null);
  const { error, success } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        error('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadSalary(selectedFile);
      if (response.success && response.data) {
        setUploadResult(response.data);
        const { created, updated, errors } = response.data;
        const successMsg = `Upload successful: ${created} created, ${updated} updated, ${errors} errors`;
        success(successMsg);
        // Clear file selection after successful upload
        setSelectedFile(null);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err: any) {
      error(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template matching the expected format
    const template = `Employee Code,Employee Name,Monthly_salary
EMP001,John Doe,50000
EMP002,Jane Smith,75000
EMP003,Bob Johnson,60000
EMP004,Alice Williams,80000
EMP005,Charlie Brown,45000`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'salary_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1 text-2xl font-semibold">Upload Salary</h1>
        <p className="text-gray-500 text-sm">Upload employee salary data via CSV file</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Choose CSV file or drag and drop'}
                  </span>
                </div>
              </label>
              {selectedFile && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                  disabled={uploading}
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Required columns: Employee Code, Employee Name, Monthly_salary
            </p>
            <p className="mt-1 text-xs text-gray-400">
              CSV format: Employee Code,Employee Name,Monthly_salary
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Upload Results
          </h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Total Rows</p>
              <p className="text-lg font-semibold text-gray-900">{uploadResult.total_rows}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Created</p>
              <p className="text-lg font-semibold text-green-700">{uploadResult.created}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Updated</p>
              <p className="text-lg font-semibold text-amber-700">{uploadResult.updated}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Errors</p>
              <p className="text-lg font-semibold text-red-700">{uploadResult.errors}</p>
            </div>
          </div>

          {/* Error Details */}
          {uploadResult.error_details && uploadResult.error_details.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Error Details ({uploadResult.error_details.length})
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                <ul className="space-y-1">
                  {uploadResult.error_details.map((error, index) => (
                    <li key={index} className="text-xs text-red-700">
                      {error.employee_code ? `Employee ${error.employee_code}: ` : error.row ? `Row ${error.row}: ` : ''}
                      {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Skipped Employees */}
          {uploadResult.skipped_employees && uploadResult.skipped_employees.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Skipped Employees ({uploadResult.skipped_employees.length})
              </h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                <ul className="space-y-1">
                  {uploadResult.skipped_employees.map((employeeCode, index) => (
                    <li key={index} className="text-xs text-amber-700">
                      {employeeCode}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

