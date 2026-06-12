import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronRight, Plus } from 'lucide-react';
import { useApps, useCreateApp } from '@/hooks/useGraphData';
import { useUIStore } from '@/store/uiStore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { App } from '@/types';

const EMOJIS = ['💡', '⚙️', '🚀', '📦', '🔧', '🛡️', '⚡', '📊', '🌐', '🔑', '💎', '🎨', '🔥', '🧬', '🛸'];
const COLORS = [
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#ef4444', // red
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#a855f7', // purple
];

interface AppDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function AppDropdown({ isOpen, onClose, anchorRef }: AppDropdownProps) {
  const { data: apps, isLoading, isError } = useApps();
  const selectedAppId = useUIStore((s) => s.selectedAppId);
  const setSelectedAppId = useUIStore((s) => s.setSelectedAppId);
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const createAppMutation = useCreateApp();

  const filtered = useMemo(() => {
    if (!apps) return [];
    if (!query.trim()) return apps;
    return apps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  }, [apps, query]);

  const handleSelect = (app: App) => {
    setSelectedAppId(app.id);
    onClose();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newAppName.trim();
    if (!name) return;

    const randomIcon = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    createAppMutation.mutate(
      { name, icon: randomIcon, color: randomColor },
      {
        onSuccess: (newApp) => {
          setSelectedAppId(newApp.id);
          setIsCreating(false);
          setNewAppName('');
          onClose();
        },
      }
    );
  };

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
      setNewAppName('');
      setQuery('');
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-[calc(100%+8px)] left-3 z-50 w-[300px] rounded-xl border border-border bg-surface shadow-2xl shadow-black/40 animate-dropdown-fade"
      style={{ maxHeight: '420px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-foreground">
          {isCreating ? 'Create Application' : 'Application'}
        </h2>
        {isCreating && (
          <button
            onClick={() => {
              setIsCreating(false);
              setNewAppName('');
            }}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-3 px-3 pb-3">
          <input
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            placeholder="Application name..."
            className={cn(
              'h-9 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground',
              'placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors',
            )}
            autoFocus
            disabled={createAppMutation.isPending}
          />
          <button
            type="submit"
            disabled={createAppMutation.isPending || !newAppName.trim()}
            className={cn(
              'flex h-9 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {createAppMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      ) : (
        <>
          {/* Search + Add */}
          <div className="flex items-center gap-2 px-3 pb-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className={cn(
                  'h-9 w-full rounded-lg border border-border bg-surface-2 pl-8 pr-3 text-sm text-foreground',
                  'placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors',
                )}
              />
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              title="Add application"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* App list */}
          <div className="flex flex-col overflow-y-auto px-2 pb-2" style={{ maxHeight: '300px' }}>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full mb-1" />
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
                    'flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors group',
                    selectedAppId === app.id
                      ? 'bg-surface-3 text-foreground'
                      : 'text-foreground-2 hover:bg-surface-2',
                  )}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.icon}
                  </span>
                  <span className="flex-1 truncate font-mono text-[13px]">{app.name}</span>
                  <ChevronRight size={14} className="text-muted shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}

            {!isLoading && !isError && filtered.length === 0 && (
              <p className="px-2 py-3 text-sm text-muted">No applications match "{query}".</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
