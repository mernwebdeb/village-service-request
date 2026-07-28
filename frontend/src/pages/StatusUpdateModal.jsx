import { useState } from 'react';
import { updateRequestStatus } from '../services/requestService';
import './StatusUpdateModal.css';

const StatusUpdateModal = ({ requestId, currentStatus, onClose, onUpdated }) => {
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [resolutionNote, setResolutionNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    if (status === currentStatus && !resolutionNote.trim()) {
      setError('Please change the status or add a resolution note.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateRequestStatus(requestId, {
        status,
        resolutionNote: resolutionNote.trim(),
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div className="status-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="status-modal-close" onClick={onClose}>✕</button>

        <h3 className="status-modal-title">Update Request Status</h3>

        {error && <div className="status-error">{error}</div>}

        <div className="status-form-group">
          <label>Current Status</label>
          <span className="current-status">{currentStatus}</span>
        </div>

        <div className="status-form-group">
          <label htmlFor="new-status">New Status</label>
          <select
            id="new-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="status-form-group">
          <label htmlFor="resolution-note">Resolution Note (optional)</label>
          <textarea
            id="resolution-note"
            rows="3"
            placeholder="Add a note about this status change..."
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
          />
        </div>

        <div className="status-modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="update-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;