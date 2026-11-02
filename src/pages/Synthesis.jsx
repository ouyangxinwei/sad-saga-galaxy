import { useState } from 'react';
import AppShell from '@/components/common/AppShell';
import PageHeader from '@/components/common/PageHeader';
import CardTile from '@/components/common/CardTile';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, Bar } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import {
  ASCEND_CLASSES,
  ENEMIES,
  HEROES,
  RARITY_COLOR,
  RARITY_NEXT,
  classStats,
  levelCap,
  upgradedId,
  upgradedName,
} from '@/lib/gameData';
import { copiesOf } from '@/lib/cards';
import { fmt } from '@/lib/format';

const TABS = ['cards', 'fuse', 'convert', 'rebirth'];
const TAB_LABEL = { cards: 'synth.cards', fuse: 'synth.fuseCards', convert: 'synth.convert', rebirth: 'synth.rebirth' };

export default function Synthesis() {
  const { t, lang, cardShards, enemyShards, cards, cardCounts, level, rebirth, actions, defOf, customDefs } = useGame();
  const [tab, setTab] = useState(() => {
    const wanted = new URLSearchParams(window.location.search).get('tab');
    return TABS.includes(wanted) ? wanted : 'cards';
  });
  const [ascend, setAscend] = useState('sword_asc');
  const cap = levelCap(rebirth);

  const fusable = HEROES.filter((h) => !cards[h.id] && (cardShards[h.id] || 0) > 0);
  const convertible = ENEMIES.filter((e) => (enemyShards[e.id] || 0) > 0);
  const converted = Object.keys(customDefs || {});

  const inventory = { cards, cardCounts };
  const fuseList = Object.keys(cards)
    .map((id) => ({ id, def: defOf(id), copies: copiesOf(inventory, id) }))
    .filter((x) => x.def && RARITY_NEXT[x.def.rarity])
    .map((x) => ({ ...x, next: RARITY_NEXT[x.def.rarity] }))
    .sort((a, b) => b.copies - a.copies || a.id.localeCompare(b.id));

  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <PageHeader title={t('synth.title')} subtitle={t('synth.desc')} />

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`tap rounded-xl border px-2 py-2 text-[10.5px] tracking-wide ${
                tab === id ? 'border-primary/45 bg-primary/[0.08] text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground'
              }`}
            >
              {t(TAB_LABEL[id])}
            </button>
          ))}
        </div>

        {tab === 'cards' ? (
          <div className="mt-3 space-y-2">
            {fusable.map((h) => {
              const have = cardShards[h.id] || 0;
              return (
                <div key={h.id} className="saga-panel flex items-center gap-3 p-2.5">
                  <CardTile def={defOf(h.id)} lang={lang} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] text-foreground/90">{h.name[lang] || h.name.zh}</p>
                    <p className="text-[9px] text-muted-foreground">{t('synth.have', { n: have })}</p>
                    <Bar value={have} max={5} color={RARITY_COLOR[h.rarity]} className="mt-1" height="h-1" />
                  </div>
                  <GoldButton
                    onClick={() => actions.synthesize(h.id)}
                    disabled={have < 5}
                    className="shrink-0 px-3 py-1.5 text-[10px]"
                  >
                    {t('synth.fuse')}
                  </GoldButton>
                </div>
              );
            })}
            {!fusable.length ? (
              <p className="saga-panel p-6 text-center text-[11px] text-muted-foreground">{t('synth.empty')}</p>
            ) : null}
          </div>
        ) : null}

        {tab === 'fuse' ? (
          <div className="mt-3 space-y-2">
            <p className="saga-panel-soft px-3 py-2 text-[9.5px] leading-relaxed text-muted-foreground">
              {t('synth.fuseDesc')}
            </p>
            {fuseList.map(({ id, def, copies, next }) => {
              const result = {
                ...def,
                id: upgradedId(id, next),
                name: upgradedName(def.name),
                rarity: next,
                stats: classStats(def.classId, next),
              };
              return (
                <div key={id} className="saga-panel flex flex-wrap items-center gap-2.5 p-2.5">
                  <CardTile def={def} lang={lang} size="xs" badge={`×${copies}`} />
                  <GameIcon name="ArrowRight" className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <CardTile def={result} lang={lang} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] text-foreground/90">{def.name[lang] || def.name.zh}</p>
                    <p className="truncate text-[9px] text-muted-foreground">
                      {t('synth.result')}: {result.name[lang] || result.name.zh}
                    </p>
                    <Bar value={copies} max={3} color={RARITY_COLOR[def.rarity]} className="mt-1" height="h-1" />
                  </div>
                  <GoldButton
                    onClick={() => actions.fuseCards(id)}
                    disabled={copies < 3}
                    className="shrink-0 px-3 py-1.5 text-[10px]"
                  >
                    {copies < 3 ? t('synth.copies', { n: copies }) : t('synth.fuseGo')}
                  </GoldButton>
                </div>
              );
            })}
            {!fuseList.length ? (
              <p className="saga-panel p-6 text-center text-[11px] text-muted-foreground">{t('synth.fuseNone')}</p>
            ) : null}
          </div>
        ) : null}

        {tab === 'convert' ? (
          <div className="mt-3 space-y-2">
            {convertible.map((e) => {
              const have = enemyShards[e.id] || 0;
              return (
                <div key={e.id} className="saga-panel flex items-center gap-3 p-2.5">
                  <CardTile def={{ ...e, classId: 'stargazer', converted: true }} lang={lang} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] text-foreground/90">{e.name[lang] || e.name.zh}</p>
                    <p className="text-[9px] text-muted-foreground">{t('synth.have', { n: have })}</p>
                    <Bar value={have} max={5} color="#F0748F" className="mt-1" height="h-1" />
                  </div>
                  <GoldButton
                    onClick={() => actions.convertEnemy(e.id)}
                    disabled={have < 5}
                    className="shrink-0 px-2.5 py-1.5 text-[9.5px]"
                  >
                    {t('synth.convertBtn')}
                  </GoldButton>
                </div>
              );
            })}
            {!convertible.length ? (
              <p className="saga-panel p-6 text-center text-[11px] text-muted-foreground">{t('synth.empty')}</p>
            ) : null}
            {converted.length ? (
              <div className="saga-panel p-3">
                <p className="text-[10px] tracking-wider text-muted-foreground">{t('synth.converted')}</p>
                <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-7">
                  {converted.map((id) => (
                    <CardTile key={id} def={defOf(id)} lang={lang} size="xs" />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'rebirth' ? (
          <div className="mt-3 space-y-2">
            <div className="saga-panel p-3.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GameIcon name="Repeat" className="h-3 w-3 text-primary/80" />
                  {t('player.level')} {level} / {cap}
                </span>
                <span>{t('player.rebirth')} {rebirth}</span>
              </div>
              <Bar value={level} max={cap} color="#E8C87A" className="mt-1.5" />
              <p className="mt-2 text-[9.5px] leading-relaxed text-muted-foreground">{t('synth.desc')}</p>
            </div>

            <p className="px-1 text-[10px] tracking-wider text-muted-foreground">{t('synth.pickClass')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ASCEND_CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAscend(c.id)}
                  className={`tap rounded-xl border px-2 py-2 text-left ${
                    ascend === c.id ? 'border-primary/45 bg-primary/[0.08]' : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <GameIcon name={c.icon} className="h-4 w-4 text-primary/80" />
                  <p className="mt-1 truncate text-[10.5px] text-foreground/90">{c.name[lang] || c.name.zh}</p>
                  <p className="mt-0.5 line-clamp-2 text-[8px] leading-snug text-muted-foreground">{c.passive[lang] || c.passive.zh}</p>
                </button>
              ))}
            </div>

            <GoldButton
              onClick={() => actions.rebirth(ascend)}
              disabled={level < cap}
              className="mt-1 w-full py-2.5"
            >
              {level < cap ? t('synth.req', { n: cap }) : t('synth.doRebirth')}
            </GoldButton>
            <p className="text-center text-[9px] text-muted-foreground">
              {fmt(level)} / {fmt(cap)}
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}