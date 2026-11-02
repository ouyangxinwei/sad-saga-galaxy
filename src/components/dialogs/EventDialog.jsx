import { useNavigate } from 'react-router-dom';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton } from '@/components/common/Bits';
import SigilArt from '@/components/common/SigilArt';
import { useGame } from '@/lib/GameContext';
import { ENEMY_MAP, EVENT_STAGE } from '@/lib/gameData';

export default function EventDialog({ open, onClose }) {
  const { t, lang, eventClears } = useGame();
  const navigate = useNavigate();
  const boss = ENEMY_MAP.sorrowcore;

  return (
    <GameModal open={open} onClose={onClose} title={t('event.title')} subtitle={t('menu.event_desc')} width="max-w-md">
      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <SigilArt def={{ ...boss, classId: 'sword', converted: true }} className="h-[168px] w-full" size="md" />
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <p className="saga-display text-lg gold-text">{boss.name[lang] || boss.name.zh}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{t('event.desc')}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <GameIcon name="Trophy" className="h-3 w-3 text-primary" />
          {t('event.clearedToday', { n: eventClears })}
        </span>
        <span className="text-[10px] tabular-nums text-primary/80">{t('stages.power')} {EVENT_STAGE.power.toLocaleString('en-US')}</span>
      </div>

      <GoldButton
        onClick={() => {
          onClose();
          navigate('/battle?mode=event');
        }}
        className="mt-4 w-full py-2.5"
      >
        {t('event.enter')}
      </GoldButton>
    </GameModal>
  );
}