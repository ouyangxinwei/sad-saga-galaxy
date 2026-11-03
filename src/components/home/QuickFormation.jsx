import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/lib/GameContext';
import CardTile from '@/components/common/CardTile';
import GameIcon from '@/components/common/GameIcon';
import CharacterDetailDialog from '@/components/dialogs/CharacterDetailDialog';
import { fmt } from '@/lib/format';

export default function QuickFormation() {
  const { t, lang, party, powerOf, defOf, actions, presets, presetIndex } = useGame();
  const [detailId, setDetailId] = useState(null);
  const slots = Array.from({ length: 5 }, (_, i) => party[i] || null);

  return (
    <section className="saga-panel p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GameIcon name="Users" className="h-3.5 w-3.5 text-primary/80" />
          <h3 className="text-[11px] tracking-[0.18em] text-foreground/85">{t('quick.title').toUpperCase()}</h3>
        </div>
        <button type="button" onClick={actions.autoBest} className="tap flex items-center gap-1 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[10px] text-primary hover:bg-primary/15">
          <GameIcon name="Zap" className="h-3 w-3" />{t('quick.auto')}
        </button>
      </div>
      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
        {slots.map((id, i) => {
          const def = id ? defOf(id) : null;
          return def ? (
            <CardTile key={id} def={def} lang={lang} size="xs" power={powerOf(id)} onClick={() => setDetailId(id)} />
          ) : (
            <div key={`empty-${i}`} className="flex h-[76px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/12 bg-white/[0.02] text-[9px] text-muted-foreground/60">
              <GameIcon name="CircleDot" className="h-3 w-3" />{t('quick.empty')}
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => {
            const filled = (presets?.[i] || []).length > 0;
            const active = Number(presetIndex) === i;
            return <button key={i} type="button" onClick={() => (filled ? actions.loadPreset(i) : actions.savePreset(i))} className={`tap rounded-md border px-2 py-1 text-[9px] tracking-wider ${active ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'}`}>{t('quick.preset')} {i + 1}</button>;
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] tabular-nums text-muted-foreground">{fmt(party.reduce((sum, id) => sum + powerOf(id), 0))}</span>
          <Link to="/formation" className="tap flex items-center gap-0.5 text-[10px] text-primary/80 hover:text-primary">{t('quick.edit')}<GameIcon name="ChevronRight" className="h-3 w-3" /></Link>
        </div>
      </div>
      <CharacterDetailDialog cardId={detailId} open={!!detailId} onClose={() => setDetailId(null)} />
    </section>
  );
}
