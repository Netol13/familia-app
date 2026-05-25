type Props = {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: Props) {
  return (
    <header className="flex items-end justify-between gap-3">
      <div className="space-y-2 min-w-0 flex-1">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-[clamp(2rem,8vw,3rem)] font-heading tracking-tight leading-[0.95]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
