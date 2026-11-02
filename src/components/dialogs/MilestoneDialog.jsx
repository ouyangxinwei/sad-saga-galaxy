import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, Bar } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { HEROES, MILESTONES, MONSTER_TYPES } from '@/lib/gameData';

function MilestoneRow({ kind, count, max, label, color }) {
  const { t, msClaimed, actions } = useGame();
  const claimed = msClaimed[kind] || [];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {count} / {max}
        </span>
      </div>
      <Bar value={count} max={max} color={color} />
      {MILESTONES.map((m) => {
        const done = claimed.includes(m.at);
        const ready = count >= m.at && !done;
        return (
          <div
            key={m.at}
            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
              done ? 'border-white/[0.06] bg-white/[0.02]' : ready ? 'border-primary/35 bg-primary/[0.06]' : 'border-white/10 bg-white/[0.025]'
            }`}
          >
            <div className="flex items-center gap-2">
              <GameIcon
                name={done ? 'Check' : ready ? 'Gift' : 'Lock'}
                className="h-3.5 w-3.5"
                style={{ color: done ? '#6FE3C0' : ready ? '#E8C87A' : '#8b93a8' }}
              />
              <span className="text-[11px] text-foreground/85">
                {m.at} / {max}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-accent">
                <GameIcon name="Gem" className="h-2.5 w-2.5" />
                {m.gems}
              </span>
            </div>
            {done ? (
              <span className="text-[9px] text-muted-foreground">{t('common.claimed')}</span>
            ) : (
              <GoldButton
                onClick={() => actions.claimMilestone(kind, m.at)}
                disabled={!ready}
                className="px-3 py-1 text-[10px]"
              >
                {t('common.claim')}
              </GoldButton>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MilestoneDialog({ open, onClose }) {
  const { t, ownedHeroCount, enemyUnlocked } = useGame();

  return (
    <GameModal open={open} onClose={onClose} title={t('ms.title')} subtitle={t('gallery.progress')} width="max-w-lg">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
        <p className="flex items-center gap-1.5 text-[11px] tracking-wide text-foreground/85">
          <GameIcon name="Users" className="h-3.5 w-3.5 text-primary/80" />
          {t('ms.heroes')}
        </p>
        <MilestoneRow kind="heroes" count={ownedHeroCount} max={HEROES.length} label={t('ms.heroes')} color="#E8C87A" />
      </div>
      <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
        <p className="flex items-center gap-1.5 text-[11px] tracking-wide text-foreground/85">
          <GameIcon name="Skull" className="h-3.5 w-3.5 text-[#F0748F]" />
          {t('ms.enemies')}
        </p>
        <MilestoneRow kind="enemies" count={enemyUnlocked} max={20} label={`${t('ms.enemies')} ? ${MONSTER_TYPES.length}${t('gallery.type')}`} color="#F0748F" />
      </div>
    </GameModal>
  );
}