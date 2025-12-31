'use client';
import { Clock, User, X } from 'lucide-react';

interface AuditTrailProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

export function AuditTrail({ isOpen, onClose, applicationId }: AuditTrailProps) {
  if (!isOpen) return null;

  // Mock audit trail data
  const auditLogs = [
    {
      timestamp: '2025-01-23 14:30:45',
      actor: 'National Head - Business',
      action: 'Approved Deviation',
      field: 'RM Tagging',
      oldValue: 'Deepak Rao',
      newValue: 'Amit Sharma',
      comments: 'Approved due to territory transfer'
    },
    {
      timestamp: '2025-01-23 10:15:22',
      actor: 'Priya Sharma (State Head)',
      action: 'Raised Deviation',
      field: 'RM Tagging',
      oldValue: 'Deepak Rao',
      newValue: 'Amit Sharma',
      comments: 'Employee transferred to Chennai branch'
    },
    {
      timestamp: '2025-01-17 09:20:10',
      actor: 'System Auto-Tag',
      action: 'Initial Tagging',
      field: 'All Roles',
      oldValue: null,
      newValue: 'RM: Deepak Rao, BM: Priya Singh, BCM: Ravi Verma, CSO: Sunita Reddy',
      comments: 'Automatic tagging based on branch hierarchy'
    },
    {
      timestamp: '2025-01-17 09:18:33',
      actor: 'Customer Application',
      action: 'Application Created',
      field: 'Status',
      oldValue: null,
      newValue: 'Eligible',
      comments: 'New loan application submitted'
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-900 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-indigo-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-indigo-800">Audit Trail</h3>
            <p className="text-slate-400 mt-1">Application: {applicationId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-indigo-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {auditLogs.map((log, index) => (
              <div key={index} className="bg-white border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-indigo-800" />
                  </div>
                  <div className="flex-1">
                    <p className="text-indigo-800">{log.action}</p>
                    <p className="text-slate-600">{log.actor}</p>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{log.timestamp}</span>
                  </div>
                </div>

                {/* Field Changed */}
                <div className="bg-indigo-50 rounded p-3 mb-2">
                  <p className="text-indigo-800 mb-2">Field: {log.field}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-600 mb-1">Old Value</p>
                      <div className="bg-white border border-indigo-200 rounded px-2 py-1">
                        <p className="text-slate-600">{log.oldValue || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">New Value</p>
                      <div className="bg-white border border-emerald-200 rounded px-2 py-1">
                        <p className="text-emerald-600">{log.newValue}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                {log.comments && (
                  <div className="text-slate-600">
                    <p className="text-xs text-slate-500 mb-1">Comments:</p>
                    <p className="italic">{log.comments}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
