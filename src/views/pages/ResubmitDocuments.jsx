import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MailIcon,
  UploadIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  AlertTriangleIcon,
  FileUpIcon
} from 'lucide-react';
import AuthController from '../../controllers/authController';

const initialFormState = {
  businessName: '',
  businessType: '',
  businessAddress: '',
  credentialType: 'TCP'
};

const formatRoleLabel = (role) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const ResubmitDocuments = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    setIsLoading(true);
    const result = await AuthController.initiateResubmission(email.trim());
    setIsLoading(false);

    if (result.success) {
      const data = result.data;
      setUserInfo(data);
      setFormState((prev) => ({
        ...prev,
        businessName: data?.businessInfo?.businessName || '',
        businessType: data?.businessInfo?.businessType || '',
        businessAddress: data?.businessInfo?.businessAddress || '',
        credentialType: data?.credentialType || 'TCP'
      }));
      setFiles({});
      setStep('form');
      showMessage('success', 'Account located. Please upload the required documents to continue.');
    } else {
      showMessage('error', result.error || 'Unable to verify account for resubmission.');
    }
  };

  const handleFileChange = (field, fileList) => {
    setFiles((prev) => ({
      ...prev,
      [field]: fileList && fileList.length > 0 ? fileList[0] : undefined
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateBeforeSubmit = () => {
    if (!userInfo) return 'Missing account context.';

    const requiredFields = (userInfo.requirements || []).map((req) => req.field);
    const missingFiles = requiredFields.filter((field) => !files[field]);

    if (missingFiles.length) {
      return `Please upload: ${missingFiles.map(formatRequirementLabel).join(', ')}`;
    }

    if (userInfo.role === 'admin') {
      const credential = formState.credentialType?.toUpperCase();
      if (!['TCP', 'LPT'].includes(credential)) {
        return 'Please select a valid credential type (TCP or LPT).';
      }
    }

    return null;
  };

  const formatRequirementLabel = (field) => {
    const requirement = (userInfo?.requirements || []).find((req) => req.field === field);
    if (requirement) {
      return requirement.label;
    }
    return field;
  };

  const handleResubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    const validationError = validateBeforeSubmit();
    if (validationError) {
      showMessage('error', validationError);
      return;
    }

    const formData = new FormData();
    formData.append('email', email.trim());

    if (userInfo.role === 'student') {
      formData.append('studentId', files.studentId);
    } else if (userInfo.role === 'seller') {
      formData.append('birCertificate', files.birCertificate);
      formData.append('businessPermit', files.businessPermit);
      formData.append('businessName', formState.businessName);
      formData.append('businessType', formState.businessType);
      formData.append('businessAddress', formState.businessAddress);
    } else if (userInfo.role === 'admin') {
      formData.append('teachingCredential', files.teachingCredential);
      formData.append('credentialType', formState.credentialType.toUpperCase());
    }

    setIsLoading(true);
    const result = await AuthController.submitResubmission(formData);
    setIsLoading(false);

    if (result.success) {
      setStep('success');
      showMessage('success', result.message || 'Documents resubmitted successfully.');
    } else {
      showMessage('error', result.error || 'Failed to resubmit documents.');
    }
  };

  const resetFlow = () => {
    setStep('email');
    setUserInfo(null);
    setFiles({});
    setFormState(initialFormState);
    setMessage(null);
  };

  const renderRequirements = () => (
    <div className="mt-6 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <FileUpIcon size={16} /> Required uploads
      </h3>
      <ul className="mt-2 space-y-2 text-sm text-gray-600">
        {(userInfo?.requirements || []).map((req) => (
          <li key={req.field}>
            <span className="font-medium text-gray-700">{req.label}:</span> {req.description}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <MailIcon className="mx-auto h-14 w-14 text-blue-600" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Resubmit Your Documents</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your registered email address to review your account status and upload updated documents.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-md p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Registered email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Checking account...' : 'Continue'}
            </button>
            <p className="text-xs text-gray-500 text-center">
              Only accounts with a rejected status can resubmit documents.
            </p>
            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                Back to login
              </Link>
            </div>
          </form>
        )}

        {step === 'form' && userInfo && (
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account details</h2>
                <p className="text-sm text-gray-500">Review the rejection reason and upload updated documents.</p>
              </div>
              <button
                type="button"
                onClick={resetFlow}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon size={16} /> Change email
              </button>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700">Account summary</h3>
                  <dl className="mt-3 space-y-2 text-sm text-slate-600">
                    <div>
                      <dt className="font-medium text-slate-700">Name</dt>
                      <dd>{userInfo.fullName || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700">Email</dt>
                      <dd>{userInfo.email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700">Account type</dt>
                      <dd>{formatRoleLabel(userInfo.role)}</dd>
                    </div>
                  </dl>
                  {userInfo.rejectionReason && (
                    <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      <div className="flex items-center gap-2 font-medium">
                        <AlertTriangleIcon size={16} /> Rejection reason
                      </div>
                      <p className="mt-1">{userInfo.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-5 text-sm text-blue-800">
                  <h3 className="font-semibold text-blue-900">How resubmission works</h3>
                  <p className="mt-2">
                    Upload the updated documents listed below. Once submitted, your account will return to pending status and our validation team will review the new files.
                  </p>
                  <p className="mt-2">
                    You&apos;ll receive an email notification when the review is complete.
                  </p>
                </div>
              </div>

              {renderRequirements()}

              <form onSubmit={handleResubmit} className="space-y-5">
                {userInfo.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Updated student ID
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('studentId', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isLoading}
                      required
                    />
                  </div>
                )}

                {userInfo.role === 'seller' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BIR certificate
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('birCertificate', e.target.files)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business permit
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('businessPermit', e.target.files)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business name
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formState.businessName}
                        onChange={handleInputChange}
                        placeholder="CampusCoin Café"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business type
                      </label>
                      <input
                        type="text"
                        name="businessType"
                        value={formState.businessType}
                        onChange={handleInputChange}
                        placeholder="Food & Beverage"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business address
                      </label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={formState.businessAddress}
                        onChange={handleInputChange}
                        placeholder="123 Campus Avenue"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                )}

                {userInfo.role === 'admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teaching credential (TCP or LPT)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('teachingCredential', e.target.files)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credential type
                      </label>
                      <select
                        name="credentialType"
                        value={formState.credentialType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={isLoading}
                        required
                      >
                        <option value="TCP">TCP</option>
                        <option value="LPT">LPT</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    <ArrowLeftIcon size={16} /> Start over
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Uploading...'
                    ) : (
                      <>
                        <UploadIcon size={16} /> Submit documents
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white shadow rounded-lg p-8 text-center space-y-4">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Documents received</h2>
            <p className="text-sm text-gray-600">
              Thanks for resubmitting your documents. Your account has been moved back to pending status. Our validation team will review your files shortly and notify you by email.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Return to login
              </Link>
              <button
                type="button"
                onClick={resetFlow}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Submit for another account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResubmitDocuments;
