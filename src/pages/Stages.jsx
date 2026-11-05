// Stage selection page: restores the user's last local mode/stage selection, derives unlocks from saved progress, and delegates battle/quick-clear effects to GameContext actions.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, Bar } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { MODES, STAGES_PER_MODE, getStage } from '@/lib/gameData';
import { fmt } from '@/lib/format';

const MODE_IDS = ['normal', 'hard', 'nightmare'];
const STAGE_SELECTION_KEY = 'saga_galaxy_stage_selection_v1';

function readStageSelection() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STAGE_SELECTION_KEY) || '{}');
    const mode = MODE_IDS.includes(parsed.mode) ? parsed.mode : 'normal';
    const stages = Object.fromEntries(MODE_IDS.map((id) => {
      const value = Number(parsed.stages?.[id]);
      return [id, Number.isInteger(value) && value >= 1 && value <= STAGES_PER_MODE ? value : null];
    }));
    return { mode, stages };
  } catch {
    return { mode: 'normal', stages: { normal: null, hard: null, nightmare: null } };
  }
}

function writeStageSelection(selection) {
  try { localStorage.setItem(STAGE_SELECTION_KEY, JSON.stringify(selection)); } catch { /* local storage may be unavailable */ }
}

export default function Stages() {
  const { t, lang, progress, actions, power, clearGems = 0, clearGemStats = {} } = useGame();
  const [initialSelection] = useState(() => {
    const saved = readStageSelection();
    const canEnter = {
      normal: true,
      hard: (progress.normal || 0) >= STAGES_PER_MODE,
      nightmare: (progress.hard || 0) >= STAGES_PER_MODE,
    };
    if (!canEnter[saved.mode]) saved.mode = canEnter.hard ? 'hard' : 'normal';
    return saved;
  });
  const [mode, setMode] = useState(() => initialSelection.mode);
  const [selectedStages, setSelectedStages] = useState(() => initialSelection.stages);
  const [quickClearOpen, setQuickClearOpen] = useState(false);
  const [quickClearStage, setQuickClearStage] = useState(0);
  const [quickClearBatch, setQuickClearBatch] = useState(10);
  const [quickClearResult, setQuickClearResult] = useState(null);
  const navigate = useNavigate();

  const cleared = progress[mode] || 0;
  const total = MODES.length * STAGES_PER_MODE;
  const unlocked = {
    normal: true,
    hard: (progress.normal || 0) >= STAGES_PER_MODE,
    nightmare: (progress.hard || 0) >= STAGES_PER_MODE,
  };
  const maxSelectable = Math.min(STAGES_PER_MODE, cleared + 1);
  const rememberedStage = selectedStages[mode];
  const selectedStageN = Math.min(maxSelectable, Math.max(1, rememberedStage || maxSelectable));
  const selectedStage = getStage(mode, selectedStageN);

  const selectMode = (id) => {
    const nextCleared = Number(progress[id]) || 0;
    const maxStage = Math.min(STAGES_PER_MODE, nextCleared + 1);
    const restored = Math.min(maxStage, Math.max(1, selectedStages[id] || maxStage));
    const nextStages = { ...selectedStages, [id]: restored };
    setMode(id);
    setSelectedStages(nextStages);
    writeStageSelection({ mode: id, stages: nextStages });
  };

  const selectStage = (stageN) => {
    const nextStages = { ...selectedStages, [mode]: stageN };
    setSelectedStages(nextStages);
    writeStageSelection({ mode, stages: nextStages });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <header className="saga-panel flex items-center gap-3 px-3.5 py-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="tap rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-muted-foreground hover:text-primary"
          >
            <GameIcon name="ChevronRight" className="h-3.5 w-3.5 rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="saga-heading text-[13px] text-foreground/95">{t('stages.title')}</p>
            <p className="text-[9px] text-muted-foreground">{t('stages.tip')}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t('player.power')}</p>
            <p className="text-[12px] tabular-nums text-primary">{fmt(power)}</p>
          </div>
        </header>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {MODE_IDS.map((id) => {
            const def = MODES.find((m) => m.id === id);
            const done = progress[id] || 0;
            const isUnlocked = unlocked[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => isUnlocked && selectMode(id)}
                className={`tap rounded-xl border px-2 py-2 text-left ${
                  mode === id ? 'border-primary/45 bg-primary/[0.08]' : 'border-white/10 bg-white/[0.03]'
                } ${isUnlocked ? '' : 'opacity-45'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] ${mode === id ? 'text-primary' : 'text-foreground/85'}`}>
                    {t(`stages.${id}`)}
                  </span>
                  {isUnlocked ? null : <GameIcon name="Lock" className="h-2.5 w-2.5 text-muted-foreground" />}
                </div>
                <p className="mt-0.5 text-[8px] tabular-nums text-muted-foreground">
                  {done}/{STAGES_PER_MODE}
                </p>
                <Bar value={done} max={STAGES_PER_MODE} color={def.tint} className="mt-1" height="h-[3px]" />
              </button>
            );
          })}
        </div>

        {unlocked[mode] ? (
          <>
            <div className="saga-panel mt-3 flex items-center gap-3 p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.07]">
                <GameIcon name={selectedStage.boss ? 'Crown' : 'Map'} className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] text-foreground/90">
                  {t('stages.stage', { n: selectedStageN })}
                  {selectedStage.boss ? ` · ${t('stages.boss')}` : ''}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {t('stages.power')} {fmt(selectedStage.power)} · {t('battle.stamina')}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <GoldButton onClick={() => navigate(`/battle?mode=${mode}&stage=${selectedStageN}`)} className="px-3 py-1.5 text-[10px]">
                  {t('stages.challenge')}
                </GoldButton>
                <button type="button" disabled={cleared < 1}
                  onClick={() => { setQuickClearStage(cleared); setQuickClearBatch(10); setQuickClearResult(null); setQuickClearOpen(true); }}
                  className="tap rounded-lg border border-primary/35 bg-primary/[0.08] px-2.5 py-1.5 text-[10px] text-primary disabled:cursor-not-allowed disabled:opacity-40">
                  {t('clearGem.quickButton')}
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {Array.from({ length: 20 }, (_, ci) => {
                const chapter = ci + 1;
                const start = (chapter - 1) * 5 + 1;
                const chapterCleared = Math.max(0, Math.min(5, cleared - (start - 1)));
                if (start > cleared + 1) {
                  return (
                    <div
                      key={chapter}
                      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2 text-[10px] text-muted-foreground/60"
                    >
                      <span>{t('stages.chapter', { n: chapter })}</span>
                      <GameIcon name="Lock" className="h-3 w-3" />
                    </div>
                  );
                }
                return (
                  <div key={chapter} className="saga-panel-soft overflow-hidden">
                    <div className="flex items-center justify-between px-3 pb-1 pt-2">
                      <span className="text-[10px] tracking-wide text-foreground/80">
                        {t('stages.chapter', { n: chapter })}
                      </span>
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {chapterCleared}/5
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 px-2 pb-2">
                      {Array.from({ length: 5 }, (_, si) => {
                        const stageN = start + si;
                        const isCleared = stageN <= cleared;
                        const isNext = stageN === cleared + 1;
                        const boss = stageN % 5 === 0;
                        return (
                          <button
                            key={stageN}
                            type="button"
                            disabled={!isCleared && !isNext}
                            aria-pressed={selectedStageN === stageN}
                            onClick={() => { selectStage(stageN); navigate(`/battle?mode=${mode}&stage=${stageN}`); }}
                            className={`tap relative flex h-[52px] flex-col items-center justify-center rounded-lg border text-[11px] ${
                              selectedStageN === stageN
                                ? 'border-primary/60 bg-primary/[0.12] text-primary glow-gold'
                                : isCleared
                                  ? 'border-white/10 bg-white/[0.04] text-foreground/70'
                                  : 'border-white/[0.06] bg-white/[0.015] text-muted-foreground/40'
                            }`}
                          >
                            {boss ? <GameIcon name="Crown" className="absolute right-1 top-1 h-2.5 w-2.5 text-primary/70" /> : null}
                            {stageN}
                            <span className="text-[7px] tracking-wider opacity-70">
                              {isCleared ? t('stages.cleared') : `${Math.round(getStage(mode, stageN).power / 100) / 10}k`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="saga-panel mt-3 flex flex-col items-center gap-2 p-8 text-center">
            <GameIcon name="Lock" className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-[11px] text-muted-foreground">{t('stages.clearPrev')}</p>
          </div>
        )}
      </div>

        {quickClearOpen ? (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#03050d]/80 px-3 py-6 backdrop-blur-sm">
            <div className="saga-panel max-h-[90dvh] w-full max-w-md overflow-y-auto p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="saga-heading text-sm text-foreground">{quickClearResult ? t('clearGem.settlementTitle') : t('clearGem.title')}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{t('clearGem.desc')}</p>
                </div>
                <button type="button" onClick={() => setQuickClearOpen(false)} className="tap rounded-lg border border-white/10 px-2 py-1 text-xs text-muted-foreground">{t('common.close')}</button>
              </div>
              {!quickClearResult ? (
                <>
                  <div className="mt-3 rounded-xl border border-primary/20 bg-primary/[0.05] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('clearGem.balance')}</span>
                      <span className="text-sm font-semibold text-primary"><GameIcon name="Gem" className="mr-1 inline h-3.5 w-3.5" />{fmt(clearGems)}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[9px]">
                      <div><p className="text-muted-foreground">{t('clearGem.earnedWins')}</p><p className="text-emerald-300">{fmt(clearGemStats.earnedFromWins || 0)}</p></div>
                      <div><p className="text-muted-foreground">{t('clearGem.earnedLosses')}</p><p className="text-amber-300">{fmt(clearGemStats.earnedFromLosses || 0)}</p></div>
                      <div><p className="text-muted-foreground">{t('clearGem.spent')}</p><p>{fmt(clearGemStats.spent || 0)}</p></div>
                    </div>
                  </div>
                  {cleared > 0 ? (
                    <label className="mt-3 block text-[10px] text-muted-foreground">
                      {t('clearGem.selectStage')}
                      <select value={quickClearStage} onChange={(event) => setQuickClearStage(Number(event.target.value))}
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-foreground">
                        {Array.from({ length: cleared }, (_, index) => index + 1).reverse().map((stageNumber) => (
                          <option key={stageNumber} value={stageNumber}>{t('stages.stage', { n: stageNumber })}{stageNumber % 5 === 0 ? ` · ${t('stages.boss')}` : ''}</option>
                        ))}
                      </select>
                    </label>
                  ) : <p className="mt-3 text-xs text-muted-foreground">{t('clearGem.noStages')}</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setQuickClearBatch(10)} className={`tap rounded-lg border px-3 py-2 text-xs ${quickClearBatch === 10 ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-foreground/70'}`}>{t('clearGem.batch10')}</button>
                    <button type="button" onClick={() => setQuickClearBatch(20)} className={`tap rounded-lg border px-3 py-2 text-xs ${quickClearBatch === 20 ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-foreground/70'}`}>{t('clearGem.batch20')}</button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">{t('clearGem.actualBatch', { n: Math.min(quickClearBatch, Math.max(0, Number(clearGems) || 0)) })}</p>
                  {quickClearStage > 0 ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-center">
                      <div><p className="text-[9px] text-muted-foreground">{t('res.gold')}</p><p className="text-xs text-primary">{fmt((getStage(mode, quickClearStage).gold || 0) * Math.min(quickClearBatch, clearGems))}</p></div>
                      <div><p className="text-[9px] text-muted-foreground">{t('player.exp')}</p><p className="text-xs text-accent">{fmt((getStage(mode, quickClearStage).exp || 0) * Math.min(quickClearBatch, clearGems))}</p></div>
                      <div><p className="text-[9px] text-muted-foreground">{t('res.gems')}</p><p className="text-xs text-primary">{fmt((getStage(mode, quickClearStage).gems || 0) * Math.min(quickClearBatch, clearGems))}</p></div>
                    </div>
                  ) : null}
                  <GoldButton onClick={() => { const result = actions.quickClear({ mode, stage: quickClearStage, batch: quickClearBatch }); if (result) setQuickClearResult(result); }}
                    disabled={quickClearStage < 1 || quickClearStage > cleared || Number(clearGems) < 1} className="mt-3 w-full py-2.5">
                    {t('clearGem.title')}
                  </GoldButton>
                </>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-center text-[10px] text-muted-foreground">{t('stages.' + quickClearResult.mode)} · {t('stages.stage', { n: quickClearResult.stage })}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('clearGem.count')}</p><p className="text-lg font-semibold">{fmt(quickClearResult.clears)}</p></div>
                    <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('clearGem.gemsSpent')}</p><p className="text-lg font-semibold text-primary">-{fmt(quickClearResult.clearGemsSpent)}</p></div>
                    <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('res.gold')}</p><p className="text-lg font-semibold text-primary">+{fmt(quickClearResult.gold)}</p></div>
                    <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('player.exp')}</p><p className="text-lg font-semibold text-accent">+{fmt(quickClearResult.exp)}</p></div>
                    <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('res.gems')}</p><p className="text-lg font-semibold text-primary">+{fmt(quickClearResult.gems)}</p></div>
                    <div className="rounded-xl bg-white/[0.04] p-3"><p className="text-[9px] text-muted-foreground">{t('clearGem.levels')}</p><p className="text-lg font-semibold text-emerald-300">+{fmt(quickClearResult.levels || 0)}</p></div>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
                    <p className="mb-2 text-[10px] text-muted-foreground">{t('clearGem.materials')}</p>
                    {quickClearResult.materials?.length ? quickClearResult.materials.map((item) => <div key={item.id} className="flex justify-between text-xs"><span>{item.name}</span><span>+{fmt(item.amount)}</span></div>) : <p className="text-[10px] text-muted-foreground">{t('clearGem.noMaterials')}</p>}
                  </div>
                  <GoldButton onClick={() => { setQuickClearOpen(false); setQuickClearResult(null); }} className="w-full py-2">{t('common.confirm')}</GoldButton>
                </div>
              )}
            </div>
          </div>
        ) : null}
    </AppShell>
  );
}