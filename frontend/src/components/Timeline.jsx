import './Timeline.css';

const Timeline = ({ logs = [] }) => {
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

  const getActionColor = (action) => {
    const map = {
      created: '#27ae60',
      'status-change': '#2980b9',
      assigned: '#f39c12',
      message: '#8e44ad',
      resolved: '#27ae60',
      rejected: '#e74c3c',
    };
    return map[action] || '#999';
  };

  if (logs.length === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-empty">No activity recorded yet.</div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {logs.map((log, index) => (
        <div key={log._id} className="timeline-item">
          <div className="timeline-line-wrapper">
            <div
              className="timeline-dot"
              style={{ backgroundColor: getActionColor(log.action) }}
            >
              {getActionIcon(log.action)}
            </div>
            {index < logs.length - 1 && <div className="timeline-line" />}
          </div>

          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-user">
                {log.performedBy?.name || 'System'}
              </span>
              <span className="timeline-action">{log.description}</span>
            </div>

            {log.previousStatus && log.newStatus && (
              <div className="timeline-status-change">
                <span className="old-status">{log.previousStatus}</span>
                <span className="arrow">→</span>
                <span className="new-status">{log.newStatus}</span>
              </div>
            )}

            <div className="timeline-time">
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;