'use client';
import { useState, useEffect } from 'react';
import { Upload, Download, CheckCircle, XCircle, FileText, AlertCircle, Inbox } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/Modal';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { uploadDocket, listDockets, DocketUploadResponse } from '@/lib/incentive-api';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDisplayName } from '@/lib/permissions';

interface HoldCaseUploadProps {
  userRole: string;
}

export function HoldCaseUpload({ userRole }: HoldCaseUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DocketUploadResponse | null>(null);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [uploadResultsCache, setUploadResultsCache] = useState<Map<string, DocketUploadResponse>>(new Map());
  const { error, success } = useToast();
  const { user } = useAuth();

  // Fetch upload history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await listDockets({ page_size: 1000 }); // Get more records to group properly
      if (response.success && response.data) {
        // Group by upload_batch_id to show history
        const batches = new Map<string, any>();
        response.data.results.forEach((docket: any) => {
          const batchId = docket.upload_batch_id;
          if (batchId) {
            if (!batches.has(batchId)) {
              // Check if we have cached upload result data for this batch
              const cachedResult = uploadResultsCache.get(batchId);
              batches.set(batchId, {
                uploadId: batchId,
                uploadedBy: docket.uploaded_by_name || docket.uploaded_by_code || docket.uploaded_by || 'Unknown',
                date: docket.created_at ? new Date(docket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
                dateTimestamp: docket.created_at ? new Date(docket.created_at).getTime() : 0,
                totalRecords: cachedResult?.total_rows || 0,
                successful: cachedResult?.created || 0,
                failed: cachedResult?.errors || 0,
                hasCachedData: !!cachedResult,
                recordCount: 0, // Count of records from listDockets
              });
            }
            // Count records from listDockets (these are successful records that exist in DB)
            const batch = batches.get(batchId)!;
            batch.recordCount++;
            
            // If no cached data, use calculated values from listDockets
            if (!batch.hasCachedData) {
              batch.totalRecords = batch.recordCount;
              batch.successful = batch.recordCount;
              // We can't know failed count from listDockets alone, so it stays 0
            }
          }
        });
        // Sort by date (newest first)
        const historyArray = Array.from(batches.values()).sort((a, b) => {
          return b.dateTimestamp - a.dateTimestamp;
        });
        setUploadHistory(historyArray);
      }
    } catch (err: any) {
      console.error('Failed to load upload history:', err);
      error('Failed to load upload history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowValidation(false);
      setUploadResult(null);
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const response = await uploadDocket(selectedFile);
      if (response.success && response.data) {
        setUploadResult(response.data);
        setShowValidation(true);
        success(`Upload successful: ${response.data.created} created, ${response.data.errors} errors`);
        
        // Cache the upload result for history
        if (response.data.batch_id) {
          setUploadResultsCache(prev => {
            const newCache = new Map(prev);
            newCache.set(response.data.batch_id, response.data);
            return newCache;
          });
          
          // Add new upload to history immediately with actual data from response
          const currentUserName = user ? getUserDisplayName(user) : 'You';
          const newUpload = {
            uploadId: response.data.batch_id,
            uploadedBy: currentUserName,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            dateTimestamp: Date.now(),
            totalRecords: response.data.total_rows || 0,
            successful: response.data.created || 0,
            failed: response.data.errors || 0,
          };
          setUploadHistory(prev => [newUpload, ...prev]);
        }
        
        // Refresh history after a delay to get updated data from server
        setTimeout(() => {
          fetchHistory();
        }, 1500);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err: any) {
      error(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCommitUpload = () => {
    setShowValidation(false);
    setSelectedFile(null);
    setUploadResult(null);
  };

  const handleDownloadTemplate = () => {
    console.log('Downloading template...');
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-indigo-800 mb-2">Hold Cases Upload</h1>
        <p className="text-slate-400">Upload cases on hold with reasons and resolution dates</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-indigo-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-indigo-800">Upload CSV File</h3>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors font-['Geist:Medium',sans-serif]"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {/* File Upload Dropzone */}
        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center mb-6">
          <input
            type="file"
            id="csv-upload"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            {selectedFile ? (
              <div>
                <p className="text-indigo-800 mb-2">{selectedFile.name}</p>
                <p className="text-slate-400">Click to change file</p>
              </div>
            ) : (
              <>
                <p className="text-indigo-800 mb-2">Click to upload or drag and drop</p>
                <p className="text-slate-400">CSV or Excel files only (max 5MB)</p>
              </>
            )}
          </label>
        </div>

        {/* Template Info */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <h4 className="text-indigo-800 mb-3">Required Fields in Upload File</h4>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-800">•</span>
              <span><strong>Application ID</strong> - Unique application identifier</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-800">•</span>
              <span><strong>Hold Reason</strong> - Reason for placing on hold</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-800">•</span>
              <span><strong>Expected Resolution Date</strong> - Date when hold will be resolved (YYYY-MM-DD)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-800">•</span>
              <span><strong>Comments</strong> - Additional notes (optional)</span>
            </li>
          </ul>
        </div>

        {/* Validate Button */}
        {selectedFile && !showValidation && (
          <button
            onClick={handleValidate}
            disabled={uploading}
            className="w-full px-6 py-3 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 transition-colors font-['Geist:Medium',sans-serif] disabled:bg-indigo-400"
          >
            {uploading ? 'Validating...' : 'Validate Upload'}
          </button>
        )}
      </div>

      {/* Validation Results */}
      {showValidation && (
        <div className="bg-white border border-indigo-200 rounded-lg p-6 mb-6">
          <h3 className="text-indigo-800 mb-4">Validation Results</h3>
          
          {/* Summary Cards */}
          {uploadResult && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-slate-600 mb-1">Total Records</p>
                  <p className="text-indigo-800">{uploadResult.total_rows}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-slate-600 mb-1">Created</p>
                  <p className="text-emerald-800">{uploadResult.created}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-slate-600 mb-1">Errors</p>
                  <p className="text-red-800">{uploadResult.errors}</p>
                </div>
              </div>

              {/* Error Details */}
              {uploadResult.errors > 0 && uploadResult.error_details && uploadResult.error_details.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="text-red-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Failed Records
                  </h4>
                  <div className="space-y-2">
                    {uploadResult.error_details.map((error: any, index: number) => (
                      <div key={index} className="flex gap-3 text-slate-600">
                        <span className="font-['Geist:Medium',sans-serif]">Row {error.row || index + 1}:</span>
                        <span>{error.error || JSON.stringify(error)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadResult.created > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                  <h4 className="text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {uploadResult.created} records uploaded successfully. {uploadResult.applications_updated_to_hold} applications updated to hold status.
                  </h4>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={handleCommitUpload}
                className="w-full px-6 py-3 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 transition-colors font-['Geist:Medium',sans-serif]"
              >
                Close
              </button>
            </>
          )}
        </div>
      )}

      {/* Upload History */}
      <div className="bg-white border border-indigo-200 rounded-lg overflow-hidden">
        <div className="bg-indigo-50 border-b border-indigo-200 p-4">
          <h3 className="text-indigo-800">Upload History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead className="bg-indigo-50 border-b border-indigo-200">
              <tr>
                <th className="px-4 py-3 text-left text-indigo-800">Upload ID</th>
                <th className="px-4 py-3 text-left text-indigo-800">Uploaded By</th>
                <th className="px-4 py-3 text-left text-indigo-800">Date</th>
                <th className="px-4 py-3 text-left text-indigo-800">Total Records</th>
                <th className="px-4 py-3 text-left text-indigo-800">Successful</th>
                <th className="px-4 py-3 text-left text-indigo-800">Failed</th>
                <th className="px-4 py-3 text-left text-indigo-800">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loadingHistory ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <LoadingSpinner size="sm" />
                  </td>
                </tr>
              ) : uploadHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No upload history available
                  </td>
                </tr>
              ) : (
                uploadHistory.map((upload, index) => (
                <tr key={upload.uploadId || index} className={index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                  <td className="px-4 py-3 text-sm text-indigo-800 font-medium">{upload.uploadId || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{upload.uploadedBy || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{upload.date || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{upload.totalRecords || 0}</td>
                  <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{upload.successful || 0}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-medium">{upload.failed || 0}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => {
                        // TODO: Implement view report functionality
                        console.log('View report for:', upload.uploadId);
                      }}
                      className="flex items-center gap-1 text-indigo-800 hover:text-indigo-900 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">View Report</span>
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}