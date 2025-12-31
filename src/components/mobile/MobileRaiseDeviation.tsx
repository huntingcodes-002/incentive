import { useState } from 'react';
import { AlertCircle, Upload, FileText, ChevronLeft } from 'lucide-react';

interface MobileRaiseDeviationProps {
  selectedCaseId?: string;
  onBack?: () => void;
  userRole?: string;
}

export function MobileRaiseDeviation({ selectedCaseId, onBack, userRole = 'SH Business' }: MobileRaiseDeviationProps) {
  const [selectedCase, setSelectedCase] = useState(selectedCaseId || '');
  const [rmTagging, setRmTagging] = useState('');
  const [bmTagging, setBmTagging] = useState('');
  const [bcmTagging, setBcmTagging] = useState('');
  const [csoTagging, setCsoTagging] = useState('');
  const [eligibilityReason, setEligibilityReason] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Determine which hierarchy the user belongs to
  const isBusinessHierarchy = userRole === 'SH Business';
  const isCreditHierarchy = userRole === 'SH Credit';

  // Mock case data
  const caseData = {
    applicationId: 'APP2025003',
    customerName: 'Suresh Reddy',
    product: 'Business Loan',
    loanAmount: 750000,
    branch: 'Bangalore East',
    currentRM: 'Deepak Rao',
    currentBM: 'Priya Singh',
    currentBCM: 'Ravi Verma',
    currentCSO: 'Sunita Reddy'
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    alert(`Deviation request submitted successfully to ${isBusinessHierarchy ? 'National Business Head' : 'National Credit Head'}!`);
    setRmTagging('');
    setBmTagging('');
    setBcmTagging('');
    setCsoTagging('');
    setEligibilityReason('');
    setUploadedFile(null);
  };

  return (
    <div className="p-3 pb-20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {onBack && (
          <button onClick={onBack} className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-gray-900 mb-0.5">Raise Deviation</h1>
          <p className="text-gray-500 text-xs">
            {isBusinessHierarchy && 'RM & BM Tagging (Business Hierarchy)'}
            {isCreditHierarchy && 'BCM & CSO Tagging (Credit Hierarchy)'}
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-900 text-xs">
            {isBusinessHierarchy ? 'National Business Head' : 'National Credit Head'} Approval Required
          </p>
          <p className="text-amber-700 text-xs mt-1">
            {isBusinessHierarchy && 'Submit RM & BM tagging corrections for approval'}
            {isCreditHierarchy && 'Submit BCM & CSO tagging corrections for approval'}
          </p>
        </div>
      </div>

      {/* Case Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
        <p className="text-gray-700 text-sm mb-3">Case Summary</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Application ID:</span>
            <span className="text-gray-900">{caseData.applicationId}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Customer:</span>
            <span className="text-gray-900">{caseData.customerName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Product:</span>
            <span className="text-gray-900">{caseData.product}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Loan Amount:</span>
            <span className="text-gray-900">₹{caseData.loanAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {/* Business Hierarchy - RM & BM */}
        {isBusinessHierarchy && (
          <>
            {/* RM Tagging */}
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">Current RM</label>
              <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg mb-2">
                <p className="text-indigo-900 text-sm">{caseData.currentRM}</p>
              </div>
              <label className="block text-gray-700 text-sm mb-1.5">Proposed RM *</label>
              <select
                value={rmTagging}
                onChange={(e) => setRmTagging(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select RM</option>
                <option value="Deepak Rao">Deepak Rao</option>
                <option value="Amit Sharma">Amit Sharma</option>
                <option value="Vikram Joshi">Vikram Joshi</option>
                <option value="Rahul Gupta">Rahul Gupta</option>
                <option value="Sneha Kulkarni">Sneha Kulkarni</option>
              </select>
            </div>

            {/* BM Tagging */}
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">Current BM</label>
              <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg mb-2">
                <p className="text-indigo-900 text-sm">{caseData.currentBM}</p>
              </div>
              <label className="block text-gray-700 text-sm mb-1.5">Proposed BM *</label>
              <select
                value={bmTagging}
                onChange={(e) => setBmTagging(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select BM</option>
                <option value="Priya Singh">Priya Singh</option>
                <option value="Anjali Mehta">Anjali Mehta</option>
                <option value="Rohit Desai">Rohit Desai</option>
              </select>
            </div>
          </>
        )}

        {/* Credit Hierarchy - BCM & CSO */}
        {isCreditHierarchy && (
          <>
            {/* BCM Tagging */}
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">Current BCM</label>
              <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg mb-2">
                <p className="text-indigo-900 text-sm">{caseData.currentBCM}</p>
              </div>
              <label className="block text-gray-700 text-sm mb-1.5">Proposed BCM *</label>
              <select
                value={bcmTagging}
                onChange={(e) => setBcmTagging(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select BCM</option>
                <option value="Ravi Verma">Ravi Verma</option>
                <option value="Sanjay Kumar">Sanjay Kumar</option>
                <option value="Manoj Jain">Manoj Jain</option>
              </select>
            </div>

            {/* CSO Tagging */}
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">Current CSO</label>
              <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg mb-2">
                <p className="text-indigo-900 text-sm">{caseData.currentCSO}</p>
              </div>
              <label className="block text-gray-700 text-sm mb-1.5">Proposed CSO *</label>
              <select
                value={csoTagging}
                onChange={(e) => setCsoTagging(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select CSO</option>
                <option value="Sunita Reddy">Sunita Reddy</option>
                <option value="Kavita Sharma">Kavita Sharma</option>
                <option value="Neeta Rao">Neeta Rao</option>
              </select>
            </div>
          </>
        )}

        {/* Justification */}
        <div>
          <label className="block text-gray-700 text-sm mb-1.5">Justification *</label>
          <textarea
            value={eligibilityReason}
            onChange={(e) => setEligibilityReason(e.target.value)}
            placeholder="Provide detailed justification for this deviation..."
            rows={5}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-gray-700 text-sm mb-1.5">Supporting Documents</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-xs mb-1">
                {uploadedFile ? uploadedFile.name : 'Tap to upload documents'}
              </p>
              <p className="text-gray-400 text-xs">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            (isBusinessHierarchy && (!rmTagging || !bmTagging || !eligibilityReason)) ||
            (isCreditHierarchy && (!bcmTagging || !csoTagging || !eligibilityReason))
          }
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Submit Deviation Request
        </button>
      </div>
    </div>
  );
}