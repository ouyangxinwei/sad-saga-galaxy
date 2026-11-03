import { useEffect, useState } from 'react';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, GhostButton, Bar } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { fmt } from '@/lib/format';

export default function IdleDialog({ open, onClose }) {
  const { t, idle, actions, cleared } = useGame();
  const preview = actions.idlePreview();
  const cap = 720;
  const [, setTick] = useState(0);

  // –Ê”Â??Šú??•büVC?—Ý?—^?o‘¬—¦??“¯?
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

      <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{t('idle.accrued')}</span>
          <span className="tabular-nums">
            {Math.floor(preview.minutes / 60)}h {preview.minutes % 60}m {preview.seconds % 60}s / 12h
          </span>
        </div>
        <Bar value={preview.minutes} max={cap} color="#6FA8FF" className="mt-1.5" height="h-1" />

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
        <p className="mt-2.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <GameIcon name="Map" className="h-3 w-3 text-primary/70" />
          {t('idle.clears', { n: preview.clears })}
          <span className="ml-auto tabular-nums">
            {cleared}/300
          </span>
        </p>
      </div>

      <GoldButton onClick={actions.claimIdle} disabled={preview.minutes < 5} className="mt-4 w-full py-2.5">
        {preview.minutes < 5 ? t('idle.none') : t('idle.claim')}
      </GoldButton>
    </GameModal>
  );
}