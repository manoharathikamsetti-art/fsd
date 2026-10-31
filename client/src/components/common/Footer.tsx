export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container" style={{ padding: '0 16px' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
          Placement Management System — Full Stack Development (FSD) Project
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Built with React 19, TypeScript, Node.js, Express 5, and MongoDB Mongoose.
        </p>
      </div>
    </footer>
  );
};
