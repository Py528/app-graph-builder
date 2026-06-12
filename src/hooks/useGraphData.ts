import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { App, AppGraph } from '@/types';

interface ApiResponse<T> {
  data: T;
}

async function fetchApps(): Promise<App[]> {
  const res = await fetch('/api/apps');
  if (!res.ok) throw new Error('Failed to fetch apps');
  const json: ApiResponse<App[]> = await res.json();
  return json.data;
}

async function fetchGraph(appId: string): Promise<AppGraph> {
  const res = await fetch(`/api/apps/${appId}/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph');
  const json: ApiResponse<AppGraph> = await res.json();
  return json.data;
}

async function createApp(newApp: { name: string; icon: string; color: string }): Promise<App> {
  const res = await fetch('/api/apps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newApp),
  });
  if (!res.ok) throw new Error('Failed to create app');
  const json: ApiResponse<App> = await res.json();
  return json.data;
}

export function useApps() {
  return useQuery({
    queryKey: ['apps'],
    queryFn: fetchApps,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAppGraph(appId: string) {
  return useQuery({
    queryKey: ['graph', appId],
    queryFn: () => fetchGraph(appId),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });
}
