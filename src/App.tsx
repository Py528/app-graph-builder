import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { TopBar } from '@/components/layout/TopBar';
import { LeftRail } from '@/components/layout/LeftRail';
import { RightPanel } from '@/components/layout/RightPanel';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactFlowProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-bg text-foreground">
          {/* TopBar floats as a fixed overlay above the canvas */}
          <TopBar isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} />
          {/* LeftRail floats as a fixed overlay on the left */}
          <LeftRail />
          {/* Canvas fills all space left of the right panel */}
          <FlowCanvas />
          {/* Right panel: desktop sidebar + mobile drawer */}
          <RightPanel />
        </div>
      </ReactFlowProvider>
    </QueryClientProvider>
  );
}

export default App;
