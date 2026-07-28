import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRequests } from '../services/requestService';
import StatusTracker from '../components/StatusTracker';
import './MyRequests.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

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

  const filteredRequests = requests.filter((req) => {
    if (!statusFilter) return true;
    return req.status === statusFilter;
  });

  const getStatusClass = (status) => {
    const map = {
      pending: 'status-pending',
      'in-progress': 'status-progress',
      resolved: 'status-resolved',
      rejected: 'status-rejected',
    };
    return map[status] || '';
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    'in-progress': requests.filter((r) => r.status === 'in-progress').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="my-requests-container">
      <h2 className="my-requests-title">My Service Requests</h2>

      <div className="status-filter-tabs">
        <button
          className={`filter-tab ${statusFilter === '' ? 'active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          All ({statusCounts.all})
        </button>
        <button
          className={`filter-tab tab-pending ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending ({statusCounts.pending})
        </button>
        <button
          className={`filter-tab tab-progress ${statusFilter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('in-progress')}
        >
          In Progress ({statusCounts['in-progress']})
        </button>
        <button
          className={`filter-tab tab-resolved ${statusFilter === 'resolved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('resolved')}
        >
          Resolved ({statusCounts.resolved})
        </button>
        <button
          className={`filter-tab tab-rejected ${statusFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
        >
          Rejected ({statusCounts.rejected})
        </button>
      </div>

      {loading ? (
        <div className="my-requests-loading">Loading your requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="my-requests-empty">
          <p>{statusFilter ? 'No requests with this status.' : 'You haven\'t submitted any requests yet.'}</p>
        </div>
      ) : (
        <div className="my-requests-list">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="my-request-card"
              onClick={() => navigate(`/request/${req._id}`)}
            >
              <div className="my-card-top">
                <h3>{req.title}</h3>
                <span className={`status-badge ${getStatusClass(req.status)}`}>
                  {req.status}
                </span>
              </div>

              <StatusTracker currentStatus={req.status} />

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
    </div>
  );
};

export default MyRequests;