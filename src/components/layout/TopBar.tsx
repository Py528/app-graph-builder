import { useRef, useState } from 'react';
import { Share2, Sun, Moon, ChevronUp, Maximize2, PanelRight, Plus, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useApps } from '@/hooks/useGraphData';
import { AppDropdown } from './AppDropdown';
import { cn } from '@/lib/utils';

interface TopBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopBar({ isDark, onToggleTheme }: TopBarProps) {
  const selectedAppId = useUIStore((s) => s.selectedAppId);
  const { data: apps } = useApps();
  const selectedApp = apps?.find((a) => a.id === selectedAppId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const appPillRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="fixed top-0 left-0 right-0 flex h-12 items-center justify-between bg-transparent px-3 z-20">
      {/* Left: Logo + app selector */}
      <div className="flex items-center gap-0">
        {/* Logo */}
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground mr-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 14L8 2L14 14" stroke="#0e0e10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.5 9.5H11.5" stroke="#0e0e10" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* App name pill — clicking opens dropdown */}
        <button
          ref={appPillRef}
          onClick={() => setIsDropdownOpen((o) => !o)}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors',
            isDropdownOpen ? 'bg-surface-3' : 'hover:bg-surface-3',
          )}
        >
          <span
            className="h-4 w-4 rounded-sm flex items-center justify-center text-[10px]"
            style={{ backgroundColor: selectedApp?.color ?? '#8b5cf6' }}
          >
            {selectedApp?.icon ?? '💡'}
          </span>
          <span className="text-xs text-foreground-2 font-mono">{selectedApp?.name ?? selectedAppId}</span>
          <ChevronUp
            size={12}
            className={cn('text-muted transition-transform duration-200', isDropdownOpen ? 'rotate-0' : 'rotate-180')}
          />
          <span className="text-muted text-xs">•••</span>
        </button>

        {/* Floating app dropdown */}
        <AppDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          anchorRef={appPillRef}
        />
      </div>

      {/* Right: Share, Add Node, Fit View, Mobile Inspector toggle, Theme, Avatar */}
      <div className="flex items-center gap-1.5">
        <TopBarButton
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          title={copied ? "Copied!" : "Share"}
        >
          {copied ? <Check size={15} className="text-green-500 animate-in fade-in zoom-in duration-200" /> : <Share2 size={15} />}
        </TopBarButton>
        <TopBarButton
          onClick={() => (window as unknown as Record<string, () => void>).__addNode?.()}
          title="Add service node"
        >
          <Plus size={15} />
        </TopBarButton>
        <TopBarButton
          onClick={() => (window as unknown as Record<string, () => void>).__fitView?.()}
          title="Fit view (F)"
        >
          <Maximize2 size={15} />
        </TopBarButton>
        {/* Mobile-only: open inspector drawer */}
        <span className="lg:hidden">
          <TopBarButton onClick={() => useUIStore.getState().toggleMobilePanel()} title="Inspector">
            <PanelRight size={15} />
          </TopBarButton>
        </span>
        <TopBarButton onClick={onToggleTheme} title="Toggle theme">
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </TopBarButton>
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 ml-0.5 shrink-0" />
      </div>
    </header>
  );
}

function TopBarButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
    >
      {children}
    </button>
  );
}
