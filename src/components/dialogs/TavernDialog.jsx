import { useEffect, useState } from 'react';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, GhostButton, RewardLine } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { BOUNTY_MAP, classOf } from '@/lib/gameData';
import { countdown } from '@/lib/format';
import { bountySlot } from '@/lib/save';

export default function TavernDialog({ open, onClose }) {
  const { t, lang, bounties, cards, actions, defOf } = useGame();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(timer);
  }, [open]);

  const list = bounties?.list || [];
  const nextRefresh = (bountySlot() + 1) * 4 * 3600 * 1000 - Date.now();

  return (
    <GameModal
      open={open}
      onClose={onClose}
      title={t('tavern.title')}
      subtitle={t('tavern.desc')}
      width="max-w-lg"
      headerRight={
        <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] text-muted-foreground sm:inline">
          {t('tavern.refresh')} {countdown(nextRefresh)}
        </span>
      }
    >
      <div className="space-y-2">
        {list.map((b) => {
          const tpl = BOUNTY_MAP[b.tplId];
          if (!tpl) return null;
          const cls = classOf(tpl.classId);
          const matching = Object.keys(cards).filter((id) => defOf(id)?.classId === tpl.classId);
          const inProgress = b.cardId && b.endsAt && Date.now() < b.endsAt;
          const ready = b.cardId && b.endsAt && Date.now() >= b.endsAt;
          return (
            <div key={b.id} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-[12px] text-foreground/90">
                    <GameIcon name={cls.icon} className="h-3.5 w-3.5 text-primary/75" />
                    {tpl.name[lang] || tpl.name.zh}
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-muted-foreground">
                    {t('tavern.requires', { c: cls.name[lang] || cls.name.zh })} ? {tpl.minutes} min
                  </p>
                </div>
                {inProgress ? (
                  <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[9px] tabular-nums text-accent">
                    {countdown(b.endsAt - Date.now())}
                  </span>
                ) : ready ? (
                  <GoldButton onClick={() => actions.claimBounty(b.id)} className="shrink-0 px-3 py-1 text-[10px]">
                    {t('tavern.claim')}
                  </GoldButton>
                ) : (
                  <GhostButton
                    onClick={() => actions.dispatchBounty(b.id)}
                    disabled={!matching.length}
                    className="shrink-0 px-3 py-1 text-[10px]"
                  >
                    {t('tavern.dispatch')}
                  </GhostButton>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <RewardLine reward={tpl.rewards} t={t} lang={lang} />
                {b.cardId ? (
                  <span className="text-[9px] text-muted-foreground">
                    {defOf(b.cardId)?.name?.[lang] || ''}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
        {!list.length ? <p className="py-8 text-center text-[11px] text-muted-foreground">{t('tavern.empty')}</p> : null}
      </div>
    </GameModal>
  );
}