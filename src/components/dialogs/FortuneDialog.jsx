import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { FORTUNES } from '@/lib/gameData';

export default function FortuneDialog({ open, onClose }) {
  const { t, lang, fortuneDef, actions } = useGame();
  const card = fortuneDef;

  return (
    <GameModal open={open} onClose={onClose} title={t('fortune.title')} subtitle={t('fortune.hint')} width="max-w-sm">
      <div className="flex flex-col items-center gap-4 py-2">
        <div
          className={`relative flex h-[230px] w-[160px] flex-col items-center justify-center overflow-hidden rounded-2xl border ${
            card ? 'border-primary/40' : 'border-white/15'
          }`}
          style={{
            background: card
              ? 'radial-gradient(120% 90% at 50% 8%, rgba(232,200,122,0.22), transparent 62%), linear-gradient(165deg,#151a30,#080b14)'
              : 'linear-gradient(165deg,#12162a,#080b14)',
          }}
        >
          <span className="absolute inset-2 rounded-xl border border-dashed border-white/10" />
          {card ? (
            <>
              <span className="absolute inset-0 rounded-2xl opacity-30 shimmer" />
              <GameIcon name="Moon" className="h-9 w-9 text-primary/90" style={{ filter: 'drop-shadow(0 0 16px rgba(232,200,122,0.6))' }} />
              <p className="saga-display mt-3 text-lg gold-text">{card.name[lang] || card.name.zh}</p>
              <p className="mt-1 px-4 text-center text-[10px] leading-relaxed text-muted-foreground">{card.text[lang] || card.text.zh}</p>
            </>
          ) : (
            <>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/25 pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">{t('fortune.hint')}</p>
            </>
          )}
        </div>

        {card ? (
          <p className="text-center text-[10px] text-muted-foreground">
            {t('fortune.hint')} ? {FORTUNES.length}
          </p>
        ) : (
          <GoldButton onClick={actions.rollFortune} className="w-full py-2.5">
            {t('fortune.draw')}
          </GoldButton>
        )}
      </div>
    </GameModal>
  );
}