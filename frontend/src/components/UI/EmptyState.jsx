/**
 * EmptyState.jsx — Placeholder for empty panels
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
          <Icon size={22} className="text-[var(--accent)]" />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] max-w-[220px] leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
