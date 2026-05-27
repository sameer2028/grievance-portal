import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  submitGrievance,
  selectGrievanceSubmitting,
  selectGrievanceError,
  selectSubmitSuccess,
  clearSubmitSuccess,
  clearError,
} from '@/store/slices/grievanceSlice';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';
import { useRef } from 'react';
import { grievanceApi } from '@/api/grievanceApi';

const CHAR_LIMITS = { title: 200, description: 2000 };

const DISTRICTS_UP = [
  'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut',
  'Ghaziabad', 'Noida', 'Mathura', 'Bareilly', 'Aligarh', 'Moradabad',
  'Saharanpur', 'Gorakhpur', 'Faizabad', 'Jhansi', 'Muzaffarnagar',
  'Firozabad', 'Hapur', 'Rampur',
];

const SubmitGrievancePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const isSubmitting = useSelector(selectGrievanceSubmitting);
  const apiError = useSelector(selectGrievanceError);
  const submitSuccess = useSelector(selectSubmitSuccess);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: {
      address: '',
      district: '',
      state: 'Uttar Pradesh',
      pincode: '',
    },
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageHash, setImageHash] = useState(null);
  const [attachmentPath, setAttachmentPath] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await grievanceApi.analyzeImage(file);
      setForm(prev => ({
        ...prev,
        title: result.data.title || prev.title,
        description: result.data.description || prev.description
      }));
      setImageHash(result.data.imageHash);
      setAttachmentPath(result.data.attachmentPath);
      setAttachmentPreview(URL.createObjectURL(file));
      setFieldErrors(prev => ({ ...prev, image: '' }));

      toast.success('AI successfully analyzed the image and pre-filled the details!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze image');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImageHash(null);
      setAttachmentPath(null);
      setAttachmentPreview(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle success: show toast and redirect
  useEffect(() => {
    if (submitSuccess) {
      toast.success('Grievance submitted! AI analysis is running in the background.');
      dispatch(clearSubmitSuccess());
      navigate('/grievances/my');
    }
  }, [submitSuccess]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, []);

  const validate = () => {
    const errs = {};
    if (!imageHash)
      errs.image = 'You must upload a photo of the issue to proceed.';
    if (!form.title.trim() || form.title.trim().length < 10)
      errs.title = 'Title must be at least 10 characters';
    if (!form.description.trim() || form.description.trim().length < 30)
      errs.description = 'Description must be at least 30 characters';
    if (form.location.pincode && !/^\d{6}$/.test(form.location.pincode))
      errs.pincode = 'Enter a valid 6-digit pincode';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    dispatch(submitGrievance({ 
      ...form, 
      imageHash,
      attachments: attachmentPath ? [attachmentPath] : [] 
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, location: { ...prev.location, [key]: value } }));
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const remaining = (field) => CHAR_LIMITS[field] - form[field].length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit a Grievance</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Describe your issue clearly. Our AI will automatically classify and route it to the right department.
        </p>
      </div>

      {/* AI info banner */}
      <div className="mb-6 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg flex items-start gap-3 text-sm text-violet-700 dark:text-violet-300">
        <span className="text-lg shrink-0">🤖</span>
        <div>
          <strong>AI-powered routing:</strong> After submission, our system will automatically
          classify your grievance, detect urgency, and route it to the appropriate department within seconds.
        </div>
      </div>

      {/* AI Image Upload */}
      <div className={`mb-6 card !p-5 border-dashed border-2 ${fieldErrors.image ? 'border-red-400 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10' : 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'} transition-colors`}>
        <div className="text-center">
          <div className="mb-3 text-3xl">📸</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Upload Issue Photo <span className="text-red-500">*</span></h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-lg mx-auto">
            It is mandatory to attach proof of the issue. Our AI will automatically analyze the photo to write the title and description for you.
          </p>

          {attachmentPreview ? (
            <div className="relative inline-block mt-2 mb-2">
              <img src={attachmentPreview} alt="Preview" className="h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
              <button 
                type="button" 
                onClick={() => {
                   setAttachmentPreview(null);
                   setAttachmentPath(null);
                   setImageHash(null);
                   if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
                disabled={isAnalyzing}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="btn-secondary"
              >
                {isAnalyzing ? <><Spinner size="sm" /> Analyzing Image...</> : 'Select Photo'}
              </button>
            </>
          )}

          {fieldErrors.image && <p className="mt-2 text-sm text-red-600 font-medium">{fieldErrors.image}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* API error */}
        {apiError && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
            {apiError}
          </div>
        )}

        {/* Title */}
        <div className="card !p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-3">
            Grievance Details
          </h2>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0" htmlFor="title">Title *</label>
              <span className={`text-xs ${remaining('title') < 20 ? 'text-orange-500' : 'text-gray-400'}`}>
                {remaining('title')} left
              </span>
            </div>
            <input
              id="title" name="title" type="text"
              value={form.title} onChange={handleChange}
              maxLength={CHAR_LIMITS.title}
              placeholder="e.g. No water supply in our colony for 3 days"
              className={`input ${fieldErrors.title ? 'input-error' : ''}`}
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
            <p className="mt-1 text-xs text-gray-400">
              Be specific — mention the issue, location reference, and duration if applicable.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0" htmlFor="description">Detailed Description *</label>
              <span className={`text-xs ${remaining('description') < 100 ? 'text-orange-500' : 'text-gray-400'}`}>
                {remaining('description')} left
              </span>
            </div>
            <textarea
              id="description" name="description"
              value={form.description} onChange={handleChange}
              maxLength={CHAR_LIMITS.description}
              rows={6}
              placeholder="Describe the problem in detail. Include when it started, who is affected, any previous complaints, and what resolution you expect."
              className={`input resize-none ${fieldErrors.description ? 'input-error' : ''}`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="card !p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">
            Location <span className="text-gray-400 font-normal text-sm">(recommended)</span>
          </h2>

          <div>
            <label className="label" htmlFor="address">Street / Area address</label>
            <input
              id="address" name="location.address" type="text"
              value={form.location.address} onChange={handleChange}
              placeholder="e.g. 23 Gandhi Marg, Hazratganj"
              className="input"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="district">District</label>
              <select
                id="district" name="location.district"
                value={form.location.district} onChange={handleChange}
                className="input"
              >
                <option value="">Select district</option>
                {DISTRICTS_UP.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="pincode">Pincode</label>
              <input
                id="pincode" name="location.pincode" type="text"
                value={form.location.pincode} onChange={handleChange}
                placeholder="226001"
                maxLength={6}
                className={`input ${fieldErrors.pincode ? 'input-error' : ''}`}
              />
              {fieldErrors.pincode && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.pincode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">State</label>
            <input
              type="text" value="Uttar Pradesh" disabled
              className="input bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-8 py-2.5"
          >
            {isSubmitting ? (
              <><Spinner size="sm" /> Submitting...</>
            ) : (
              'Submit Grievance'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary px-6 py-2.5"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-400">
          * Required fields. After submission, you'll receive a unique ticket number to track progress.
        </p>
      </form>
    </div>
  );
};

export default SubmitGrievancePage;
