import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'healthy' | 'degraded' | 'down' | 'neutral';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  healthy: 'bg-accent/10 text-accent border-accent/20',
  degraded: 'bg-warning/10 text-warning border-warning/20',
  down: 'bg-destructive/10 text-destructive border-destructive/20',
  neutral: 'bg-surface-2 text-foreground-2 border-border',
};

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
