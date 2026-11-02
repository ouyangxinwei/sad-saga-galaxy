import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Stages from '@/pages/Stages';
import Battle from '@/pages/Battle';
import Formation from '@/pages/Formation';
import Synthesis from '@/pages/Synthesis';
import Forge from '@/pages/Forge';
import Settings from '@/pages/Settings';
import { GameProvider } from '@/lib/GameContext';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <GameProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stages" element={<Stages />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/formation" element={<Formation />} />
            <Route path="/synthesis" element={<Synthesis />} />
            <Route path="/forge" element={<Forge />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
