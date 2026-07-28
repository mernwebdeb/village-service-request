import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestById } from '../services/requestService';
import { getRequestActivityLogs } from '../services/activityLogService';
import { getFeedback, submitFeedback, updateFeedback } from '../services/feedbackService';
import { getUser } from '../utils/auth';
import StatusTracker from '../components/StatusTracker';
import Timeline from '../components/Timeline';
import MessageThread from '../components/MessageThread';
import FeedbackForm from '../components/FeedbackForm';
import './RequestDetail.css';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('timeline');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const user = getUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const reqData = await getRequestById(id);
        setRequest(reqData.request);

        const logData = await getRequestActivityLogs(id);
        setLogs(logData.logs);

        // Fetch feedback if request is resolved
        if (reqData.request.status === 'resolved') {
          try {
            const fbData = await getFeedback(id);
            setFeedback(fbData.feedback);
          } catch (e) {
            // No feedback yet, that's ok
          }
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You are not authorized to view this request.');
        } else if (err.response?.status === 404) {
          setError('Request not found.');
        } else {
          setError('Failed to load request details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFeedbackSubmit = async (data) => {
    if (feedback) {
      const result = await updateFeedback(id, data);
      setFeedback(result.feedback);
      setFeedbackSuccess('Feedback updated successfully!');
    } else {
      const result = await submitFeedback(data);
      setFeedback(result.feedback);
      setFeedbackSuccess('Feedback submitted successfully!');
    }
    setTimeout(() => setFeedbackSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="request-detail-page">
        <div className="detail-loading">Loading request details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="request-detail-page">
        <div className="detail-error">
          <p>{error}</p>
          <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!request) return null;

  const isCitizenOwner = user?.role === 'citizen' && request.citizen?._id === user?._id;
  const showFeedback = request.status === 'resolved' && isCitizenOwner;

  return (
    <div className="request-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <h2>{request.title}</h2>
          <span className={`status-badge status-${request.status}`}>
            {request.status}
          </span>
        </div>

        <StatusTracker currentStatus={request.status} />

        <div className="detail-info-grid">
          <div className="info-item">
            <span className="info-label">Category</span>
            <span className="info-value">{request.category}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location</span>
            <span className="info-value">{request.location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Urgency</span>
            <span className={`urgency-badge urgency-${request.urgency}`}>
              {request.urgency}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Submitted</span>
            <span className="info-value">{new Date(request.createdAt).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Submitted By</span>
            <span className="info-value">{request.citizen?.name || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Assigned To</span>
            <span className="info-value">{request.assignedTo?.name || 'Not assigned'}</span>
          </div>
        </div>

        <div className="detail-description-section">
          <h3>Description</h3>
          <p>{request.description}</p>
        </div>

        {request.resolutionNote && (
          <div className="detail-resolution-section">
            <h3>Resolution Note</h3>
            <p>{request.resolutionNote}</p>
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="feedback-section">
          {feedbackSuccess && <div className="feedback-success">{feedbackSuccess}</div>}
          {feedback ? (
            <div className="existing-feedback">
              <h3>Your Feedback</h3>
              <div className="feedback-display">
                <div className="feedback-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`star ${star <= feedback.rating ? 'filled' : ''}`}>★</span>
                  ))}
                  <span className="feedback-rating-text">{feedback.rating}/5</span>
                </div>
                {feedback.comment && <p className="feedback-comment">{feedback.comment}</p>}
                <p className="feedback-date">Submitted on {new Date(feedback.createdAt).toLocaleString()}</p>
              </div>
              <FeedbackForm
                requestId={id}
                onSubmit={handleFeedbackSubmit}
                existingFeedback={feedback}
              />
            </div>
          ) : (
            <FeedbackForm
              requestId={id}
              onSubmit={handleFeedbackSubmit}
            />
          )}
        </div>
      )}

      <div className="detail-tabs">
        <button
          className={`detail-tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`detail-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
      </div>

      <div className="detail-tab-content">
        {activeTab === 'timeline' && <Timeline logs={logs} />}
        {activeTab === 'messages' && (
          <MessageThread requestId={id} currentUserId={user?._id} />
        )}
      </div>
    </div>
  );
};

export default RequestDetail;