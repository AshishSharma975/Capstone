/**
 * Skeleton.jsx — Loading skeleton placeholders
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--bg-elevated)] ${className}`}
      style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
    />
  );
}

export function FileSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i % 3) * 12}px` }}>
          <Skeleton className="w-3.5 h-3.5 rounded-sm" />
          <Skeleton className="h-3.5" style={{ width: `${60 + Math.random() * 80}px` }} />
        </div>
      ))}
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 font-mono text-xs">
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${20 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  );
}
