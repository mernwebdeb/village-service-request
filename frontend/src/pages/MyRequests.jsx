import { useState, useEffect } from 'react';
import { getUserRequests } from '../services/requestService';
import { getUser } from '../utils/auth';
import RequestDetailModal from '../components/RequestDetailModal';
import './MyRequests.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const user = getUser();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getUserRequests();
      setRequests(data.requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusClass = (status) => {
    const map = {
      pending: 'status-pending',
      'in-progress': 'status-progress',
      resolved: 'status-resolved',
      rejected: 'status-rejected',
    };
    return map[status] || '';
  };

  return (
    <div className="my-requests-container">
      <h2 className="my-requests-title">My Service Requests</h2>

      {loading ? (
        <div className="my-requests-loading">Loading your requests...</div>
      ) : requests.length === 0 ? (
        <div className="my-requests-empty">
          <p>You haven't submitted any requests yet.</p>
        </div>
      ) : (
        <div className="my-requests-list">
          {requests.map((req) => (
            <div
              key={req._id}
              className="my-request-card"
              onClick={() => setSelectedRequestId(req._id)}
            >
              <div className="my-card-top">
                <h3>{req.title}</h3>
                <span className={`status-badge ${getStatusClass(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <p className="my-card-desc">
                {req.description.length > 120
                  ? req.description.substring(0, 120) + '...'
                  : req.description}
              </p>
              <div className="my-card-bottom">
                <span>📍 {req.location}</span>
                <span>📁 {req.category}</span>
                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequestId && (
        <RequestDetailModal
          requestId={selectedRequestId}
          currentUserId={user?._id}
          userRole={user?.role}
          onClose={() => setSelectedRequestId(null)}
          onStatusUpdate={null}
        />
      )}
    </div>
  );
};

export default MyRequests;