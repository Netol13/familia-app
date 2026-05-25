export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16 px-6 space-y-4 rounded-3xl border border-dashed border-border/70 bg-card/40">
      <div className="text-6xl leading-none">{emoji}</div>
      <div className="space-y-1.5">
        <h3 className="text-2xl font-heading tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-3">{action}</div>}
    </div>
  )
}
