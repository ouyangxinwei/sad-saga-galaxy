import GameIcon from '@/components/common/GameIcon';
import { useGame } from '@/lib/GameContext';
import { FORTUNES } from '@/lib/gameData';

export default function FortuneCard({ onClick }) {
  const { t, lang, fortuneDef, actions } = useGame();
  const preview = fortuneDef || FORTUNES[0];

  return (
    <section className="saga-panel flex items-center gap-3 p-3 sm:p-3.5">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.06] floaty">
        <span className="absolute inset-0 rounded-full border border-dashed border-primary/20 spin-slow" />
        <GameIcon name="Moon" className="h-4 w-4 text-primary/90" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] uppercase tracking-[0.2em] text-primary/70">{t('fortune.title')}</p>
        <p className="truncate text-[12px] text-foreground/90">
          {fortuneDef ? fortuneDef.name[lang] || fortuneDef.name.zh : t('fortune.hint')}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">
          {fortuneDef ? fortuneDef.text[lang] || fortuneDef.text.zh : '?'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => (fortuneDef ? onClick?.('fortune') : actions.rollFortune())}
        className="tap shrink-0 rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1.5 text-[10px] text-foreground/80 hover:border-primary/40 hover:text-primary"
      >
        {fortuneDef ? t('fortune.read') : t('fortune.draw')}
      </button>
    </section>
  );
}