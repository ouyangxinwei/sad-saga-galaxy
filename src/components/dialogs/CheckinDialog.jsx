import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { CHECKIN } from '@/lib/gameData';
import { todayKey } from '@/lib/save';

export default function CheckinDialog({ open, onClose }) {
  const { t, checkin, actions } = useGame();
  const claimedToday = checkin.last === todayKey();
  const nextIndex = checkin.streak % 7;
  const doneIndex = claimedToday ? (checkin.streak - 1) % 7 : -1;

  return (
    <GameModal open={open} onClose={onClose} title={t('checkin.title')} subtitle={t('checkin.streak', { n: checkin.streak })} width="max-w-xl">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {CHECKIN.map((reward, i) => {
          const done = doneIndex >= 0 && i <= doneIndex;
          const isNext = claimedToday ? false : i === nextIndex;
          return (
            <div
              key={i}
              className={`relative flex flex-col items-center gap-1 rounded-xl border px-1 py-2 ${
                isNext
                  ? 'border-primary/60 bg-primary/10 glow-gold'
                  : done
                    ? 'border-white/[0.06] bg-white/[0.02] opacity-55'
                    : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <span className="text-[8px] tracking-wider text-muted-foreground">{t('common.day', { n: i + 1 })}</span>
              <div className="flex flex-col items-center gap-0.5">
                {reward.gold ? (
                  <span className="flex items-center gap-0.5 text-[9px] text-primary">
                    <GameIcon name="Coins" className="h-2.5 w-2.5" />
                    {reward.gold}
                  </span>
                ) : null}
                {reward.gems ? (
                  <span className="flex items-center gap-0.5 text-[9px] text-accent">
                    <GameIcon name="Gem" className="h-2.5 w-2.5" />
                    {reward.gems}
                  </span>
                ) : null}
                {reward.tickets ? (
                  <span className="flex items-center gap-0.5 text-[9px] text-[#6FE3C0]">
                    <GameIcon name="Ticket" className="h-2.5 w-2.5" />
                    {reward.tickets}
                  </span>
                ) : null}
              </div>
              {done ? (
                <GameIcon name="Check" className="absolute right-1 top-1 h-2.5 w-2.5 text-primary/70" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <GoldButton onClick={() => actions.claimCheckin()} disabled={claimedToday} className="w-full py-2.5">
          {claimedToday ? t('common.claimed') : t('common.claim')}
        </GoldButton>
        <p className="text-[10px] text-muted-foreground">{claimedToday ? t('checkin.done') : t('checkin.streak', { n: checkin.streak + 1 })}</p>
      </div>
    </GameModal>
  );
}