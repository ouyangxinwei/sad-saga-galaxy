import { useNavigate } from 'react-router-dom';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GhostButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';

export default function TrialsDialog({ open, onClose }) {
  const { t, tower, idle, actions } = useGame();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'expedition',
      icon: 'Compass',
      color: '#6FA8FF',
      title: t('trials.expedition'),
      desc: t('trials.expeditionDesc'),
      action: (
        <GhostButton
          onClick={() => {
            onClose();
            actions.toggleIdle();
          }}
          active={idle.active}
          className="px-3 py-1 text-[10px]"
        >
          {idle.active ? t('idle.on') : t('trials.enter')}
        </GhostButton>
      ),
    },
    {
      key: 'tower',
      icon: 'Castle',
      color: '#F0748F',
      title: t('trials.tower'),
      desc: t('trials.towerDesc', { n: tower + 1 }),
      action: (
        <GhostButton
          onClick={() => {
            onClose();
            navigate(`/battle?mode=tower&stage=${tower + 1}`);
          }}
          className="px-3 py-1 text-[10px]"
        >
          {t('trials.enter')}
        </GhostButton>
      ),
    },
  ];

  return (
    <GameModal open={open} onClose={onClose} title={t('trials.title')} width="max-w-md">
      <div className="space-y-2.5">
        {cards.map((c) => (
          <div key={c.key} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="rounded-xl border border-white/10 bg-black/25 p-2">
                  <GameIcon name={c.icon} className="h-4 w-4" style={{ color: c.color }} />
                </span>
                <div>
                  <p className="text-[12px] text-foreground/90">{c.title}</p>
                  <p className="mt-1 max-w-[220px] text-[9.5px] leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </div>
              {c.action}
            </div>
          </div>
        ))}
      </div>
    </GameModal>
  );
}