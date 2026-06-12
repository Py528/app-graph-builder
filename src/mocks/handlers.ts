import { http, HttpResponse } from 'msw';
import type { App, AppGraph } from '@/types';

const apps: App[] = [
  { id: 'app-1', name: 'supertokens-golang', icon: '💡', color: '#8b5cf6' },
  { id: 'app-2', name: 'supertokens-java', icon: '⚙️', color: '#6366f1' },
  { id: 'app-3', name: 'supertokens-python', icon: '🚀', color: '#ef4444' },
  { id: 'app-4', name: 'supertokens-ruby', icon: '📦', color: '#8b5cf6' },
  { id: 'app-5', name: 'supertokens-go', icon: '🔧', color: '#ec4899' },
];

const graphs: Record<string, AppGraph> = {
  'app-1': {
    nodes: [
      {
        id: 'n1',
        type: 'service',
        position: { x: 80, y: 80 },
        data: {
          label: 'API Gateway',
          description: 'Main entry point for all requests',
          status: 'healthy',
          nodeType: 'gateway',
          sliderValue: 42,
          costPerHour: '$0.03/HR',
          cpu: 0.02,
          memory: 0.05,
          disk: 10.0,
          region: 1,
        },
      },
      {
        id: 'n2',
        type: 'service',
        position: { x: 480, y: 60 },
        data: {
          label: 'Postgres',
          description: 'Primary relational database',
          status: 'healthy',
          nodeType: 'database',
          sliderValue: 68,
          costPerHour: '$0.03/HR',
          cpu: 0.02,
          memory: 0.05,
          disk: 10.0,
          region: 1,
        },
      },
      {
        id: 'n3',
        type: 'service',
        position: { x: 80, y: 360 },
        data: {
          label: 'Redis',
          description: 'Cache and session store',
          status: 'down',
          nodeType: 'database',
          sliderValue: 22,
          costPerHour: '$0.03/HR',
          cpu: 0.02,
          memory: 0.05,
          disk: 10.0,
          region: 1,
        },
      },
      {
        id: 'n4',
        type: 'service',
        position: { x: 460, y: 380 },
        data: {
          label: 'Mongodb',
          description: 'Document store for logs',
          status: 'down',
          nodeType: 'database',
          sliderValue: 88,
          costPerHour: '$0.03/HR',
          cpu: 0.02,
          memory: 0.05,
          disk: 10.0,
          region: 1,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep' },
      { id: 'e1-3', source: 'n1', target: 'n3', type: 'smoothstep' },
      { id: 'e2-4', source: 'n2', target: 'n4', type: 'smoothstep' },
      { id: 'e3-4', source: 'n3', target: 'n4', type: 'smoothstep' },
    ],
  },
  'app-2': {
    nodes: [
      {
        id: 'n1',
        type: 'service',
        position: { x: 120, y: 100 },
        data: {
          label: 'Auth Service',
          description: 'Java authentication microservice',
          status: 'healthy',
          nodeType: 'service',
          sliderValue: 55,
          costPerHour: '$0.05/HR',
          cpu: 0.04,
          memory: 0.12,
          disk: 20.0,
          region: 1,
        },
      },
      {
        id: 'n2',
        type: 'service',
        position: { x: 480, y: 100 },
        data: {
          label: 'MySQL',
          description: 'Java service relational DB',
          status: 'healthy',
          nodeType: 'database',
          sliderValue: 30,
          costPerHour: '$0.04/HR',
          cpu: 0.03,
          memory: 0.08,
          disk: 50.0,
          region: 1,
        },
      },
      {
        id: 'n3',
        type: 'service',
        position: { x: 300, y: 360 },
        data: {
          label: 'Message Queue',
          description: 'Kafka message broker',
          status: 'degraded',
          nodeType: 'service',
          sliderValue: 70,
          costPerHour: '$0.06/HR',
          cpu: 0.05,
          memory: 0.2,
          disk: 30.0,
          region: 2,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep' },
      { id: 'e1-3', source: 'n1', target: 'n3', type: 'smoothstep' },
    ],
  },
  'app-3': {
    nodes: [
      {
        id: 'n1',
        type: 'service',
        position: { x: 200, y: 80 },
        data: {
          label: 'FastAPI',
          description: 'Python REST API service',
          status: 'healthy',
          nodeType: 'service',
          sliderValue: 45,
          costPerHour: '$0.02/HR',
          cpu: 0.01,
          memory: 0.04,
          disk: 5.0,
          region: 1,
        },
      },
      {
        id: 'n2',
        type: 'service',
        position: { x: 500, y: 200 },
        data: {
          label: 'PostgreSQL',
          description: 'Python app database',
          status: 'healthy',
          nodeType: 'database',
          sliderValue: 60,
          costPerHour: '$0.03/HR',
          cpu: 0.02,
          memory: 0.06,
          disk: 15.0,
          region: 1,
        },
      },
      {
        id: 'n3',
        type: 'service',
        position: { x: 100, y: 300 },
        data: {
          label: 'Celery Worker',
          description: 'Async task queue',
          status: 'down',
          nodeType: 'service',
          sliderValue: 10,
          costPerHour: '$0.01/HR',
          cpu: 0.01,
          memory: 0.02,
          disk: 2.0,
          region: 1,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep' },
      { id: 'e1-3', source: 'n1', target: 'n3', type: 'smoothstep' },
    ],
  },
};

// Fill in remaining apps with copies of app-1 pattern
['app-4', 'app-5'].forEach((id) => {
  graphs[id] = JSON.parse(JSON.stringify(graphs['app-1']));
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const handlers = [
  http.get('/api/apps', async () => {
    await delay(400);
    return HttpResponse.json({ data: apps });
  }),

  http.post('/api/apps', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { name: string; icon?: string; color?: string };
    const id = `app-${Date.now()}`;
    const newApp: App = {
      id,
      name: body.name,
      icon: body.icon || '💡',
      color: body.color || '#8b5cf6',
    };
    apps.push(newApp);

    // Initialize standard graph for the new app with a default API Gateway node
    graphs[id] = {
      nodes: [
        {
          id: 'n1',
          type: 'service',
          position: { x: 250, y: 150 },
          data: {
            label: 'API Gateway',
            description: 'Main entry point for all requests',
            status: 'healthy',
            nodeType: 'gateway',
            sliderValue: 50,
            costPerHour: '$0.03/HR',
            cpu: 0.02,
            memory: 0.05,
            disk: 10.0,
            region: 1,
          },
        },
      ],
      edges: [],
    };

    return HttpResponse.json({ data: newApp });
  }),

  http.get('/api/apps/:appId/graph', async ({ params }) => {
    await delay(600);
    const { appId } = params;
    const graph = graphs[appId as string];
    if (!graph) {
      return HttpResponse.json({ error: 'App not found' }, { status: 404 });
    }
    // Simulate occasional failure for demo
    if (Math.random() < 0.0) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    return HttpResponse.json({ data: graph });
  }),
];
