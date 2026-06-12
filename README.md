# App Graph Builder - Intern Task Submission

A high-performance, premium interactive **App Graph Builder** dashboard built for the **Aiynx Intern Task**. 

Recreates a custom node graph workspace with theme-reactive connection edges, dynamic state management, custom color-coded status badges, and interactive resource sliders.

🎥 **Loom Video Walkthrough**: [Watch the Explanation Video](https://www.loom.com/share/58053d3f311c46be9d7fad850f4d8167)  
*(Please replace `YOUR_LOOM_VIDEO_LINK_HERE` with your actual Loom recording URL before submitting)*

🔗 **GitHub Repository**: [github.com/Py528/app-graph-builder](https://github.com/Py528/app-graph-builder)

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open the local server URL (e.g., `http://localhost:5173/` or `http://localhost:5174/` as shown in your terminal) to view the app.

### 3. Build & Validate
```bash
npm run typecheck # Strict TypeScript check
npm run build     # Production bundler build
```

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 19 + TypeScript + Vite.
- **Graph Workspace**: `@xyflow/react` (React Flow 12) for rendering dynamic nodes, step-edges, custom handles, and interactive grid canvas.
- **State Management**:
  - **Zustand**: Centralized store for light-weight UI states (selected nodes, active inspector tabs, mobile panel overlays).
  - **React Flow State**: Managed inside React Flow's native hooks (`useNodesState` / `useEdgesState`) to avoid duplicate sources of truth.
- **Server API & Cache**: `@tanstack/react-query` to manage querying, caching, and state synchronization of mock apps and graph layouts.
- **Mock Service Layer**: **MSW** (Mock Service Worker) to simulate asynchronous network responses from memory.
- **Styling**: Tailwind CSS with key vanilla CSS overrides in `index.css`.

---

## ✨ Features & Visual Enhancements

1. **Pixel-Perfect Redesign**:
   - Recreated custom node card surfaces in pure obsidian-black (`#09090b`) contrasted against a soft-dark grid canvas (`#121214`) to match the target design style.
   - Consolidated values and buttons into a clean **4-column metrics grid** with centered layouts.
2. **Interactive Resource Slider**:
   - Configured value-driven color gradients (blue, green, orange, red) inside the sliders indicating resource status.
3. **Handle & Arrow Alignment**:
   - Configured custom Target/Source handles as hollow emerald circles (`#10b981`).
   - Integrated `useUpdateNodeInternals` to recalculate anchor coordinates dynamically when tab views switch or on mounting.
   - Refactored canvas animations to prevent handle connection offsets during initial render.
4. **Color-Coded Status Panel**:
   - Added color-coded badges (green for Success, amber for Degraded, red for Error) across custom nodes, footers, and selector panels in the inspector.
5. **Codebase Cleanup**:
   - Removed unused starter files, boilerplate UI components, and directory duplicates to ensure a clean package and smaller production bundle footprint.
