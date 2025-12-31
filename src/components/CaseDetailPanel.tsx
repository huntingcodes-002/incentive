'use client';
import { X, Clock } from 'lucide-react';

interface CaseDetailPanelProps {
  caseData: any;
  onClose: () => void;
  onRaiseDeviation?: () => void;
  userRole: string;
}

export function CaseDetailPanel({ caseData, onClose, onRaiseDeviation, userRole }: CaseDetailPanelProps) {
  const canRaiseDeviation = userRole === 'SH Business' || userRole === 'SH Credit';

  return (
    <div className="fixed right-0 top-0 h-screen w-[500px] bg-white shadow-xl z-50 overflow-y-auto border-l border-gray-200">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <h3 className="text-gray-900">Case Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Case Summary */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-gray-900 mb-3">Case Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Application ID:</span>
              <span className="text-indigo-600">{caseData.applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Name:</span>
              <span className="text-gray-900">{caseData.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="text-gray-900">{caseData.product}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Amount:</span>
              <span className="text-gray-900">₹{caseData.loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Branch:</span>
              <span className="text-gray-900">{caseData.branch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Application Date:</span>
              <span className="text-gray-900">
                {caseData.applicationDate ? new Date(caseData.applicationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </span>
            </div>
            {caseData.disbursalDate && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disbursal Date:</span>
                  <span className="text-gray-900">
                    {new Date(caseData.disbursalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disbursal Number:</span>
                  <span className="text-gray-900">{caseData.disbursalNumber}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Loan Purpose:</span>
              <span className="text-gray-900">{caseData.loanPurpose || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sanctioned Amount:</span>
              <span className="text-gray-900">₹{caseData.sanctionedAmount?.toLocaleString() || '-'}</span>
            </div>
            {caseData.disbursalAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Total Disbursal Amount:</span>
                <span className="text-gray-900">₹{caseData.disbursalAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Role-wise Tagging */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-900 mb-3">Role-wise Tagging</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-600">RM:</span>
              <span className="text-gray-900">{caseData.rmName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-600">BM:</span>
              <span className="text-gray-900">{caseData.bmName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-600">BCM:</span>
              <span className="text-gray-900">{caseData.bcmName || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">CSO:</span>
              <span className="text-gray-900">{caseData.csoName || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-900 mb-3">Timeline</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="w-0.5 h-full bg-gray-200"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="text-indigo-800">Application Created</p>
                <p className="text-slate-400">{caseData.creationDate}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="w-0.5 h-full bg-gray-200"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="text-indigo-800">Tagging Completed</p>
                <p className="text-slate-400">System Auto-Tagged</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-300"></div>
              </div>
              <div className="flex-1">
                <p className="text-indigo-800">Current Status: {caseData.status}</p>
                <p className="text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Last updated: Today
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canRaiseDeviation && (
          <button
            onClick={onRaiseDeviation}
            className="w-full bg-indigo-800 text-white px-4 py-3 rounded-lg hover:bg-indigo-900 transition-colors font-['Geist:Medium',sans-serif]"
          >
            Raise Deviation
          </button>
        )}
      </div>
    </div>
  );
}