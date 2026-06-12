# App Graph Builder

A small "App Graph Builder" UI built with React, ReactFlow (xyflow), TanStack Query, Zustand, and shadcn/ui-style components — recreating the provided dashboard layout (top bar, left rail, dotted canvas, right app/inspector panel).

## Setup

```bash
npm install
npm run dev       # start dev server (http://localhost:5173)
npm run build     # type-check + production build
npm run preview   # preview the production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit (strict mode)
```

No backend is required — all data comes from in-memory mock endpoints served via **MSW** (Mock Service Worker), registered in `src/mocks/handlers.ts` and started in `src/main.tsx` before the app renders.

## Project structure

```
src/
  components/
    layout/      TopBar, LeftRail, AppPanel, RightPanel (incl. mobile drawer)
    canvas/      FlowCanvas (ReactFlow setup), ServiceNode (custom node)
    inspector/   NodeInspector (status pill, tabs, slider/input sync)
    ui/          shadcn-style primitives (badge, tabs, input, textarea, skeleton)
  hooks/         useApps / useAppGraph (TanStack Query)
  store/         uiStore (Zustand)
  mocks/         MSW handlers + browser worker
  types/         shared TypeScript types
```

## Key decisions

- **ReactFlow custom node (`ServiceNode`)** mirrors the screenshot's service cards: title/icon, cost badge, settings button, metric tabs (CPU/Memory/Disk/Region), a colored allocation bar, and a status pill. Clicking the card or its settings icon selects the node and opens the inspector.
- **Zustand store** holds only UI state that doesn't belong to the server or to ReactFlow itself: `selectedAppId`, `selectedNodeId`, `isMobilePanelOpen`, `activeInspectorTab`. Node/edge data lives in ReactFlow's own state (via `useNodesState`/`useEdgesState`) and is read/written through `useReactFlow()` from the inspector — avoiding duplicated "source of truth" for node data.
- **TanStack Query** drives `/api/apps` and `/api/apps/:appId/graph`. Switching the selected app automatically refetches the graph (query key includes `appId`); results are cached so revisiting an app is instant. Loading uses skeletons/spinners; errors show a retry button.
- **Inspector slider/input sync**: the slider and numeric input both write to `node.data.sliderValue`. The text input keeps its own local string state so users can freely type/clear, and commits (clamped 0-100) on blur or Enter; the slider commits immediately on drag.
- **Responsive right panel**: on `lg`+ screens it's a fixed sidebar; below that it becomes a slide-over drawer toggled via Zustand (`isMobilePanelOpen`), with a backdrop and Escape-to-close.
- **Delete key handling** is done manually (ReactFlow's built-in `deleteKeyCode` is disabled) so we can also clean up edges connected to the deleted node and clear the inspector selection.
- **Fit view / Add node** are wired from the top bar into the canvas via small `window.__fitView` / `window.__addNode` callbacks - a pragmatic choice for this scope instead of introducing a separate context just for two imperative actions.
- **Styling**: Tailwind CSS with a small custom dark palette (`bg`, `surface`, `surface-2/3`, `accent`, etc.) tuned to match the screenshot's near-black, green-accent aesthetic, plus Radix primitives (Tabs, Slider) for accessible interaction.

## Known limitations

- The light/dark toggle in the top bar is a placeholder - only the dark theme is fully styled (matching the screenshot).
- "Share" and the brand `•••` menu in the top bar are placeholders with no behavior.
- New connections can be drawn between nodes (via `onConnect`), but there's no validation of allowed source/target types.
- The simulated API failure path exists in `src/mocks/handlers.ts` (the `Math.random() < 0.0` check) but is disabled by default; raise that probability to see the error/retry UI.
- "Add Node" creates a generic service node at a random position rather than an explicit drag-and-drop palette.
