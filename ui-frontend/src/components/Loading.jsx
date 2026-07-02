export default function Loading() {
  return (
    <div className="loading-container fade-in">
      <div className="premium-spinner-wrapper">
        <div className="spinner-outer" />
        <div className="spinner-inner" />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px' }} className="pulse">
        Loading...
      </p>
    </div>
  );
}
