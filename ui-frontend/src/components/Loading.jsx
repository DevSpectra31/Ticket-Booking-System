export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
    </div>
  );
}
