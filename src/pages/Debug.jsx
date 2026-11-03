import { useCallback, useEffect, useState } from 'react';
import { Bug, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import PageHeader from '@/components/common/PageHeader';
import DebugConsole from '@/components/debug/DebugConsole';
import { clearLogs, getLogs, subscribeLogs } from '@/lib/logger';

export default function Debug() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState(() => getLogs());
  const refresh = useCallback(() => setLogs(getLogs()), []);
  useEffect(() => subscribeLogs(() => refresh()), [refresh]);
  const clear = () => {
    if (window.confirm('Clear all saved debug logs? This will not affect your game save.')) clearLogs();
  };
  return (
    <AppShell>
      <div className="mx-auto max-w-[820px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => navigate('/settings')} className="tap rounded-lg border border-white/10 p-2 text-muted-foreground"><ChevronLeft size={15} /></button>
          <div className="min-w-0 flex-1"><PageHeader title="Debug Console" subtitle="Saga Execution Logger · V1.0" /></div>
          <Bug className="h-5 w-5 text-primary" />
        </div>
        <div className="mb-3 rounded-xl border border-primary/15 bg-primary/[0.04] px-3 py-2 text-[9px] leading-relaxed text-muted-foreground">
          Logs are stored locally in this browser. The newest 2,000 records are retained. Clearing debug logs never deletes your game save.
        </div>
        <DebugConsole logs={logs} onClear={clear} onRefresh={refresh} />
      </div>
    </AppShell>
  );
}
