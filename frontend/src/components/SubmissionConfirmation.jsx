import './SubmissionConfirmation.css';

const SubmissionConfirmation = ({ onNewRequest }) => {
  return (
    <div className="confirmation-container">
      <div className="confirmation-icon">✅</div>
      <h2 className="confirmation-title">Request Submitted Successfully!</h2>
      <p className="confirmation-text">
        Your service request has been received. Our team will review it shortly
        and you will be notified about the progress.
      </p>
      <div className="confirmation-info">
        <p>What happens next?</p>
        <ul>
          <li>Your request will be assigned to the relevant department</li>
          <li>You will receive updates on your request status</li>
          <li>You can track progress from your dashboard</li>
        </ul>
      </div>
      <div className="confirmation-actions">
        <button className="btn-new-request" onClick={onNewRequest}>
          Submit Another Request
        </button>
      </div>
    </div>
  );
};

export default SubmissionConfirmation;