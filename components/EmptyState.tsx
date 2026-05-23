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
    <div className="text-center py-16 px-6 space-y-3 rounded-2xl border border-dashed border-border/60 bg-card/40">
      <div className="text-5xl leading-none">{emoji}</div>
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
