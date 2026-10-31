import type { ApplicationStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Selected':
      return <span className="badge badge-success">✓ Selected</span>;
    case 'Shortlisted':
      return <span className="badge badge-purple">★ Shortlisted</span>;
    case 'Interview Scheduled':
      return <span className="badge badge-warning">⏱ Interview Scheduled</span>;
    case 'Under Review':
      return <span className="badge badge-info">🔍 Under Review</span>;
    case 'Applied':
      return <span className="badge badge-primary">📝 Applied</span>;
    case 'Rejected':
      return <span className="badge badge-danger">✕ Rejected</span>;
    case 'Active':
      return <span className="badge badge-success">● Active</span>;
    case 'Upcoming':
      return <span className="badge badge-info">Upcoming</span>;
    case 'Completed':
      return <span className="badge badge-purple">Completed</span>;
    case 'Closed':
      return <span className="badge badge-danger">Closed</span>;
    default:
      return <span className="badge badge-info">{status}</span>;
  }
};
