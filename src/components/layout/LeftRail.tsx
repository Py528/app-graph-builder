import { cn } from '@/lib/utils';
import { useState } from 'react';
import { LayoutGrid, Network } from 'lucide-react';

interface RailItem {
  id: string;
  label: string;
  logo?: string; // Local SVG URL
  lucide?: React.ComponentType<{ size?: number }>;
}

const RAIL_ITEMS: RailItem[] = [
  { id: 'github',   label: 'GitHub',      logo: '/logos/github.svg' },
  { id: 'postgres', label: 'PostgreSQL',  logo: '/logos/postgresql.svg' },
  { id: 'redis',    label: 'Redis',       logo: '/logos/redis.svg' },
  { id: 'mongodb',  label: 'MongoDB',     logo: '/logos/mongodb.svg' },
  { id: 'docker',   label: 'Docker',      logo: '/logos/docker.svg' },
  { id: 'grid',     label: 'Apps',        lucide: LayoutGrid },
  { id: 'network',  label: 'Network',     lucide: Network },
];

export function LeftRail() {
  const [active, setActive] = useState<string>('network');

  return (
    <nav
      className={cn(
        'fixed left-3 z-30',
        'flex flex-col items-center gap-1 py-2.5 px-1.5',
        'rounded-xl border border-border bg-surface shadow-xl shadow-black/40',
      )}
      style={{ top: 'calc(48px + (100vh - 48px) / 2)', transform: 'translateY(-50%)' }}
    >
      {RAIL_ITEMS.map(({ id, logo, lucide: LucideIcon, label }) => (
        <LeftRailItem
          key={id}
          id={id}
          logo={logo}
          LucideIcon={LucideIcon}
          label={label}
          active={active}
          setActive={setActive}
        />
      ))}
    </nav>
  );
}

function LeftRailItem({
  id,
  logo,
  LucideIcon,
  label,
  active,
  setActive,
}: {
  id: string;
  logo?: string;
  LucideIcon?: React.ComponentType<{ size?: number }>;
  label: string;
  active: string;
  setActive: (id: string) => void;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <button
      title={label}
      onClick={() => setActive(id)}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        active === id
          ? 'bg-accent/15 ring-1 ring-accent/30'
          : 'hover:bg-surface-2',
      )}
    >
      {logo && !hasError ? (
        <img
          src={logo}
          alt={label}
          className={cn('h-4 w-4 object-contain transition-opacity', active !== id && 'opacity-50')}
          onError={() => setHasError(true)}
        />
      ) : LucideIcon ? (
        <span className={active !== id ? 'opacity-50' : ''}>
          <LucideIcon size={16} />
        </span>
      ) : (
        <span className="text-[10px] font-bold text-muted uppercase">
          {label.slice(0, 2)}
        </span>
      )}
    </button>
  );
}

