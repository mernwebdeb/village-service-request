import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../services/requestService';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Failed to load dashboard data.</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Department Dashboard</h2>

      <div className="summary-cards">
        <div className="summary-card card-total" onClick={() => navigate('/requests')}>
          <div className="card-number">{summary.total}</div>
          <div className="card-label">Total Requests</div>
        </div>
        <div className="summary-card card-pending" onClick={() => navigate('/requests?status=pending')}>
          <div className="card-number">{summary.pending}</div>
          <div className="card-label">Pending</div>
        </div>
        <div className="summary-card card-progress" onClick={() => navigate('/requests?status=in-progress')}>
          <div className="card-number">{summary.inProgress}</div>
          <div className="card-label">In Progress</div>
        </div>
        <div className="summary-card card-resolved" onClick={() => navigate('/requests?status=resolved')}>
          <div className="card-number">{summary.resolved}</div>
          <div className="card-label">Resolved</div>
        </div>
        <div className="summary-card card-rejected" onClick={() => navigate('/requests?status=rejected')}>
          <div className="card-number">{summary.rejected}</div>
          <div className="card-label">Rejected</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Category Breakdown</h3>
          <div className="category-list">
            {summary.byCategory && summary.byCategory.map((cat) => (
              <div key={cat._id} className="category-item">
                <span className="category-name">{cat._id}</span>
                <div className="category-bar-wrapper">
                  <div
                    className="category-bar"
                    style={{ width: `${(cat.count / summary.total) * 100}%` }}
                  />
                </div>
                <span className="category-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Recent Requests</h3>
          <div className="recent-list">
            {summary.recent && summary.recent.map((req) => (
              <div
                key={req._id}
                className="recent-item"
                onClick={() => navigate(`/request/${req._id}`)}
              >
                <div className="recent-top">
                  <span className="recent-title">{req.title}</span>
                  <span className={`status-badge status-${req.status}`}>
                    {req.status}
                  </span>
                </div>
                <div className="recent-meta">
                  <span>{req.citizen?.name || 'Unknown'}</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;