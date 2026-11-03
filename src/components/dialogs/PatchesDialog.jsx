import { useCallback, useEffect, useState } from 'react';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { useGame } from '@/lib/GameContext';
import { APP_VERSION, CHANGELOG, RELEASE_DATE } from '@/lib/version';
import { checkCurrentDeployment } from '@/lib/githubDeployment';

const STATUS_STYLES = {
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  'in-progress': 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  failed: 'border-red-400/30 bg-red-400/10 text-red-300',
  'not-deployed': 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  unknown: 'border-white/15 bg-white/5 text-muted-foreground',
};

export default function PatchesDialog({ open, onClose }) {
  const { t, lang } = useGame();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [refreshError, setRefreshError] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true); setRefreshError(false);
    try {
      const result = await checkCurrentDeployment();
      setDeployment(result);
      setLastChecked(result.checkedAt ? new Date(result.checkedAt) : new Date());
    } catch {
      setRefreshError(true);
      setDeployment((previous) => previous || { status: 'unknown', reason: 'request-failed' });
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { if (open) refresh(); }, [open, refresh]);
  const status = deployment?.status || 'unknown';
  const shortSha = (value) => value ? `${value.slice(0, 7)}…${value.slice(-4)}` : '—';
  return (
    <GameModal open={open} onClose={onClose} title={t('patches.title')}
      subtitle={`${APP_VERSION} · ${CHANGELOG[0].title[lang] || CHANGELOG[0].title.zh} · ${RELEASE_DATE}`}
      width="max-w-2xl">
      <div className="space-y-4">
        <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><GameIcon name="Github" className="h-4 w-4 text-foreground/80" /><h4 className="text-sm font-semibold text-foreground">{t('deployment.title')}</h4></div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${STATUS_STYLES[status] || STATUS_STYLES.unknown}`}>{t(`deployment.status.${status}`)}</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-black/10 p-2.5"><div className="text-[10px] text-muted-foreground">{t('deployment.currentVersion')}</div><div className="mt-1 text-xs font-semibold text-foreground">{APP_VERSION}</div></div>
            <div className="rounded-xl bg-black/10 p-2.5"><div className="text-[10px] text-muted-foreground">{t('deployment.branch')}</div><div className="mt-1 break-all text-xs font-semibold text-foreground">{deployment?.branch || 'standalone-migration'}</div></div>
            <div className="rounded-xl bg-black/10 p-2.5"><div className="text-[10px] text-muted-foreground">{t('deployment.currentCommit')}</div><div className="mt-1 break-all font-mono text-[11px] text-foreground">{shortSha(deployment?.currentSha)}</div></div>
            <div className="rounded-xl bg-black/10 p-2.5"><div className="text-[10px] text-muted-foreground">{t('deployment.deployedCommit')}</div><div className="mt-1 break-all font-mono text-[11px] text-foreground">{shortSha(deployment?.deployedSha)}</div></div>
          </div>
          {deployment?.runNumber && <div className="mt-2 text-[10px] text-muted-foreground">{t('deployment.workflowRun')} #{deployment.runNumber}</div>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
            <div className="text-[10px] text-muted-foreground">{t('deployment.lastChecked')}: {lastChecked ? lastChecked.toLocaleString() : '—'}{refreshError && <div className="mt-1 text-amber-300">{t('deployment.refreshFailed')}</div>}{loading && <div className="mt-1 text-sky-300">{t('deployment.checking')}</div>}</div>
            <div className="flex items-center gap-2">
              {deployment?.runUrl && <a href={deployment.runUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-2 text-[10px] text-muted-foreground hover:text-foreground"><GameIcon name="ExternalLink" className="h-3 w-3" />{t('deployment.actions')}</a>}
              <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-[10px] font-semibold text-primary transition hover:bg-primary/15 disabled:cursor-wait disabled:opacity-50"><GameIcon name="RefreshCw" className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />{loading ? t('deployment.checking') : t('deployment.refresh')}</button>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{t('deployment.matchRule')}</p>
        </section>
        {CHANGELOG.map((entry, index) => <article key={`${entry.version}-${index}`} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <div className="flex items-center gap-2"><span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] tracking-wider text-primary">{entry.version}</span><h5 className="text-[12px] text-foreground/90">{entry.title[lang] || entry.title.zh}</h5></div>
          <ul className="mt-2 space-y-1.5">{(entry.items[lang] || entry.items.zh).map((line) => <li key={line} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground"><GameIcon name="ChevronRight" className="mt-[3px] h-3 w-3 shrink-0 text-primary/60" />{line}</li>)}</ul>
        </article>)}
      </div>
    </GameModal>
  );
}
