import { useState } from 'react';
import AppShell from '@/components/common/AppShell';
import TopBar from '@/components/home/TopBar';
import PlayerHeader from '@/components/home/PlayerHeader';
import QuickFormation from '@/components/home/QuickFormation';
import FortuneCard from '@/components/home/FortuneCard';
import MainMenuGrid from '@/components/home/MainMenuGrid';
import HomePanels from '@/components/home/HomePanels';

export default function Home() {
  const [panel, setPanel] = useState(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <div className="space-y-3 sm:space-y-4">
          <TopBar onOpen={setPanel} />
          <div className="grid gap-3 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-4">
            <div className="space-y-3">
              <PlayerHeader />
              <QuickFormation />
              <FortuneCard onClick={setPanel} />
            </div>
            <MainMenuGrid onOpen={setPanel} />
          </div>
        </div>
      </div>
      <HomePanels panel={panel} onClose={() => setPanel(null)} />
    </AppShell>
  );
}