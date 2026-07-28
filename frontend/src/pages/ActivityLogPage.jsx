import { useState, useEffect } from 'react';
import { getAllActivityLogs } from '../services/activityLogService';
import ActivityLog from '../components/ActivityLog';
import './ActivityLogPage.css';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAllActivityLogs({
        action: actionFilter,
        page,
        limit: 20,
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, page]);

  return (
    <div className="activity-log-page">
      <h2 className="page-title">Department Activity Log</h2>

      <div className="log-filters">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="status-change">Status Change</option>
          <option value="assigned">Assigned</option>
          <option value="message">Message</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <ActivityLog logs={logs} loading={loading} />

      {pagination && pagination.totalPages > 1 && (
        <div className="log-pagination">
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

export default ActivityLogPage;