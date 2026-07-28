import { useEffect, useState } from 'react';
import { getRequestById, updateRequestStatus } from '../services/requestService';
import MessageThread from './MessageThread';
import ActivityLog from './ActivityLog';
import './RequestDetailModal.css';

const statusOptions = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

function RequestDetailModal({ requestId, onClose, onRequestUpdated }) {
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getRequestById(requestId);
        const requestData = data.request || data;

        setRequest(requestData);
        setStatus(requestData.status);
        setResolutionNote(requestData.resolutionNote || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load request details.');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      loadRequest();
    }
  }, [requestId]);

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setError('');

      const data = await updateRequestStatus(
        request._id,
        status,
        resolutionNote
      );

      const updatedRequest = data.request || data;

      setRequest(updatedRequest);

      if (onRequestUpdated) {
        onRequestUpdated(updatedRequest);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to update request status.'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (!requestId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="request-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        {loading ? (
          <p className="modal-state">Loading request details...</p>
        ) : error && !request ? (
          <p className="modal-error">{error}</p>
        ) : (
          <>
            <div className="request-detail-header">
              <div>
                <p className="request-id">Request ID: {request._id}</p>
                <h2>{request.title}</h2>
              </div>

              <span className={`status-badge status-${request.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {request.status}
              </span>
            </div>

            {error && <p className="modal-error">{error}</p>}

            <div className="request-detail-info">
              <p>
                <strong>Category:</strong> {request.category}
              </p>
              <p>
                <strong>Location:</strong> {request.location}
              </p>
              <p>
                <strong>Urgency:</strong> {request.urgency}
              </p>
              <p>
                <strong>Submitted by:</strong>{' '}
                {request.citizen?.name || 'Citizen'}
              </p>
              <p>
                <strong>Description:</strong> {request.description}
              </p>
            </div>

            <form className="status-update-form" onSubmit={handleStatusUpdate}>
              <h3>Update Request Status</h3>

              <label htmlFor="request-status">Status</label>
              <select
                id="request-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={updating}
              >
                {statusOptions.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>

              <label htmlFor="resolution-note">Resolution Note</label>
              <textarea
                id="resolution-note"
                rows="4"
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder="Write a resolution or status update note..."
                disabled={updating}
              />

              <button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>

            <MessageThread requestId={request._id} />

            <ActivityLog requestId={request._id} />
          </>
        )}
      </div>
    </div>
  );
}

export default RequestDetailModal;