import { useCallback, useState, useEffect } from 'react';
import { useReactFlow, useNodes } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUIStore } from '@/store/uiStore';
import type { ServiceNode, NodeStatus } from '@/types';
import { Layers, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: { value: NodeStatus; label: string; variant: 'healthy' | 'degraded' | 'down' }[] = [
  { value: 'healthy', label: 'Healthy', variant: 'healthy' },
  { value: 'degraded', label: 'Degraded', variant: 'degraded' },
  { value: 'down', label: 'Down', variant: 'down' },
];

export function NodeInspector() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useUIStore((s) => s.setSelectedNodeId);
  const activeTab = useUIStore((s) => s.activeInspectorTab);
  const setActiveTab = useUIStore((s) => s.setActiveInspectorTab);

  const nodes = useNodes<ServiceNode>();
  const { setNodes } = useReactFlow<ServiceNode>();
  const node = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : undefined;

  // Local input string so users can type freely (e.g. clear field) before committing
  const [sliderInput, setSliderInput] = useState('');

  useEffect(() => {
    if (node) setSliderInput(String(node.data.sliderValue));
  }, [node]);

  const updateNodeData = useCallback(
    (updates: Partial<ServiceNode['data']>) => {
      if (!selectedNodeId) return;
      setNodes((nds) =>
        nds.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n)),
      );
    },
    [selectedNodeId, setNodes],
  );

  const commitSliderValue = useCallback(
    (raw: string) => {
      let value = Number(raw);
      if (Number.isNaN(value)) value = 0;
      value = Math.min(100, Math.max(0, Math.round(value)));
      setSliderInput(String(value));
      updateNodeData({ sliderValue: value });
    },
    [updateNodeData],
  );

  const handleAllocationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setSliderInput(raw);

      let val = Number(raw);
      if (!Number.isNaN(val)) {
        val = Math.min(100, Math.max(0, val));
        updateNodeData({ sliderValue: val });
      }
    },
    [updateNodeData]
  );

  if (!node) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-muted">
          <Layers size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No node selected</p>
          <p className="mt-1 text-xs text-muted">
            Click a node on the canvas to inspect and configure it.
          </p>
        </div>
      </div>
    );
  }

  const statusOption = STATUS_OPTIONS.find((s) => s.value === node.data.status) ?? STATUS_OPTIONS[0];

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Service Node</h2>
          <p className="mt-0.5 font-mono text-[11px] text-muted">{node.id}</p>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
          title="Close inspector"
        >
          <X size={15} />
        </button>
      </div>

      {/* Status pill + selector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground-2">Status</span>
        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateNodeData({ status: opt.value })}
              className="transition-opacity"
              style={{ opacity: node.data.status === opt.value ? 1 : 0.45 }}
            >
              <Badge variant={opt.variant}>
                {opt.value === 'healthy' && '✓'}
                {opt.value === 'degraded' && '⚠'}
                {opt.value === 'down' && '⚠'}
                {opt.label}
              </Badge>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted">
          Current:{' '}
          <span
            className={cn(
              node.data.status === 'healthy' && 'text-accent font-semibold',
              node.data.status === 'degraded' && 'text-warning font-semibold',
              node.data.status === 'down' && 'text-destructive font-semibold'
            )}
          >
            {statusOption.label}
          </span>
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'config' | 'runtime')}>
        <TabsList className="w-full">
          <TabsTrigger value="config" className="flex-1">Config</TabsTrigger>
          <TabsTrigger value="runtime" className="flex-1">Runtime</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-2" htmlFor="node-name">
              Name
            </label>
            <Input
              id="node-name"
              value={node.data.label}
              onChange={(e) => updateNodeData({ label: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-2" htmlFor="node-desc">
              Description
            </label>
            <Textarea
              id="node-desc"
              value={node.data.description ?? ''}
              onChange={(e) => updateNodeData({ description: e.target.value })}
              placeholder="What does this service do?"
            />
          </div>

          {/* Allocation input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground-2" htmlFor="node-allocation">
                Allocation
              </label>
              <span className="font-mono text-[11px] text-muted">0–100</span>
            </div>
             <Input
              id="node-allocation"
              type="number"
              min={0}
              max={100}
              value={sliderInput}
              onChange={handleAllocationChange}
              onBlur={(e) => commitSliderValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSliderValue((e.target as HTMLInputElement).value);
              }}
              className="w-full font-mono text-left"
            />
          </div>
        </TabsContent>

        <TabsContent value="runtime" className="flex flex-col gap-3">
          <RuntimeRow label="CPU" value={`${node.data.cpu} vCPU`} />
          <RuntimeRow label="Memory" value={`${node.data.memory} GB`} />
          <RuntimeRow label="Disk" value={`${node.data.disk} GB`} />
          <RuntimeRow label="Region" value={`${node.data.region}`} />
          <RuntimeRow label="Cost" value={node.data.costPerHour} />
          <RuntimeRow label="Type" value={node.data.nodeType} />
          <RuntimeRow label="Position" value={`x: ${Math.round(node.position.x)}, y: ${Math.round(node.position.y)}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RuntimeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
      <span className="text-xs text-foreground-2">{label}</span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}
