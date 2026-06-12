import { useState, useMemo } from 'react';
import { Search, ChevronRight, Plus } from 'lucide-react';
import { useApps } from '@/hooks/useGraphData';
import { useUIStore } from '@/store/uiStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { App } from '@/types';

const APP_COLORS: Record<string, string> = {
  'app-1': 'bg-violet-500',
  'app-2': 'bg-indigo-500',
  'app-3': 'bg-red-500',
  'app-4': 'bg-fuchsia-500',
  'app-5': 'bg-pink-500',
};

export function AppPanel() {
  const { data: apps, isLoading, isError } = useApps();
  const selectedAppId = useUIStore((s) => s.selectedAppId);
  const setSelectedAppId = useUIStore((s) => s.setSelectedAppId);
  const setMobilePanelOpen = useUIStore((s) => s.setMobilePanelOpen);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!apps) return [];
    if (!query.trim()) return apps;
    return apps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  }, [apps, query]);

  const handleSelect = (app: App) => {
    setSelectedAppId(app.id);
    setMobilePanelOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Application</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="pl-8"
          />
        </div>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-surface hover:bg-accent-dim transition-colors"
          title="Add application"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}

        {isError && (
          <p className="px-2 py-3 text-sm text-destructive">Couldn't load apps. Try again later.</p>
        )}

        {!isLoading &&
          !isError &&
          filtered.map((app) => (
            <button
              key={app.id}
              onClick={() => handleSelect(app)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors',
                selectedAppId === app.id
                  ? 'bg-surface-3 text-foreground'
                  : 'text-foreground-2 hover:bg-surface-2',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm',
                  APP_COLORS[app.id] ?? 'bg-surface-3',
                )}
              >
                {app.icon}
              </span>
              <span className="flex-1 truncate font-mono text-[13px]">{app.name}</span>
              <ChevronRight size={14} className="text-muted shrink-0" />
            </button>
          ))}

        {!isLoading && !isError && filtered.length === 0 && (
          <p className="px-2 py-3 text-sm text-muted">No applications match "{query}".</p>
        )}
      </div>
    </div>
  );
}
