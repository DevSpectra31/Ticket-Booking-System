export default function SkeletonCard() {
  return (
    <div className="card skeleton-shimmer" style={{ minHeight: '350px', padding: 0 }}>
      {/* Skeleton Image */}
      <div className="skeleton-element skeleton-image" />
      
      <div style={{ padding: '20px' }}>
        {/* Skeleton Title */}
        <div className="skeleton-element skeleton-title" />
        
        {/* Skeleton Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton-element skeleton-text" style={{ width: '60%' }} />
          <div className="skeleton-element skeleton-text" style={{ width: '80%' }} />
          <div className="skeleton-element skeleton-text" style={{ width: '45%' }} />
        </div>
      </div>
    </div>
  );
}
