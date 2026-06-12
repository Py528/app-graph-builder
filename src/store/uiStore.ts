import { create } from 'zustand';
import type { InspectorTab } from '@/types';

interface UIState {
  selectedAppId: string;
  selectedNodeId: string | null;
  isMobilePanelOpen: boolean;
  activeInspectorTab: InspectorTab;

  setSelectedAppId: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setMobilePanelOpen: (open: boolean) => void;
  toggleMobilePanel: () => void;
  setActiveInspectorTab: (tab: InspectorTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedAppId: 'app-1',
  selectedNodeId: null,
  isMobilePanelOpen: false,
  activeInspectorTab: 'config',

  setSelectedAppId: (id) =>
    set({ selectedAppId: id, selectedNodeId: null }),

  setSelectedNodeId: (id) =>
    set({ selectedNodeId: id }),

  setMobilePanelOpen: (open) =>
    set({ isMobilePanelOpen: open }),

  toggleMobilePanel: () =>
    set((s) => ({ isMobilePanelOpen: !s.isMobilePanelOpen })),

  setActiveInspectorTab: (tab) =>
    set({ activeInspectorTab: tab }),
}));
