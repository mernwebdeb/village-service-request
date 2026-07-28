import './ActivityLog.css';

const ActivityLog = ({ logs = [], loading = false }) => {
  const getActionIcon = (action) => {
    const map = {
      created: '🆕',
      'status-change': '🔄',
      assigned: '👤',
      message: '💬',
      resolved: '✅',
      rejected: '❌',
    };
    return map[action] || '📋';
  };

  const getActionClass = (action) => {
    const map = {
      created: 'action-created',
      'status-change': 'action-status',
      assigned: 'action-assigned',
      message: 'action-message',
      resolved: 'action-resolved',
      rejected: 'action-rejected',
    };
    return map[action] || '';
  };

  if (loading) {
    return (
      <div className="activity-log-container">
        <h3 className="log-title">Activity Log</h3>
        <div className="log-loading">Loading activity log...</div>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      <h3 className="log-title">Activity Log</h3>

      {logs.length === 0 ? (
        <div className="no-logs">No activity recorded yet.</div>
      ) : (
        <div className="log-timeline">
          {logs.map((log) => (
            <div key={log._id} className={`log-item ${getActionClass(log.action)}`}>
              <div className="log-icon">{getActionIcon(log.action)}</div>
              <div className="log-content">
                <div className="log-message">
                  <span className="log-user">{log.performedBy?.name || 'System'}</span>
                  {' '}{log.description}
                </div>
                <div className="log-meta">
                  <span className="log-time">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                  {log.request?.title && (
                    <span className="log-request">Re: {log.request.title}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;