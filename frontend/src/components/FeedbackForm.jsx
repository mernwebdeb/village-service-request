import { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = ({ requestId, onSubmit, existingFeedback = null }) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onSubmit({ requestId, rating, comment: comment.trim() });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form">
      <h3 className="feedback-title">
        {existingFeedback ? 'Update Your Feedback' : 'Rate This Service'}
      </h3>

      {error && <div className="feedback-error">{error}</div>}

      <div className="rating-section">
        <label>Your Rating</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>
        <span className="rating-text">
          {rating > 0 ? `${rating}/5` : 'Select rating'}
        </span>
      </div>

      <div className="comment-section">
        <label htmlFor="feedback-comment">Comments (optional)</label>
        <textarea
          id="feedback-comment"
          rows="3"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        className="feedback-submit-btn"
        onClick={handleSubmit}
        disabled={loading || rating === 0}
      >
        {loading ? 'Submitting...' : existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
      </button>
    </div>
  );
};

export default FeedbackForm;