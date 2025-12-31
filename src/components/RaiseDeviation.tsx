'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, Upload, X } from 'lucide-react';
import { raiseDeviation, getApplication, RaiseDeviationRequest } from '@/lib/incentive-api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

interface RaiseDeviationProps {
  userRole: string;
  preSelectedCase?: string;
}

export function RaiseDeviation({ userRole, preSelectedCase }: RaiseDeviationProps) {
  const [selectedCase, setSelectedCase] = useState(preSelectedCase || '');
  const [rmTagging, setRmTagging] = useState('');
  const [bmTagging, setBmTagging] = useState('');
  const [bcmTagging, setBcmTagging] = useState('');
  const [csoTagging, setCsoTagging] = useState('');
  const [productTagging, setProductTagging] = useState('');
  const [contributionType, setContributionType] = useState('');
  const [eligibilityReason, setEligibilityReason] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [loadingCase, setLoadingCase] = useState(false);
  const { success, error } = useToast();

  // Determine which hierarchy the user belongs to
  const isBusinessHierarchy = userRole === 'SH Business';
  const isCreditHierarchy = userRole === 'SH Credit';

  // Fetch case data when preSelectedCase is provided
  useEffect(() => {
    if (preSelectedCase) {
      setLoadingCase(true);
      getApplication(preSelectedCase)
        .then(response => {
          if (response.success && response.data) {
            setCaseData(response.data);
          }
        })
        .catch(err => {
          error('Failed to load case details');
        })
        .finally(() => {
          setLoadingCase(false);
        });
    }
  }, [preSelectedCase, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Determine deviation type based on hierarchy
      let deviationType: 'mapping_business' | 'mapping_credit' | 'tagging' | 'other' = 'tagging';
      if (isBusinessHierarchy) {
        deviationType = 'mapping_business';
      } else if (isCreditHierarchy) {
        deviationType = 'mapping_credit';
      }

      const requestData: RaiseDeviationRequest = {
        case_id: selectedCase || preSelectedCase || '',
        deviation_type: deviationType,
        proposed_mapping: {
          ...(rmTagging && { proposed_rm: rmTagging }),
          ...(bmTagging && { proposed_bm: bmTagging }),
          ...(bcmTagging && { proposed_bcm: bcmTagging }),
          ...(csoTagging && { proposed_co: csoTagging }),
        },
        reason: comments || eligibilityReason,
        supporting_docs: file ? [file.name] : [],
      };

      const response = await raiseDeviation(requestData);
      
      if (response.success) {
        setShowSuccess(true);
        success('Deviation raised successfully');
        setTimeout(() => {
          setShowSuccess(false);
          // Reset form
          setRmTagging('');
          setBmTagging('');
          setBcmTagging('');
          setCsoTagging('');
          setEligibilityReason('');
          setComments('');
          setFile(null);
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to raise deviation');
      }
    } catch (err: any) {
      error(err.message || 'Failed to raise deviation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-indigo-800 mb-2">Raise Tagging Deviation</h1>
        <p className="text-slate-400">
          {isBusinessHierarchy && 'Submit corrections for RM & BM tagging (Business Hierarchy)'}
          {isCreditHierarchy && 'Submit corrections for BCM & CSO tagging (Credit Hierarchy)'}
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-emerald-800">Deviation Raised Successfully!</p>
            <p className="text-emerald-600">
              Your deviation request has been sent to {isBusinessHierarchy ? 'National Business Head' : 'National Credit Head'} for approval.
            </p>
          </div>
        </div>
      )}

      {loadingCase ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Case Summary Card */}
          {caseData && (
            <div className="bg-white border border-indigo-200 rounded-lg p-6 mb-6">
              <h3 className="text-indigo-800 mb-4">Case Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-600 mb-1">Application ID</p>
                  <p className="text-indigo-800">{caseData.application_number}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Customer Name</p>
                  <p className="text-indigo-800">{caseData.customer_name}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Product</p>
                  <p className="text-indigo-800">{caseData.product_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Loan Amount</p>
                  <p className="text-indigo-800">₹{parseFloat(caseData.requested_loan_amount || '0').toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Branch</p>
                  <p className="text-indigo-800">{caseData.branch_name || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

        {/* Current vs Proposed Tagging */}
        <div className="bg-white border border-indigo-200 rounded-lg p-6 mb-6">
          <h3 className="text-indigo-800 mb-4">Tagging Details</h3>
          
          <div className="space-y-4">
            {/* Business Hierarchy - RM & BM Tagging */}
            {isBusinessHierarchy && (
              <>
                {/* RM Tagging */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-2">Current RM</label>
                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-indigo-800">{caseData?.sourcing_rm_name || caseData?.sourcing_rm || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-indigo-800 mb-2">Proposed RM *</label>
                    <select
                      value={rmTagging}
                      onChange={(e) => setRmTagging(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select RM</option>
                      <option value="Deepak Rao">Deepak Rao</option>
                      <option value="Amit Sharma">Amit Sharma</option>
                      <option value="Vikram Joshi">Vikram Joshi</option>
                      <option value="Rahul Gupta">Rahul Gupta</option>
                      <option value="Sneha Kulkarni">Sneha Kulkarni</option>
                    </select>
                  </div>
                </div>

                {/* BM Tagging */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-2">Current BM</label>
                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-indigo-800">{caseData?.sourcing_bm_name || caseData?.sourcing_bm || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-indigo-800 mb-2">Proposed BM *</label>
                    <select
                      value={bmTagging}
                      onChange={(e) => setBmTagging(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select BM</option>
                      <option value="Priya Singh">Priya Singh</option>
                      <option value="Anjali Mehta">Anjali Mehta</option>
                      <option value="Rohit Desai">Rohit Desai</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Credit Hierarchy - BCM & CSO Tagging */}
            {isCreditHierarchy && (
              <>
                {/* BCM Tagging */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-2">Current BCM</label>
                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-indigo-800">{caseData?.sourcing_bcm_name || caseData?.sourcing_bcm || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-indigo-800 mb-2">Proposed BCM *</label>
                    <select
                      value={bcmTagging}
                      onChange={(e) => setBcmTagging(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select BCM</option>
                      <option value="Ravi Verma">Ravi Verma</option>
                      <option value="Sanjay Kumar">Sanjay Kumar</option>
                      <option value="Manoj Jain">Manoj Jain</option>
                    </select>
                  </div>
                </div>

                {/* CSO Tagging */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-2">Current CSO</label>
                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-indigo-800">{caseData?.sourcing_co_name || caseData?.sourcing_co || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-indigo-800 mb-2">Proposed CSO *</label>
                    <select
                      value={csoTagging}
                      onChange={(e) => setCsoTagging(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select CSO</option>
                      <option value="Sunita Reddy">Sunita Reddy</option>
                      <option value="Kavita Sharma">Kavita Sharma</option>
                      <option value="Neeta Rao">Neeta Rao</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Product Tagging */}
            <div>
              <label className="block text-indigo-800 mb-2">Product Tagging</label>
              <select
                value={productTagging}
                onChange={(e) => setProductTagging(e.target.value)}
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Keep Current</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Auto Loan">Auto Loan</option>
                <option value="Gold Loan">Gold Loan</option>
              </select>
            </div>

            {/* Contribution Type */}
            <div>
              <label className="block text-indigo-800 mb-2">Contribution Type</label>
              <select
                value={contributionType}
                onChange={(e) => setContributionType(e.target.value)}
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Type</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Support">Support</option>
              </select>
            </div>

            {/* Eligibility Reason */}
            <div>
              <label className="block text-indigo-800 mb-2">Eligibility Reason *</label>
              <textarea
                value={eligibilityReason}
                onChange={(e) => setEligibilityReason(e.target.value)}
                required
                rows={3}
                placeholder="Explain why this deviation is required..."
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Comments */}
            <div>
              <label className="block text-indigo-800 mb-2">Additional Comments *</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
                rows={4}
                placeholder="Provide detailed justification for the deviation..."
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-indigo-800 mb-2">Supporting Document (Optional)</label>
              <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xlsx,.xls"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-indigo-800">{file.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-indigo-800 mb-1">Click to upload or drag and drop</p>
                      <p className="text-slate-400">PDF, DOC, DOCX, XLS, XLSX (max 10MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 transition-colors font-['Geist:Medium',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Deviation'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRmTagging('');
              setBmTagging('');
              setBcmTagging('');
              setCsoTagging('');
              setEligibilityReason('');
              setComments('');
              setFile(null);
            }}
            className="px-6 py-3 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors font-['Geist:Medium',sans-serif]"
          >
            Cancel
          </button>
        </div>
        </form>
      )}
    </div>
  );
}