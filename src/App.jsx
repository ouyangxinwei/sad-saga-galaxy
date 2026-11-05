import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Stages from '@/pages/Stages';
import Battle from '@/pages/Battle';
import Formation from '@/pages/Formation';
import Synthesis from '@/pages/Synthesis';
import Forge from '@/pages/Forge';
import Settings from '@/pages/Settings';
import Debug from '@/pages/Debug';
import ResourceExchange from '@/pages/ResourceExchange';
import { GameProvider } from '@/lib/GameContext';

/**
 * 应用组合入口（UI Composition Root）。
 *
 * 在这里集中声明全局 Provider、路由和全局通知组件。
 * Provider 的嵌套顺序会影响其下层组件可访问的 Context；
 * 新增页面时应同时检查路由、导航入口及 PageNotFound 处理。
 * 本文件只负责组装，不承载具体游戏业务规则。
 */
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
            <Route path="/debug" element={<Debug />} />
            <Route path="/resource-exchange" element={<ResourceExchange />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
