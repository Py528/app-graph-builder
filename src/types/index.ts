import type { Node, Edge } from '@xyflow/react';

export type NodeStatus = 'healthy' | 'degraded' | 'down';
export type NodeType = 'service' | 'database' | 'gateway';

export interface ServiceNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  status: NodeStatus;
  nodeType: NodeType;
  sliderValue: number;
  costPerHour: string;
  cpu: number;
  memory: number;
  disk: number;
  region: number;
}

export type ServiceNode = Node<ServiceNodeData, 'service'>;
export type AppEdge = Edge;

export interface AppGraph {
  nodes: ServiceNode[];
  edges: AppEdge[];
}

export interface App {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type InspectorTab = 'config' | 'runtime';
