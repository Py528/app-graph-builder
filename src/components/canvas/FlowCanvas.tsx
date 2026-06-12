import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  type Connection,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ServiceNode } from './ServiceNode';
import { useUIStore } from '@/store/uiStore';
import { useAppGraph } from '@/hooks/useGraphData';
import type { ServiceNode as ServiceNodeType, AppEdge } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw, Settings, Copy, Trash2, Plus } from 'lucide-react';

const NODE_TYPES = { service: ServiceNode };

export function FlowCanvas() {
  const selectedAppId = useUIStore((s) => s.selectedAppId);
  const setSelectedNodeId = useUIStore((s) => s.setSelectedNodeId);
  const setActiveTab = useUIStore((s) => s.setActiveInspectorTab);

  // Reactively track dark mode so edge colors update on theme switch
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const { data: graphData, isLoading, isError, error, refetch } = useAppGraph(selectedAppId);

  const [nodes, setNodes, onNodesChange] = useNodesState<ServiceNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);

  const fitViewRef = useRef<(() => void) | null>(null);

  const { screenToFlowPosition } = useReactFlow();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);

  // History state refs
  const historyRef = useRef<{
    past: Array<{ nodes: ServiceNodeType[]; edges: AppEdge[] }>;
    future: Array<{ nodes: ServiceNodeType[]; edges: AppEdge[] }>;
  }>({ past: [], future: [] });

  const lastSavedStateRef = useRef<{ nodes: ServiceNodeType[]; edges: AppEdge[] } | null>(null);

  const saveStateToHistoryIfNeeded = useCallback(() => {
    if (!lastSavedStateRef.current) return;
    const nodesStr = JSON.stringify(nodes);
    const edgesStr = JSON.stringify(edges);
    const lastNodesStr = JSON.stringify(lastSavedStateRef.current.nodes);
    const lastEdgesStr = JSON.stringify(lastSavedStateRef.current.edges);

    if (nodesStr !== lastNodesStr || edgesStr !== lastEdgesStr) {
      historyRef.current.past.push(lastSavedStateRef.current);
      if (historyRef.current.past.length > 50) {
        historyRef.current.past.shift();
      }
      historyRef.current.future = [];
      lastSavedStateRef.current = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      };
    }
  }, [nodes, edges]);

  // Debounced history saver for positions, text changes, etc.
  useEffect(() => {
    if (!nodes.length) return;

    const timeout = setTimeout(() => {
      const last = lastSavedStateRef.current;
      if (!last) {
        lastSavedStateRef.current = {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        };
        return;
      }

      const nodesStr = JSON.stringify(nodes);
      const edgesStr = JSON.stringify(edges);
      const lastNodesStr = JSON.stringify(last.nodes);
      const lastEdgesStr = JSON.stringify(last.edges);

      if (nodesStr !== lastNodesStr || edgesStr !== lastEdgesStr) {
        historyRef.current.past.push(last);
        if (historyRef.current.past.length > 50) {
          historyRef.current.past.shift();
        }
        historyRef.current.future = [];
        lastSavedStateRef.current = {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        };
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    saveStateToHistoryIfNeeded();

    const { past, future } = historyRef.current;
    if (past.length === 0) return;

    const previous = past.pop();
    if (!previous) return;

    future.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });

    setNodes(previous.nodes);
    setEdges(previous.edges);

    lastSavedStateRef.current = JSON.parse(JSON.stringify(previous));
  }, [nodes, edges, setNodes, setEdges, saveStateToHistoryIfNeeded]);

  const handleRedo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (future.length === 0) return;

    const next = future.pop();
    if (!next) return;

    past.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });

    setNodes(next.nodes);
    setEdges(next.edges);

    lastSavedStateRef.current = JSON.parse(JSON.stringify(next));
  }, [nodes, edges, setNodes, setEdges]);

  // When graph data loads, update nodes/edges and fit view
  useEffect(() => {
    if (!graphData) return;
    setNodes(graphData.nodes as ServiceNodeType[]);
    setEdges(graphData.edges);
    // Reset history when app changes or graph data is loaded first time
    historyRef.current = { past: [], future: [] };
    lastSavedStateRef.current = {
      nodes: JSON.parse(JSON.stringify(graphData.nodes)),
      edges: JSON.parse(JSON.stringify(graphData.edges)),
    };
    // Fit view after a small delay
    setTimeout(() => fitViewRef.current?.(), 100);
  }, [graphData, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      saveStateToHistoryIfNeeded();
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges, saveStateToHistoryIfNeeded],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: ServiceNodeType) => {
      setSelectedNodeId(node.id);
      setActiveTab('config');
      useUIStore.getState().setMobilePanelOpen(true);
    },
    [setSelectedNodeId, setActiveTab],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // Undo shortcut: Ctrl+Z or Cmd+Z
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Redo shortcut: Ctrl+Y or Cmd+Y
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((n) => n.selected);
        const selectedEdges = edges.filter((e) => e.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          saveStateToHistoryIfNeeded();

          if (selectedNodes.length > 0) {
            const selectedIds = new Set(selectedNodes.map((n) => n.id));
            setNodes((nds) => nds.filter((n) => !n.selected));
            setEdges((eds) =>
              eds.filter(
                (e) =>
                  !e.selected &&
                  !selectedIds.has(e.source) &&
                  !selectedIds.has(e.target),
              ),
            );
            setSelectedNodeId(null);
          } else if (selectedEdges.length > 0) {
            setEdges((eds) => eds.filter((e) => !e.selected));
          }
        }
      }
    },
    [nodes, edges, setNodes, setEdges, setSelectedNodeId, handleUndo, handleRedo, saveStateToHistoryIfNeeded],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Handle node changes (including selection sync)
  const handleNodesChange = useCallback(
    (changes: NodeChange<ServiceNodeType>[]) => {
      onNodesChange(changes);
      const selectChange = changes.find((c) => c.type === 'select');
      if (selectChange && selectChange.type === 'select') {
        if (!selectChange.selected) setSelectedNodeId(null);
      }
    },
    [onNodesChange, setSelectedNodeId],
  );

  const getNonOverlappingPosition = useCallback((startPosition?: { x: number; y: number }) => {
    let x = startPosition?.x ?? 100;
    let y = startPosition?.y ?? 100;

    const nodeWidth = 280;
    const nodeHeight = 180;
    const horizontalSpacing = 60;
    const verticalSpacing = 40;

    let hasOverlap = true;
    let attempts = 0;

    while (hasOverlap && attempts < 50) {
      hasOverlap = false;
      for (const node of nodes) {
        const dx = Math.abs(node.position.x - x);
        const dy = Math.abs(node.position.y - y);

        if (dx < (nodeWidth + horizontalSpacing) && dy < (nodeHeight + verticalSpacing)) {
          hasOverlap = true;
          x = node.position.x + nodeWidth + horizontalSpacing;
          if (x > 1200) {
            x = 100;
            y += nodeHeight + verticalSpacing;
          }
          break;
        }
      }
      attempts++;
    }

    return { x, y };
  }, [nodes]);

  const addNewNode = useCallback(() => {
    saveStateToHistoryIfNeeded();
    const id = `n${Date.now()}`;
    const position = getNonOverlappingPosition({ x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 });
    const newNode: ServiceNodeType = {
      id,
      type: 'service',
      position,
      data: {
        label: 'New Service',
        description: '',
        status: 'healthy',
        nodeType: 'service',
        sliderValue: 50,
        costPerHour: '$0.02/HR',
        cpu: 0.01,
        memory: 0.05,
        disk: 5.0,
        region: 1,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, saveStateToHistoryIfNeeded, getNonOverlappingPosition]);

  const duplicateNode = useCallback((id: string) => {
    saveStateToHistoryIfNeeded();
    const nodeToDuplicate = nodes.find((n) => n.id === id);
    if (!nodeToDuplicate) return;

    const newId = `n${Date.now()}`;
    const duplicatedNode: ServiceNodeType = {
      ...JSON.parse(JSON.stringify(nodeToDuplicate)),
      id: newId,
      selected: true,
      position: {
        x: nodeToDuplicate.position.x + 40,
        y: nodeToDuplicate.position.y + 40,
      },
    };

    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      duplicatedNode,
    ]);
    setSelectedNodeId(newId);
  }, [nodes, setNodes, setSelectedNodeId, saveStateToHistoryIfNeeded]);

  const deleteNode = useCallback((id: string) => {
    saveStateToHistoryIfNeeded();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (useUIStore.getState().selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  }, [setNodes, setEdges, setSelectedNodeId, saveStateToHistoryIfNeeded]);

  const addNodeAt = useCallback((clientX: number, clientY: number) => {
    saveStateToHistoryIfNeeded();
    const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
    const startPos = { x: flowPos.x - 140, y: flowPos.y - 90 };
    const position = getNonOverlappingPosition(startPos);
    const id = `n${Date.now()}`;
    const newNode: ServiceNodeType = {
      id,
      type: 'service',
      position,
      data: {
        label: 'New Service',
        description: '',
        status: 'healthy',
        nodeType: 'service',
        sliderValue: 50,
        costPerHour: '$0.02/HR',
        cpu: 0.01,
        memory: 0.05,
        disk: 5.0,
        region: 1,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [screenToFlowPosition, setNodes, saveStateToHistoryIfNeeded, getNonOverlappingPosition]);

  const onNodeContextMenu = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any, node: ServiceNodeType) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  // Close context menu on any global window click
  useEffect(() => {
    const handleWindowClick = () => setContextMenu(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Expose global hooks to top bar
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__addNode = addNewNode;
    (window as unknown as Record<string, unknown>).__fitView = () => fitViewRef.current?.();
    (window as unknown as Record<string, unknown>).__undo = handleUndo;
    (window as unknown as Record<string, unknown>).__redo = handleRedo;
  }, [addNewNode, handleUndo, handleRedo]);

  const defaultEdgeOptions = useMemo(() => {
    const edgeDotColor = isDark ? '#4a4a55' : '#b4bdd4';
    return {
      type: 'smoothstep',
      style: { stroke: edgeDotColor, strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeDotColor,
        width: 16,
        height: 16,
      },
      className: 'animated-edge',
      animated: false,
    };
  }, [isDark]);

  // Update existing edge styles when theme changes
  useEffect(() => {
    const edgeDotColor = isDark ? '#4a4a55' : '#b4bdd4';
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { stroke: edgeDotColor, strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeDotColor,
          width: 16,
          height: 16,
        },
      }))
    );
  }, [isDark, setEdges]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm">Loading graph…</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={36} className="text-destructive" />
          <div>
            <p className="font-semibold text-foreground mb-1">Failed to load graph</p>
            <p className="text-sm text-muted">{(error as Error).message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
              'bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors',
            )}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg relative" style={{ minHeight: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onInit={(instance) => {
          fitViewRef.current = () => instance.fitView({ padding: 0.15, duration: 600 });
        }}
        fitView
        fitViewOptions={{ padding: 0.15, duration: 600 }}
        deleteKeyCode={['Delete', 'Backspace']} // handled by our listener + RF native
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={2}
          color="#2f2f33ff"
        />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[160px] rounded-xl border border-border bg-surface backdrop-blur-md p-1 shadow-2xl animate-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.nodeId ? (
            <>
              <button
                onClick={() => {
                  const nodeId = contextMenu.nodeId!;
                  setSelectedNodeId(nodeId);
                  setActiveTab('config');
                  setNodes((nds) =>
                    nds.map((n) => ({
                      ...n,
                      selected: n.id === nodeId,
                    }))
                  );
                  useUIStore.getState().setMobilePanelOpen(true);
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-surface-2 hover:text-accent transition-colors"
              >
                <Settings size={14} />
                Configure
              </button>
              <button
                onClick={() => {
                  duplicateNode(contextMenu.nodeId!);
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-surface-2 hover:text-accent transition-colors"
              >
                <Copy size={14} />
                Duplicate
              </button>
              <div className="my-1 h-[1px] bg-border" />
              <button
                onClick={() => {
                  deleteNode(contextMenu.nodeId!);
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                addNodeAt(contextMenu.x, contextMenu.y);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-surface-2 hover:text-accent transition-colors"
            >
              <Plus size={14} />
              Add Service
            </button>
          )}
        </div>
      )}
    </div>
  );
}

