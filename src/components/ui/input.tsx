import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-lg border border-border bg-surface-2 px-3 py-1 text-sm text-foreground',
        'placeholder:text-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent/50',
        'transition-colors',
        className,
      )}
      {...props}
    />
  );
}
