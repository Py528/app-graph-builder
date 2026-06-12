import { useEffect } from 'react';
import { X } from 'lucide-react';
import { NodeInspector } from '@/components/inspector/NodeInspector';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function RightPanel() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const isMobilePanelOpen = useUIStore((s) => s.isMobilePanelOpen);
  const setMobilePanelOpen = useUIStore((s) => s.setMobilePanelOpen);

  // Close drawer on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobilePanelOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setMobilePanelOpen]);

  if (!selectedNodeId) return null;

  const content = (
    <div className="flex h-full flex-col overflow-hidden">
      <NodeInspector />
    </div>
  );

  return (
    <>
      {/* Desktop floating panel overlay */}
      <aside className="hidden lg:flex fixed right-4 top-16 bottom-4 w-[300px] rounded-2xl border border-border bg-surface backdrop-blur-md shadow-2xl z-10 flex-col overflow-hidden animate-slide-in-right">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-opacity duration-200',
          isMobilePanelOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobilePanelOpen(false)}
        />
        {/* Drawer panel */}
        <aside
          className={cn(
            'absolute right-0 top-0 h-full w-[85vw] max-w-[360px] border-l border-border bg-surface shadow-2xl transition-transform duration-200',
            isMobilePanelOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex h-12 items-center justify-between border-b border-border px-3">
            <span className="text-sm font-semibold text-foreground">Inspector</span>
            <button
              onClick={() => setMobilePanelOpen(false)}
              className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="h-[calc(100%-3rem)] overflow-hidden">{content}</div>
        </aside>
      </div>
    </>
  );
}

