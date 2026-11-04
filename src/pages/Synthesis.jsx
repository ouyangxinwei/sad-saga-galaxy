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
import { getCharacterBreakthroughBonuses, previewFusionCharacterProgression } from '@/lib/characterProgression';
import { fmt } from '@/lib/format';

const FUSION_PREVIEW = {
  zh: { title: '融合成长继承预览', source: '本次融合将继承消耗卡中最强的成长记录', existing: '已有结果卡的成长记录更强：原有结果卡保留，新融合卡将从 Lv1 开始', level: '等级', cap: '等级上限', exp: '储存经验', breakthroughs: '突破次数', rewards: '累计突破奖励', need: '需要 3 张同类型卡', none: '暂无可继承的成长记录' },
  ja: { title: '融合成長引き継ぎプレビュー', source: '消費カードの中で最も強い成長記録を新しいカードへ引き継ぎます', existing: '既存の結果カードの成長記録が最も強いため、そのカードを保持し、新しい融合カードは Lv1 から開始します', level: 'レベル', cap: '上限', exp: '保存経験値', breakthroughs: '突破回数', rewards: '累計突破報酬', need: '同じ種類のカードが 3 枚必要です', none: '引き継げる成長記録がありません' },
  en: { title: 'Fusion Growth Preview', source: 'The strongest progression among the consumed source copies will transfer to the new card', existing: 'An existing result card has the strongest record and will be kept; the newly fused copy starts at Lv 1', level: 'Level', cap: 'Level cap', exp: 'Stored EXP', breakthroughs: 'Breakthroughs', rewards: 'Total breakthrough rewards', need: 'Requires 3 cards of the same type', none: 'No progression record is available to inherit' },
};

const TABS = ['cards', 'fuse', 'convert', 'rebirth'];
const TAB_LABEL = { cards: 'synth.cards', fuse: 'synth.fuseCards', convert: 'synth.convert', rebirth: 'synth.rebirth' };

export default function Synthesis() {
  const game = useGame();
  const { t, lang, cardShards, enemyShards, cards, cardCounts, level, rebirth, actions, defOf, customDefs } = game;
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
                  {(() => {
                    const preview = previewFusionCharacterProgression(game, id, result.id, 3);
                    const winner = preview.winner;
                    const record = winner?.record;
                    const reward = getCharacterBreakthroughBonuses(record, def.classId);
                    const copyLabels = FUSION_PREVIEW[lang] || FUSION_PREVIEW.zh;
                    return (
                      <div className="basis-full rounded-lg border border-primary/15 bg-primary/[0.035] p-2.5">
                        <p className="text-[9px] font-semibold tracking-wide text-primary">{copyLabels.title}</p>
                        {copies < 3 ? (
                          <p className="mt-1 text-[9px] text-muted-foreground">{copyLabels.need}</p>
                        ) : record ? (
                          <>
                            <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{winner.origin === 'result' ? copyLabels.existing : copyLabels.source}</p>
                            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] sm:grid-cols-4">
                              <div className="rounded bg-black/20 p-1.5"><span className="text-muted-foreground">{copyLabels.level}</span><p className="text-foreground">Lv {record.level}</p></div>
                              <div className="rounded bg-black/20 p-1.5"><span className="text-muted-foreground">{copyLabels.cap}</span><p className="text-foreground">Lv {record.levelCap}</p></div>
                              <div className="rounded bg-black/20 p-1.5"><span className="text-muted-foreground">{copyLabels.exp}</span><p className="text-foreground">{fmt(record.exp || 0)}</p></div>
                              <div className="rounded bg-black/20 p-1.5"><span className="text-muted-foreground">{copyLabels.breakthroughs}</span><p className="text-foreground">{record.breakthroughCount || 0}</p></div>
                            </div>
                            <p className="mt-1.5 text-[8.5px] text-muted-foreground">{copyLabels.rewards}: HP +{reward.hp} · ATK +{reward.atk} · DEF +{reward.def} · MP +{reward.mp}</p>
                          </>
                        ) : <p className="mt-1 text-[9px] text-muted-foreground">{copyLabels.none}</p>}
                      </div>
                    );
                  })()}
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