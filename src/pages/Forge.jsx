import { useState } from 'react';
import AppShell from '@/components/common/AppShell';
import PageHeader from '@/components/common/PageHeader';
import GameIcon from '@/components/common/GameIcon';
import CardTile from '@/components/common/CardTile';
import { GoldButton, GhostButton, Bar } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { HEROES, RELICS } from '@/lib/gameData';

const TABS = ['relics', 'furnace'];

export default function Forge() {
  const { t, lang, relics, equipped, gems, party, defOf, actions, cardShards, gold } = useGame();
  const [tab, setTab] = useState('relics');
  const [cardId, setCardId] = useState(() => new URLSearchParams(window.location.search).get('cardId') || (party || []).filter(Boolean)[0] || null);

  const ownedRelics = RELICS.filter((r) => (relics[r.id] || 0) > 0);
  const meltable = HEROES.filter((h) => (cardShards[h.id] || 0) >= 5);

  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <PageHeader
          title={t('forge.title')}
          subtitle={t('forge.meltDesc')}
          right={
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-accent">
              <GameIcon name="Gem" className="h-3 w-3" />
              {gems.toLocaleString('en-US')}
            </span>
          }
        />

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`tap rounded-xl border px-2 py-2 text-[10.5px] tracking-wide ${
                tab === id ? 'border-primary/45 bg-primary/[0.08] text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground'
              }`}
            >
              {t(`forge.${id}`)}
            </button>
          ))}
        </div>

        {tab === 'relics' ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {RELICS.map((r) => {
                const owned = relics[r.id] || 0;
                return (
                  <div key={r.id} className="saga-panel p-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg border border-white/10 bg-black/25 p-1.5">
                        <GameIcon name={r.icon} className="h-3.5 w-3.5 text-primary/85" />
                      </span>
                      <span className="text-[9px] text-muted-foreground">×{owned}</span>
                    </div>
                    <p className="mt-1.5 truncate text-[11px] text-foreground/90">{r.name[lang] || r.name.zh}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.atk ? <span className="text-[8px] text-rose-300/80">ATK +{Math.round(r.atk * 100)}%</span> : null}
                      {r.hp ? <span className="text-[8px] text-[#8EF0CF]">HP +{Math.round(r.hp * 100)}%</span> : null}
                      {r.def ? <span className="text-[8px] text-[#9CC4FF]">DEF +{Math.round(r.def * 100)}%</span> : null}
                      {r.spd ? <span className="text-[8px] text-primary/80">SPD +{Math.round(r.spd * 100)}%</span> : null}
                    </div>
                    <GhostButton
                      onClick={() => actions.craftRelic(r.id)}
                      disabled={gems < r.cost}
                      className="mt-2 w-full px-2 py-1 text-[9.5px]"
                    >
                      {t('forge.buy')} · {r.cost}
                    </GhostButton>
                  </div>
                );
              })}
            </div>

            <div className="saga-panel mt-3 p-3">
              <p className="text-[10px] tracking-wider text-muted-foreground">{t('forge.pickCard')}</p>
              <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(party || []).filter(Boolean).map((id) => (
                  <CardTile
                    key={id}
                    def={defOf(id)}
                    lang={lang}
                    size="xs"
                    selected={cardId === id}
                    onClick={() => setCardId(id)}
                  />
                ))}
              </div>
              {cardId ? (
                <>
                  <div className="mt-2 flex items-center justify-between text-[9.5px] text-muted-foreground">
                    <span>{defOf(cardId)?.name?.[lang] || ''}</span>
                    <span className="text-primary/80">
                      {RELIC_NAME(equipped[cardId], RELICS, lang) || t('common.none')}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {ownedRelics.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => actions.equipRelic(cardId, r.id)}
                        className={`tap rounded-lg border px-2 py-1 text-[9px] ${
                          equipped[cardId] === r.id
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-white/10 bg-white/[0.03] text-muted-foreground'
                        }`}
                      >
                        {r.name[lang] || r.name.zh}
                      </button>
                    ))}
                    {equipped[cardId] ? (
                      <GhostButton onClick={() => actions.equipRelic(cardId, null)} className="px-2 py-1 text-[9px]">
                        {t('common.cancel')}
                      </GhostButton>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="saga-panel p-3.5">
              <p className="flex items-center gap-1.5 text-[11px] text-foreground/90">
                <GameIcon name="Hammer" className="h-3.5 w-3.5 text-primary/80" />
                {t('forge.furnace')}
              </p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground">{t('forge.meltDesc')}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                <GameIcon name="Coins" className="h-2.5 w-2.5 text-primary/70" />
                {gold.toLocaleString('en-US')}
              </p>
            </div>
            {meltable.map((h) => {
              const have = cardShards[h.id] || 0;
              return (
                <div key={h.id} className="saga-panel flex items-center gap-3 p-2.5">
                  <CardTile def={defOf(h.id)} lang={lang} size="xs" locked />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] text-foreground/90">{h.name[lang] || h.name.zh}</p>
                    <p className="text-[9px] text-muted-foreground">{t('common.shards')} {have}</p>
                    <Bar value={have % 5} max={5} color="#8B7BF7" className="mt-1" height="h-1" />
                  </div>
                  <GoldButton onClick={() => actions.meltShards(h.id)} disabled={have < 5} className="shrink-0 px-2.5 py-1.5 text-[9.5px]">
                    {t('forge.melt')}
                  </GoldButton>
                </div>
              );
            })}
            {!meltable.length ? (
              <p className="saga-panel p-6 text-center text-[11px] text-muted-foreground">{t('synth.empty')}</p>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function RELIC_NAME(id, list, lang) {
  const r = list.find((x) => x.id === id);
  return r ? r.name[lang] || r.name.zh : '';
}