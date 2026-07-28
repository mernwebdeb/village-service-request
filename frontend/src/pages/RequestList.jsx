import { useState, useEffect } from 'react';
import { getAllRequests } from '../services/requestService';
import './RequestList.css';

const RequestList = ({ onRequestClick }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getAllRequests({
        status: statusFilter,
        category: categoryFilter,
        sort: sortBy === 'newest' ? '' : sortBy,
        search,
        page,
        limit: 10,
      });
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter, sortBy, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const getStatusClass = (status) => {
    const map = {
      pending: 'status-pending',
      'in-progress': 'status-progress',
      resolved: 'status-resolved',
      rejected: 'status-rejected',
    };
    return map[status] || '';
  };

  const getUrgencyClass = (urgency) => {
    const map = {
      low: 'urgency-low',
      medium: 'urgency-medium',
      high: 'urgency-high',
      critical: 'urgency-critical',
    };
    return map[urgency] || '';
  };

  return (
    <div className="request-list-container">
      <h2 className="list-title">Service Requests</h2>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="filters-bar">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
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

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="urgency-high">Urgency: High to Low</option>
          <option value="urgency-low">Urgency: Low to High</option>
        </select>
      </div>

      {pagination && (
        <div className="results-count">
          Showing {requests.length} of {pagination.total} requests
        </div>
      )}

      {loading ? (
        <div className="loading-text">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="no-requests">No requests found matching your filters.</div>
      ) : (
        <div className="request-cards">
          {requests.map((req) => (
            <div
              key={req._id}
              className="request-card"
              onClick={() => onRequestClick(req._id)}
            >
              <div className="card-top">
                <h3 className="card-title">{req.title}</h3>
                <span className={`status-badge ${getStatusClass(req.status)}`}>
                  {req.status}
                </span>
              </div>

              <p className="card-description">
                {req.description.length > 100
                  ? req.description.substring(0, 100) + '...'
                  : req.description}
              </p>

              <div className="card-meta">
                <span className="meta-item">📍 {req.location}</span>
                <span className="meta-item">📁 {req.category}</span>
                <span className={`urgency-badge ${getUrgencyClass(req.urgency)}`}>
                  {req.urgency}
                </span>
              </div>

              <div className="card-footer">
                <span className="card-date">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
                {req.citizen?.name && (
                  <span className="card-citizen">By: {req.citizen.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-bar">
          <button
            className="page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="page-btn"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestList;