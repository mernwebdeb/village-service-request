import SubmissionConfirmation from '../components/SubmissionConfirmation';
import { useState } from 'react';
import validateRequest from '../utils/validateRequest';
import { submitRequest } from '../services/requestService';
import './SubmitRequest.css';

const SubmitRequest = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    urgency: 'medium',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRequest(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setLoading(true);

    try {
      await submitRequest(formData);
      setSuccess(true);
      setFormData({
        title: '',
        category: '',
        description: '',
        location: '',
        urgency: 'medium',
      });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to submit request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <SubmissionConfirmation onNewRequest={() => setSuccess(false)} />;
  }

  return (
    <div className="submit-request-container">
      <h2 className="form-title">Submit Service Request</h2>
      <p className="form-subtitle">
        Raise a new request for your village service needs
      </p>

      {submitError && <div className="submit-error">{submitError}</div>}

      <form className="request-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Request Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Broken Street Light"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'input-error' : ''}
          >
            <option value="">Select a category</option>
            <option value="water">Water Supply</option>
            <option value="electricity">Electricity</option>
            <option value="roads">Roads & Infrastructure</option>
            <option value="sanitation">Sanitation</option>
            <option value="health">Health Services</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Describe your issue in detail..."
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'input-error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="e.g. Near Village School, Ward 3"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'input-error' : ''}
          />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="urgency">Urgency Level</label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default SubmitRequest;