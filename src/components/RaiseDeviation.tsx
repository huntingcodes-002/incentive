'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, Upload, X } from 'lucide-react';
import { raiseDeviation, getApplication, RaiseDeviationRequest, getStateEmployees, StateEmployee } from '@/lib/incentive-api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

interface RaiseDeviationProps {
  userRole: string;
  preSelectedCase?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function RaiseDeviation({ userRole, preSelectedCase, onCancel, onSuccess }: RaiseDeviationProps) {
  const [selectedCase, setSelectedCase] = useState(preSelectedCase || '');
  const [rmTagging, setRmTagging] = useState('');
  const [bmTagging, setBmTagging] = useState('');
  const [bcmTagging, setBcmTagging] = useState('');
  const [csoTagging, setCsoTagging] = useState('');
  const [productTagging, setProductTagging] = useState('');
  const [deviationType, setDeviationType] = useState<'mapping_business' | 'mapping_credit'>('mapping_business');
  const [contributionType, setContributionType] = useState('');
  const [eligibilityReason, setEligibilityReason] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [loadingCase, setLoadingCase] = useState(false);

  // State for employee lists
  const [rmList, setRmList] = useState<{ name: string, branch: string, code: string }[]>([]);
  const [bmList, setBmList] = useState<{ name: string, branch: string, code: string }[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const { error: showError, success: showSuccess } = useToast();

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
          showError('Failed to load case details');
        })
        .finally(() => {
          setLoadingCase(false);
        });
    }
  }, [preSelectedCase, showError]);

  // Fetch RM and BM lists for Business Hierarchy
  useEffect(() => {
    if (isBusinessHierarchy) {
      setLoadingEmployees(true);
      getStateEmployees('business')
        .then(response => {
          if (response.success && response.data) {
            const data = response.data;

            // Process RMs
            const rms: { name: string, branch: string, code: string }[] = [];
            if (data["Relationship Managers"]) {
              Object.entries(data["Relationship Managers"]).forEach(([branch, employees]) => {
                employees.forEach((emp: StateEmployee) => {
                  rms.push({
                    name: emp.name,
                    branch: branch,
                    code: emp.employee_code
                  });
                });
              });
            }
            setRmList(rms);

            // Process BMs
            const bms: { name: string, branch: string, code: string }[] = [];
            if (data["Branch Managers"]) {
              Object.entries(data["Branch Managers"]).forEach(([branch, employees]) => {
                employees.forEach((emp: StateEmployee) => {
                  bms.push({
                    name: emp.name,
                    branch: branch,
                    code: emp.employee_code
                  });
                });
              });
            }
            setBmList(bms);
          }
        })
        .catch(err => {
          console.error('Failed to fetch employees:', err);
          showError('Failed to load employee lists');
        })
        .finally(() => {
          setLoadingEmployees(false);
        });
    }
  }, [isBusinessHierarchy, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine deviation type based on hierarchy or user selection
      let finalDeviationType: 'mapping_business' | 'mapping_credit' | 'tagging' | 'other' = 'tagging';
      if (isBusinessHierarchy) {
        // For SH Business, use the selected deviation type from dropdown
        finalDeviationType = deviationType;
      } else if (isCreditHierarchy) {
        finalDeviationType = 'mapping_credit';
      }

      // Build proposed_mapping object (only include non-empty values)
      // Handle "Current RM" and "Current BM" options - use SFID from API
      const proposedMapping: any = {};
      if (rmTagging) {
        if (rmTagging === 'CURRENT_RM') {
          // Use current RM's employee code from API
          proposedMapping.proposed_rm = caseData?.sourcing_rm || '';
        } else {
          // Extract SFID from selected option (format: "Name - Branch - SFID" or similar)
          // The value in dropdown is the employee code
          proposedMapping.proposed_rm = rmTagging;
        }
      }
      if (bmTagging) {
        if (bmTagging === 'CURRENT_BM') {
          // Use current BM's employee code from API
          proposedMapping.proposed_bm = caseData?.sourcing_bm || '';
        } else {
          // The value in dropdown is the employee code
          proposedMapping.proposed_bm = bmTagging;
        }
      }
      if (bcmTagging) proposedMapping.proposed_bcm = bcmTagging;
      if (csoTagging) proposedMapping.proposed_co = csoTagging;

      // Validate required fields
      if (!selectedCase && !preSelectedCase) {
        showError('Please select a case');
        setLoading(false);
        return;
      }

      // Validate deviation type for SH Business
      if (isBusinessHierarchy && !deviationType) {
        showError('Please select a deviation type');
        setLoading(false);
        return;
      }

      if (!comments && !eligibilityReason) {
        showError('Please provide a reason for the deviation');
        setLoading(false);
        return;
      }

      const requestData: RaiseDeviationRequest = {
        case_id: selectedCase || preSelectedCase || '',
        deviation_type: finalDeviationType,
        proposed_mapping: Object.keys(proposedMapping).length > 0 ? proposedMapping : undefined,
        reason: comments || eligibilityReason,
        supporting_docs: file ? [file.name] : [],
      };

      const response = await raiseDeviation(requestData);

      if (response.success) {
        setShowSuccessModal(true);
        showSuccess('Deviation raised successfully');
        // After showing modal, redirect to eligible cases after a delay
        setTimeout(() => {
          setShowSuccessModal(false);
          // Reset form
          setRmTagging('');
          setBmTagging('');
          setBcmTagging('');
          setCsoTagging('');
          setProductTagging('');
          setDeviationType('mapping_business');
          setEligibilityReason('');
          setComments('');
          setFile(null);
          setSelectedCase('');
          // Call onSuccess callback to navigate back to eligible cases
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to raise deviation');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to raise deviation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deviation Submitted</h3>
              <p className="text-sm text-gray-500 mb-6">Your deviation has been successfully submitted.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-indigo-800 mb-2">Raise Tagging Deviation</h1>
        <p className="text-slate-400">
          {isBusinessHierarchy && 'Submit corrections for RM & BM tagging (Business Hierarchy)'}
          {isCreditHierarchy && 'Submit corrections for BCM & CSO tagging (Credit Hierarchy)'}
        </p>
      </div>


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
                        disabled={loadingEmployees}
                      >
                        <option value="">{loadingEmployees ? 'Loading RMs...' : 'Select RM'}</option>
                        <option value="CURRENT_RM">Current RM</option>
                        {rmList.map((rm) => (
                          <option key={rm.code} value={rm.code}>
                            {rm.name} - {rm.branch}
                          </option>
                        ))}
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
                        disabled={loadingEmployees}
                      >
                        <option value="">{loadingEmployees ? 'Loading BMs...' : 'Select BM'}</option>
                        <option value="CURRENT_BM">Current BM</option>
                        {bmList.map((bm) => (
                          <option key={bm.code} value={bm.code}>
                            {bm.name} - {bm.branch}
                          </option>
                        ))}
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

              {/* Deviation Type - Only for SH Business */}
              {isBusinessHierarchy && (
                <div>
                  <label className="block text-indigo-800 mb-2">Deviation Type *</label>
                  <select
                    value={deviationType}
                    onChange={(e) => setDeviationType(e.target.value as 'mapping_business' | 'mapping_credit')}
                    required
                    className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Deviation Type</option>
                    <option value="mapping_business">Business</option>
                    <option value="mapping_credit">Credit</option>
                  </select>
                </div>
              )}

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
                // Reset form
                setRmTagging('');
                setBmTagging('');
                setBcmTagging('');
                setCsoTagging('');
                setProductTagging('');
                setDeviationType('mapping_business');
                setEligibilityReason('');
                setComments('');
                setFile(null);
                setSelectedCase('');
                // Navigate back to eligible cases
                if (onCancel) {
                  onCancel();
                }
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