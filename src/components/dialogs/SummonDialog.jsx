import { useState } from 'react';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, GhostButton, Bar } from '@/components/common/Bits';
import CardTile from '@/components/common/CardTile';
import { useGame } from '@/lib/GameContext';
import { HEROES, RARITY_COLOR } from '@/lib/gameData';

export default function SummonDialog({ open, onClose }) {
  const { t, lang, tickets, pity, ssTokens, actions, defOf } = useGame();
  const [results, setResults] = useState(null);
  const [picking, setPicking] = useState(false);

  const pull = (n) => {
    const res = actions.summon(n);
    if (res) setResults(res);
  };

  const close = () => {
    setResults(null);
    setPicking(false);
    onClose();
  };

  const ssHeroes = HEROES.filter((h) => h.rarity === 'SS');

  return (
    <GameModal
      open={open}
      onClose={close}
      title={t('summon.title')}
      subtitle={t('summon.rates')}
      width="max-w-2xl"
      headerRight={
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-[#6FE3C0]">
          <GameIcon name="Ticket" className="h-3 w-3" />
          {tickets}
        </span>
      }
    >
      {!results && !picking && (
        <>
          <div className="relative flex h-[146px] items-center justify-center overflow-hidden rounded-2xl border border-white/10">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(80% 120% at 50% 20%, rgba(155,140,255,0.28), transparent 65%), radial-gradient(60% 90% at 82% 90%, rgba(232,200,122,0.22), transparent 70%), linear-gradient(160deg,#141933,#080b16)',
              }}
            />
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(112deg, rgba(255,255,255,.25) 0 1px, transparent 1px 14px)' }} />
            <span className="absolute h-40 w-40 rounded-full border border-primary/25 spin-slow" />
            <span className="absolute h-28 w-28 rounded-full border border-dashed border-accent/35 spin-slower" />
            <div className="relative text-center">
              <p className="saga-display gold-text text-xl">? êØäCè¢? ?</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{t('summon.rates')}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{t('summon.pity')}</span>
              <span className="tabular-nums">{pity}/10</span>
            </div>
            <Bar value={pity} max={10} color="#E8C87A" className="mt-1.5" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[9.5px] leading-relaxed text-muted-foreground">{t('summon.pityDesc')}</p>
              {ssTokens > 0 ? (
                <GhostButton onClick={() => setPicking(true)} active className="shrink-0 px-2.5 py-1 text-[10px]">
                  {t('summon.exchange')} Å~{ssTokens}
                </GhostButton>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <GhostButton onClick={() => pull(1)} disabled={tickets < 1} className="py-3">
              {t('summon.one')}
              <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] text-[#6FE3C0]">
                <GameIcon name="Ticket" className="h-2.5 w-2.5" />1
              </span>
            </GhostButton>
            <GoldButton onClick={() => pull(10)} disabled={tickets < 10} className="py-3">
              {t('summon.ten')}
              <span className="ml-1 inline-flex items-center gap-0.5 text-[9px]">
                <GameIcon name="Ticket" className="h-2.5 w-2.5" />10
              </span>
            </GoldButton>
          </div>
        </>
      )}

      {picking && (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] tracking-wide text-foreground/85">{t('summon.exchange')}</p>
            <GhostButton onClick={() => setPicking(false)} className="px-2.5 py-1 text-[10px]">
              {t('common.cancel')}
            </GhostButton>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {ssHeroes.map((h) => (
              <CardTile
                key={h.id}
                def={defOf(h.id)}
                lang={lang}
                size="sm"
                onClick={() => {
                  if (actions.exchangeSS(h.id)) {
                    setPicking(false);
                    close();
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {results && (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] tracking-wide text-foreground/85">{t('summon.result')}</p>
            <GhostButton onClick={close} className="px-2.5 py-1 text-[10px]">
              {t('common.close')}
            </GhostButton>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
            {results.map((r, i) => {
              const isSS = r.rarity === 'SS';
              return (
                <div
                  key={`${r.id}-${i}`}
                  className="rise-in relative"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {isSS ? <span className="absolute -inset-1 rounded-2xl bg-primary/20 blur-md pulse-soft" /> : null}
                  <div className={isSS ? 'relative glow-gold shake' : 'relative'}>
                    <CardTile def={defOf(r.id)} lang={lang} size="sm" />
                  </div>
                  <p
                    className="mt-1 truncate text-center text-[8px] tracking-wider"
                    style={{ color: r.isNew ? RARITY_COLOR[r.rarity] : '#8b93a8' }}
                  >
                    {r.isNew ? t('summon.new') : '+2'}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <GhostButton onClick={() => setResults(null)} className="py-2.5">
              {t('common.close')}
            </GhostButton>
            <GoldButton
              onClick={() => {
                setResults(null);
                pull(10);
              }}
              disabled={tickets < 10}
              className="py-2.5"
            >
              {t('summon.again')} Å~10
            </GoldButton>
          </div>
        </div>
      )}
    </GameModal>
  );
}