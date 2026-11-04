import { useEffect, useState } from 'react';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, GhostButton, Bar } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { fmt } from '@/lib/format';

export default function IdleDialog({ open, onClose }) {
  const { t, idle, idleGems, idleGemStats, actions, cleared, lang, defOf } = useGame();
  const preview = actions.idlePreview();
  const cap = 720;
  const partyPassives = preview.bonus.details.map((item) => ({ ...item, name: defOf(item.id)?.name?.[lang] || defOf(item.id)?.name?.zh || item.id }));
  const [, setTick] = useState(0);
  const [batch, setBatch] = useState(10);
  const [settlement, setSettlement] = useState(null);
  const actualBatch = Math.min(batch, Math.max(0, Number(idleGems) || 0));

  useEffect(() => {
    if (!open) return undefined;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [open]);

  return (
    <GameModal open={open} onClose={onClose} title={t('idle.title')} subtitle={t('idle.desc')} width="max-w-md">
      <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${idle.active ? 'bg-[#6FE3C0] pulse-soft' : 'bg-white/30'}`} />
          <span className="text-[11px] text-foreground/85">{idle.active ? t('idle.on') : t('idle.off')}</span>
        </div>
        <GhostButton onClick={actions.toggleIdle} active={idle.active} className="px-3 py-1 text-[10px]">
          {idle.active ? t('idle.pause') : t('idle.start')}
        </GhostButton>
      </div>

      <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{t('idle.gemBalance')}</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary"><GameIcon name="Gem" className="h-3.5 w-3.5" />{fmt(idleGems || 0)}</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[9px]">
          <div><p className="text-muted-foreground">{t('idle.gemEarned')}</p><p className="tabular-nums text-emerald-300">{fmt(idleGemStats?.earnedFromWins || 0)}</p></div>
          <div><p className="text-muted-foreground">{t('idle.gemLoss')}</p><p className="tabular-nums text-amber-300">{fmt(idleGemStats?.earnedFromLosses || 0)}</p></div>
          <div><p className="text-muted-foreground">{t('idle.gemSpent')}</p><p className="tabular-nums">{fmt(idleGemStats?.spent || 0)}</p></div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{t('idle.accrued')}</span>
          <span className="tabular-nums">
            {Math.floor(preview.minutes / 60)}h {preview.minutes % 60}m {preview.seconds % 60}s / 12h
          </span>
        </div>
        <Bar value={preview.minutes} max={cap} color="#6FA8FF" className="mt-1.5" height="h-1" />

        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2 text-[10px]">
          <span className="text-muted-foreground">{t('idle.stage')}</span>
          <span className="font-semibold text-primary">{t('stages.' + preview.mode)} {preview.stage}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2">
            <p className="text-[9px] tracking-wider text-muted-foreground">{t('res.gold')}</p>
            <p className="flex items-center gap-1 text-[13px] tabular-nums text-primary">
              <GameIcon name="Coins" className="h-3 w-3" />
              {fmt(preview.gold)}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2">
            <p className="text-[9px] tracking-wider text-muted-foreground">{t('player.exp')}</p>
            <p className="flex items-center gap-1 text-[13px] tabular-nums text-accent">
              <GameIcon name="Sparkles" className="h-3 w-3" />
              {fmt(preview.exp)}
            </p>
          </div>
        </div>
        <div className="mt-2 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2">
          <p className="text-[9px] tracking-wider text-muted-foreground">{t('idle.perHour')}</p>
          <div className="mt-1 flex items-center justify-between text-[11px] tabular-nums">
            <span className="flex items-center gap-1 text-primary">
              <GameIcon name="Coins" className="h-3 w-3" />
              {fmt(preview.goldPerHour)}/h
            </span>
            <span className="flex items-center gap-1 text-accent">
              <GameIcon name="Sparkles" className="h-3 w-3" />
              {fmt(preview.expPerHour)}/h
            </span>
            <span className="flex items-center gap-1 text-foreground/75">
              <GameIcon name="Map" className="h-3 w-3" />
              {preview.clearsPerHour}/h
            </span>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-primary/15 bg-primary/[0.035] p-3">
          <p className="text-[10px] tracking-wider text-primary">{t('idle.passiveTitle')}</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
            <div><p className="text-[8px] text-muted-foreground">{t('idle.bonus.gold')}</p><p className="text-[12px] tabular-nums text-primary">+{Math.round(preview.bonus.gold * 100)}%</p></div>
            <div><p className="text-[8px] text-muted-foreground">{t('idle.bonus.exp')}</p><p className="text-[12px] tabular-nums text-accent">+{Math.round(preview.bonus.exp * 100)}%</p></div>
            <div><p className="text-[8px] text-muted-foreground">{t('idle.bonus.progress')}</p><p className="text-[12px] tabular-nums text-foreground/80">+{Math.round(preview.bonus.progress * 100)}%</p></div>
          </div>
          <div className="mt-2 space-y-1">
            {partyPassives.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-x-2 text-[9px] text-muted-foreground">
                <span>{item.name} · {t('idle.passive.' + item.classId)}</span>
                <span className="tabular-nums">{item.effects.map((effect) => '+' + effect.percent + '% ' + t('idle.bonus.' + effect.type)).join(' / ')}</span>
              </div>
            ))}
            {!partyPassives.length ? <p className="text-[9px] text-muted-foreground">{t('idle.passiveEmpty')}</p> : null}
          </div>
        </div>
        <p className="mt-2.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <GameIcon name="Map" className="h-3 w-3 text-primary/70" />
          {t('idle.clears', { n: preview.clears })}
          <span className="ml-auto tabular-nums">
            {cleared}/300
          </span>
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
        <p className="mb-2 text-[10px] text-muted-foreground">{t('idle.settlementCount')}</p>
        <div className="grid grid-cols-2 gap-2">
          <GhostButton onClick={() => setBatch(10)} active={batch === 10} className="py-2">{t('idle.batch10')}</GhostButton>
          <GhostButton onClick={() => setBatch(20)} active={batch === 20} className="py-2">{t('idle.batch20')}</GhostButton>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">{t('idle.batchActual', { n: actualBatch })}</p>
      </div>
      <GoldButton onClick={() => { const result = actions.claimIdle(batch); if (result) setSettlement(result); }}
        disabled={preview.seconds < 1 || actualBatch < 1} className="mt-3 w-full py-2.5">
        {preview.seconds < 1 ? t('idle.none') : actualBatch < 1 ? t('idle.noGems') : t('idle.claim')}
      </GoldButton>
      <GameModal open={Boolean(settlement)} onClose={() => setSettlement(null)} title={t('idle.settlementTitle')} subtitle={t('idle.stage') + ' · ' + t('stages.' + (settlement?.mode || 'normal')) + ' ' + (settlement?.stage || '')} width="max-w-sm">
        {settlement ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('idle.settlementCount')}</p><p className="text-lg font-semibold">{fmt(settlement.settlements)}</p></div>
              <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('idle.settlementGems')}</p><p className="text-lg font-semibold text-primary">-{fmt(settlement.idleGemsSpent)}</p></div>
              <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('res.gold')}</p><p className="text-lg font-semibold text-primary">+{fmt(settlement.gold)}</p></div>
              <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('player.exp')}</p><p className="text-lg font-semibold text-accent">+{fmt(settlement.exp)}</p></div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
              <p className="mb-2 text-[10px] text-muted-foreground">{t('idle.materials')}</p>
              {settlement.materials?.length ? settlement.materials.map((item) => <div key={item.id} className="flex justify-between text-xs"><span>{item.name}</span><span className="tabular-nums">+{fmt(item.amount)}</span></div>) : <p className="text-[10px] text-muted-foreground">{t('idle.noMaterials')}</p>}
            </div>
            <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{t('idle.clears', { n: settlement.clears })}</span><span className="text-emerald-300">+{fmt(settlement.levels || 0)} Lv</span></div>
            <GoldButton onClick={() => setSettlement(null)} className="w-full py-2">{t('common.confirm')}</GoldButton>
          </div>
        ) : null}
      </GameModal>
    </GameModal>
  );
}