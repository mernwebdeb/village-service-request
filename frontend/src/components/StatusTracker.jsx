import './StatusTracker.css';

const StatusTracker = ({ currentStatus }) => {
  const statuses = [
    { key: 'pending', label: 'Pending', icon: '📝' },
    { key: 'in-progress', label: 'In Progress', icon: '🔄' },
    { key: 'resolved', label: 'Resolved', icon: '✅' },
  ];

  const getStatusIndex = () => {
    if (currentStatus === 'rejected') return -1;
    return statuses.findIndex((s) => s.key === currentStatus);
  };

  const currentIndex = getStatusIndex();

  if (currentStatus === 'rejected') {
    return (
      <div className="status-tracker">
        <div className="tracker-rejected">
          <span className="rejected-icon">❌</span>
          <span className="rejected-text">Request Rejected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="status-tracker">
      <div className="tracker-steps">
        {statuses.map((status, index) => (
          <div key={status.key} className="tracker-step-wrapper">
            <div
              className={`tracker-step ${
                index <= currentIndex ? 'completed' : ''
              } ${index === currentIndex ? 'current' : ''}`}
            >
              <div className="step-icon">{status.icon}</div>
              <div className="step-label">{status.label}</div>
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`step-connector ${
                  index < currentIndex ? 'connector-active' : ''
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTracker;