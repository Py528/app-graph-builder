import { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, useEdges, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import type { ServiceNodeData, NodeStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  NodeStatus,
  {
    label: string;
    className: string;
    glow: string;
    border: string;
    glowHover: string;
    borderHover: string;
    glowActive: string;
    borderActive: string;
  }
> = {
  healthy: {
    label: 'Success',
    className: 'bg-accent/10 text-accent border-accent/20',
    glow: 'rgba(16, 185, 129, 0.04)',
    border: 'rgba(16, 185, 129, 0.25)',
    glowHover: 'rgba(16, 185, 129, 0.08)',
    borderHover: 'rgba(16, 185, 129, 0.45)',
    glowActive: 'rgba(16, 185, 129, 0.12)',
    borderActive: '#10b981',
  },
  degraded: {
    label: 'Degraded',
    className: 'bg-warning/10 text-warning border-warning/20',
    glow: 'rgba(245, 158, 11, 0.04)',
    border: 'rgba(245, 158, 11, 0.25)',
    glowHover: 'rgba(245, 158, 11, 0.08)',
    borderHover: 'rgba(245, 158, 11, 0.45)',
    glowActive: 'rgba(245, 158, 11, 0.12)',
    borderActive: '#f59e0b',
  },
  down: {
    label: 'Error',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    glow: 'rgba(239, 68, 68, 0.04)',
    border: 'rgba(239, 68, 68, 0.25)',
    glowHover: 'rgba(239, 68, 68, 0.08)',
    borderHover: 'rgba(239, 68, 68, 0.45)',
    glowActive: 'rgba(239, 68, 68, 0.12)',
    borderActive: '#ef4444',
  },
};

// SimpleIcons CDN: cdn.simpleicons.org/{slug}/{hex}
const LOGO_MAP: Array<{ match: string[]; url: string }> = [
  { match: ['postgres', 'postgresql'], url: 'https://cdn.simpleicons.org/postgresql/4169e1' },
  { match: ['redis'],                  url: 'https://cdn.simpleicons.org/redis/dc382d' },
  { match: ['mongo', 'mongodb'],       url: 'https://cdn.simpleicons.org/mongodb/47a248' },
  { match: ['mysql'],                  url: 'https://cdn.simpleicons.org/mysql/4479a1' },
  { match: ['kafka', 'message queue'], url: 'https://cdn.simpleicons.org/apachekafka/ffffff' },
  { match: ['fastapi'],                url: 'https://cdn.simpleicons.org/fastapi/009688' },
  { match: ['celery'],                 url: 'https://cdn.simpleicons.org/celery/37814a' },
  { match: ['auth', 'service'],        url: 'https://cdn.simpleicons.org/java/f89820' },
];

function getNodeLogoUrl(label: string): string | null {
  const lower = label.toLowerCase();
  for (const { match, url } of LOGO_MAP) {
    if (match.some((m) => lower.includes(m))) return url;
  }
  return null;
}

function ServiceIcon({ label }: { label: string }) {
  const [hasError, setHasError] = useState(false);
  const url = getNodeLogoUrl(label);
  if (url && !hasError) {
    return (
      <img
        src={url}
        alt={label}
        className="h-5 w-5 object-contain"
        onError={() => setHasError(true)}
      />
    );
  }
  // Fallback: initials avatar
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent">
      {label.charAt(0).toUpperCase()}
    </span>
  );
}

const SLIDER_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
] as const;

function getSliderColor(value: number): string {
  if (value < 25) return SLIDER_COLORS[0];
  if (value < 50) return SLIDER_COLORS[1];
  if (value < 75) return SLIDER_COLORS[2];
  return SLIDER_COLORS[3];
}

const METRIC_TABS = ['CPU', 'Memory', 'Disk', 'Region'] as const;
type MetricTab = typeof METRIC_TABS[number];

interface ServiceNodeProps extends NodeProps {
  data: ServiceNodeData;
}

function AnimatedNumber({ value }: { value: number | string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setAnimate(true);
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setAnimate(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  return (
    <span
      className={cn(
        "transition-all duration-150 ease-out inline-block min-w-[20px]",
        animate ? "opacity-0 scale-95 -translate-y-1" : "opacity-100 scale-100 translate-y-0"
      )}
    >
      {displayValue}
    </span>
  );
}

function ServiceNodeComponent({ id, data }: ServiceNodeProps) {
  const { setNodes } = useReactFlow();
  const edges = useEdges();
  const updateNodeInternals = useUpdateNodeInternals();

  const hasIncoming = edges.some((e) => e.target === id);
  const hasOutgoing = edges.some((e) => e.source === id);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, sliderValue: val } } : n))
      );
    },
    [id, setNodes]
  );

  const status = STATUS_CONFIG[data.status];
  const sliderColor = getSliderColor(data.sliderValue);
  const sliderPct = `${data.sliderValue}%`;

  const [activeMetric, setActiveMetric] = useState<MetricTab>('CPU');

  useEffect(() => {
    // Notify React Flow to update internal node layout/handle positions
    updateNodeInternals(id);
  }, [id, activeMetric, updateNodeInternals]);

  const metricValues: Record<MetricTab, number | string> = {
    CPU: data.cpu,
    Memory: data.memory,
    Disk: data.disk,
    Region: data.region,
  };

  return (
    <div
      className="relative w-[280px] rounded-xl border bg-surface p-0 shadow-2xl group animate-node-enter transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
      style={{
        '--status-glow': status.glow,
        '--status-border': status.border,
        '--status-glow-hover': status.glowHover,
        '--status-border-hover': status.borderHover,
        '--status-glow-active': status.glowActive,
        '--status-border-active': status.borderActive,
      } as React.CSSProperties}
    >
      {/* Handles - hollow green circle */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "!w-2.5 !h-2.5 !border-2 !border-[#10b981] !bg-bg transition-opacity duration-300 ease-out",
          hasIncoming 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        )}
        style={{ left: -5 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "!w-2.5 !h-2.5 !border-2 !border-[#10b981] !bg-bg transition-opacity duration-300 ease-out",
          hasOutgoing 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        )}
        style={{ right: -5 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <ServiceIcon label={data.label} />
          <span className="font-semibold text-foreground text-sm select-none">{data.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-accent/10 text-accent border border-accent/25 px-2 py-0.5 text-[10px] font-bold font-mono transition-colors duration-300 select-none">
            <AnimatedNumber value={data.costPerHour} />
          </span>
        </div>
      </div>

      {/* Metric Columns Grid (Values above, buttons below) */}
      <div className="grid grid-cols-4 gap-1 px-3.5 pt-2 pb-3.5 select-none">
        {METRIC_TABS.map((tab) => {
          const isActive = activeMetric === tab;
          return (
            <div
              key={tab}
              onClick={(e) => { e.stopPropagation(); setActiveMetric(tab); }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group/col"
            >
              <span className={cn(
                "font-mono text-[11px] transition-colors duration-200",
                isActive ? "text-foreground font-semibold" : "text-foreground-2"
              )}>
                {metricValues[tab]}{tab === 'Memory' || tab === 'Disk' ? ' GB' : ''}
              </span>
              <button
                className={cn(
                  'w-full flex items-center justify-center gap-1 rounded-md py-1 text-[10px] font-medium transition-all duration-200 border',
                  isActive
                    ? 'bg-surface-2 text-foreground border-border/60 shadow-sm'
                    : 'bg-transparent text-muted border-transparent hover:text-foreground-2 hover:bg-surface-2/40',
                )}
              >
                <span>
                  {tab === 'CPU' ? '⚡' : tab === 'Memory' ? '💾' : tab === 'Disk' ? '📀' : '🌐'}
                </span>
                {tab}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive Slider */}
      <div className="flex items-center gap-3 px-4 pb-3.5">
        <input
          type="range"
          min="0"
          max="100"
          value={data.sliderValue}
          onChange={handleSliderChange}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="nodrag flex-1 h-1 rounded-full appearance-none cursor-pointer bg-surface-3 border-none outline-none focus:outline-none transition-all duration-300 ease-out"
          style={{
            background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${sliderPct}, #2a2a35 ${sliderPct}, #2a2a35 100%)`,
          }}
        />
        <span className="w-10 text-right font-mono text-xs text-foreground-2 select-none">
          <AnimatedNumber value={metricValues[activeMetric]} />
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-3.5">
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-colors duration-300 ease-in-out select-none', status.className)}>
          {data.status === 'healthy' ? '✓' : '⚠'} {status.label}
        </span>
        <span className="text-sm font-bold tracking-tight text-[#ff9900] transition-transform duration-300 hover:scale-105 cursor-pointer select-none">
          aws<span className="text-xs font-semibold ml-0.5">↗</span>
        </span>
      </div>
    </div>
  );
}

export const ServiceNode = memo(ServiceNodeComponent);
