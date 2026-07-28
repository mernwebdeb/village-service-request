import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRequests } from '../services/requestService';
import './RequestHistory.css';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getUserRequests();
        setRequests(data.requests);
      } catch (error) {
        console.error('Failed to fetch request history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredRequests = requests.filter((req) => {
    if (filterStatus && req.status !== filterStatus) return false;
    if (filterCategory && req.category !== filterCategory) return false;
    return true;
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

  const getTimeDifference = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="history-container">
      <h2 className="history-title">Request History</h2>
      <p className="history-subtitle">View all your past and current service requests</p>

      <div className="history-filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="water">Water Supply</option>
          <option value="electricity">Electricity</option>
          <option value="roads">Roads & Infrastructure</option>
          <option value="sanitation">Sanitation</option>
          <option value="health">Health Services</option>
          <option value="education">Education</option>
          <option value="other">Other</option>
        </select>

        <div className="history-count">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="history-loading">Loading request history...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="history-empty">
          <p>{filterStatus || filterCategory ? 'No requests match your filters.' : 'No request history found.'}</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Submitted</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr
                  key={req._id}
                  className="history-row"
                  onClick={() => navigate(`/request/${req._id}`)}
                >
                  <td className="row-title">{req.title}</td>
                  <td className="row-category">{req.category}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <span className={`urgency-badge urgency-${req.urgency}`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="row-date">{getTimeDifference(req.createdAt)}</td>
                  <td className="row-date">{getTimeDifference(req.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;