import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import PageHeader from '@/components/common/PageHeader';
import CardTile from '@/components/common/CardTile';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, GhostButton, Chip } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { CLASSES } from '@/lib/gameData';
import { fmt } from '@/lib/format';
import { mainCharacterTeamBonusMultiplier } from '@/lib/cards';
import CharacterDetailDialog from '@/components/dialogs/CharacterDetailDialog';
import FormationManager from '@/components/formation/FormationManager';

export default function Formation() {
  const { t, lang, level, party, cards, defOf, powerOf, actions, presets, presetIndex, power, formation } = useGame();
  const [detailId, setDetailId] = useState(null);
  const navigate = useNavigate();
  const [slot, setSlot] = useState(0);
  const [filter, setFilter] = useState('all');

  const owned = Object.keys(cards).filter((id) => defOf(id));
  const list = owned.filter((id) => filter === 'all' || defOf(id)?.classId === filter);
  const slots = Array.from({ length: 5 }, (_, i) => party[i] || null);
  const filled = slots.filter(Boolean).length;
  const teamBonusPercent = Math.round((mainCharacterTeamBonusMultiplier({ level }) - 1) * 10000) / 100;
  const bonusLabels = {
    zh: { level: '主角等级', bonus: '全队战斗加成', hint: '所有上阵角色统一享受；不按角色自身等级重复累计' },
    ja: { level: '主人公レベル', bonus: '全体戦闘ボーナス', hint: '編成中の全員に同じ補正を適用。各キャラのレベルは加算しません' },
    en: { level: 'Main character level', bonus: 'Teamwide battle bonus', hint: 'Applied equally to every deployed character; individual character levels are not added' },
  };
  const bonusLabel = bonusLabels[lang] || bonusLabels.zh;

  const place = (id) => {
    actions.setPartySlot(slot, id);
    const nextEmpty = slots.findIndex((s, i) => i !== slot && !s);
    setSlot(nextEmpty >= 0 ? nextEmpty : Math.min(4, slot + 1));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <PageHeader
          title={t('formation.title')}
          subtitle={t('formation.hint')}
          right={
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t('player.power')}</p>
              <p className="text-[12px] tabular-nums text-primary">{fmt(power)}</p>
            </div>
          }
        />

        <FormationManager party={party} lang={lang} defOf={defOf} powerOf={powerOf} formationState={formation} actions={actions} />

        <div className="mt-5 mb-2 flex items-center gap-2">
          <h3 className="text-[11px] font-semibold tracking-wide text-foreground/90">{lang === 'ja' ? '現在の編成メンバー' : lang === 'en' ? 'Current party roster' : '当前队伍名单'}</h3>
          <span className="text-[8px] text-muted-foreground">{lang === 'ja' ? '陣形の配置設定とは独立しています' : lang === 'en' ? 'Independent from formation positions' : '与阵型站位配置相互独立'}</span>
        </div>

        <section className="saga-panel-soft mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
          <div>
            <p className="text-[9px] text-muted-foreground">{bonusLabel.level}: {level}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-300">{bonusLabel.bonus}: +{teamBonusPercent}%</p>
            <p className="mt-0.5 text-[8px] text-muted-foreground">{bonusLabel.hint}</p>
          </div>
          <GameIcon name="Users" className="h-5 w-5 text-emerald-300/70" />
        </section>

        <section className="saga-panel mt-3 p-3">
          <div className="grid grid-cols-5 gap-1.5">
            {slots.map((id, i) => {
              const def = id ? defOf(id) : null;
              return (
                <div key={i} className="relative">
                  {def ? (
                    <>
                      <CardTile
                        def={def}
                        lang={lang}
                        size="xs"
                        power={powerOf(id)}
                        selected={slot === i}
                        onClick={() => setDetailId(id)}
                      />
                      <button
                        type="button"
                        onClick={() => actions.setPartySlot(i, null)}
                        className="tap absolute -right-1 -top-1 rounded-full border border-white/20 bg-[#0b0e1c] p-0.5 text-muted-foreground hover:text-rose-300"
                      >
                        <GameIcon name="X" className="h-2.5 w-2.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSlot(i)}
                      className={`flex h-[76px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-[9px] ${
                        slot === i ? 'border-primary/60 bg-primary/[0.08] text-primary' : 'border-white/12 bg-white/[0.02] text-muted-foreground/60'
                      }`}
                    >
                      <GameIcon name="CircleDot" className="h-3 w-3" />
                      {t('formation.slot', { n: i + 1 })}
                    </button>
                  )}
                  <button type="button" onClick={() => setSlot(i)} className={`mt-0.5 w-full text-center text-[8px] ${slot === i ? 'text-primary' : 'text-muted-foreground/60'}`} aria-label={`Select formation slot ${i + 1}`}>
                    {i + 1}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <GoldButton onClick={actions.autoBest} className="px-2.5 py-1.5 text-[10px]">
                {t('formation.auto')}
              </GoldButton>
              {[0, 1, 2].map((i) => (
                <GhostButton key={i} onClick={() => actions.savePreset(i)} className="px-2 py-1 text-[9px]" active={presetIndex === i}>
                  {t('quick.preset')} {i + 1}
                </GhostButton>
              ))}
              {presets.map((p, i) =>
                p?.length ? (
                  <button
                    key={`load-${i}`}
                    type="button"
                    onClick={() => actions.loadPreset(i)}
                    className="tap rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] text-muted-foreground hover:text-primary"
                  >
                    ↺ {i + 1}
                  </button>
                ) : null,
              )}
            </div>
            <span className={`text-[9px] ${filled === 5 ? 'text-muted-foreground' : 'text-rose-300/80'}`}>
              {filled}/5 · {filled === 5 ? t('common.unlocked') : t('formation.need5')}
            </span>
          </div>
        </section>

        <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          <Chip color="#8B93A8" className="shrink-0">
            <button type="button" onClick={() => setFilter('all')} className={filter === 'all' ? 'text-primary' : ''}>
              {t('common.all')}
            </button>
          </Chip>
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] ${
                filter === c.id ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground'
              }`}
            >
              <GameIcon name={c.icon} className="h-2.5 w-2.5" />
              {c.name[lang] || c.name.zh}
            </button>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {list.map((id) => (
            <CardTile
              key={id}
              def={defOf(id)}
              lang={lang}
              size="sm"
              power={powerOf(id)}
              selected={party.includes(id)}
              onClick={() => setDetailId(id)}
            />
          ))}
        </div>
      </div>
      <CharacterDetailDialog
        cardId={detailId}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        onPlace={(id) => { place(id); setDetailId(null); }}
        onOpenForge={(id) => navigate(`/forge?cardId=${encodeURIComponent(id)}`)}
      />
    </AppShell>
  );
}