import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFeedbacks, updateFeedback } from '../services/feedbackService';
import './FeedbackHistory.css';

const FeedbackHistory = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editHover, setEditHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await getUserFeedbacks();
        setFeedbacks(data.feedbacks);
      } catch (error) {
        console.error('Failed to fetch feedback history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleEditClick = (fb) => {
    setEditingId(fb.request._id);
    setEditRating(fb.rating);
    setEditComment(fb.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleSaveEdit = async (requestId) => {
    if (editRating === 0) return;

    setSaving(true);
    try {
      const result = await updateFeedback(requestId, {
        rating: editRating,
        comment: editComment.trim(),
      });

      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb.request._id === requestId
            ? { ...fb, rating: result.feedback.rating, comment: result.feedback.comment, updatedAt: result.feedback.updatedAt }
            : fb
        )
      );

      setEditingId(null);
      setSuccessMsg('Feedback updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Failed to update feedback:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="feedback-history-container">
      <h2 className="feedback-history-title">My Feedback History</h2>
      <p className="feedback-history-subtitle">View and edit feedback you have given on resolved requests</p>

      {successMsg && <div className="feedback-history-success">{successMsg}</div>}

      {loading ? (
        <div className="feedback-history-loading">Loading feedback history...</div>
      ) : feedbacks.length === 0 ? (
        <div className="feedback-history-empty">
          <p>You haven't submitted any feedback yet.</p>
          <p className="empty-hint">Feedback can be given on resolved requests.</p>
        </div>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="feedback-card">
              <div className="feedback-card-header">
                <div
                  className="feedback-request-title"
                  onClick={() => navigate(`/request/${fb.request._id}`)}
                >
                  {fb.request.title}
                </div>
                <span className={`status-badge status-${fb.request.status}`}>
                  {fb.request.status}
                </span>
              </div>

              <div className="feedback-card-meta">
                <span className="feedback-category">{fb.request.category}</span>
                <span className="feedback-date">
                  Submitted: {new Date(fb.createdAt).toLocaleDateString()}
                </span>
                {fb.updatedAt !== fb.createdAt && (
                  <span className="feedback-date">
                    Updated: {new Date(fb.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {editingId === fb.request._id ? (
                <div className="feedback-edit-section">
                  <div className="edit-rating">
                    <label>Rating</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star ${star <= (editHover || editRating) ? 'filled' : ''}`}
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => setEditHover(star)}
                          onMouseLeave={() => setEditHover(0)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="edit-comment">
                    <label>Comment</label>
                    <textarea
                      rows="3"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="Update your feedback..."
                    />
                  </div>

                  <div className="edit-actions">
                    <button className="save-btn" onClick={() => handleSaveEdit(fb.request._id)} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="feedback-card-body">
                  <div className="feedback-stars-display">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`star-display ${star <= fb.rating ? 'filled' : ''}`}>
                        ★
                      </span>
                    ))}
                    <span className="rating-number">{fb.rating}/5</span>
                  </div>

                  {fb.comment && <p className="feedback-card-comment">{fb.comment}</p>}

                  <button className="edit-feedback-btn" onClick={() => handleEditClick(fb)}>
                    Edit Feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;