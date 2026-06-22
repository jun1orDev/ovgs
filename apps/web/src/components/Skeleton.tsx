import { ReactNode } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'avatar' | 'button' | 'input' | 'table-row' | 'list-item' | 'badge' | 'metric';
  count?: number;
  className?: string;
  children?: ReactNode;
}

export function Skeleton({
  variant = 'text',
  count = 1,
  className = '',
  children,
}: SkeletonProps) {
  const baseClass = 'skeleton';
  const variantClass = `skeleton-${variant}`;

  if (children) {
    return <div className={`${baseClass} ${variantClass} ${className}`}>{children}</div>;
  }

  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`${baseClass} ${variantClass} ${className}`} />
  ));

  return <>{items}</>;
}

export function SkeletonCard({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" style={{ width: '80%' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="skeleton skeleton-table-row">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="skeleton skeleton-table-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-list-item">
          <div className="skeleton skeleton-list-content">
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          </div>
          <div className="skeleton skeleton-badge" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonMetrics({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`summary-grid ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-metric">
          <div className="skeleton skeleton-metric-label" />
          <div className="skeleton skeleton-metric-value" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 4, className = '' }: { fields?: number; className?: string }) {
  return (
    <div className={`form-card ${className}`}>
      <div className="skeleton skeleton-title" style={{ width: '40%' }} />
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="skeleton skeleton-input" />
      ))}
      <div className="skeleton skeleton-button" style={{ marginTop: '16px' }} />
    </div>
  );
}
