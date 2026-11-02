import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, Bar } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { MODES, STAGES_PER_MODE, getStage } from '@/lib/gameData';
import { fmt } from '@/lib/format';

const MODE_IDS = ['normal', 'hard', 'nightmare'];

export default function Stages() {
  const { t, lang, progress, actions, power } = useGame();
  const [mode, setMode] = useState('normal');
  const navigate = useNavigate();

  const cleared = progress[mode] || 0;
  const total = MODES.length * STAGES_PER_MODE;
  const unlocked = {
    normal: true,
    hard: (progress.normal || 0) >= STAGES_PER_MODE,
    nightmare: (progress.hard || 0) >= STAGES_PER_MODE,
  };
  const nextN = Math.min(STAGES_PER_MODE, cleared + 1);
  const nextStage = getStage(mode, nextN);

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
                onClick={() => isUnlocked && setMode(id)}
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
                <GameIcon name={nextStage.boss ? 'Crown' : 'Map'} className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] text-foreground/90">
                  {t('stages.stage', { n: nextN })}
                  {nextStage.boss ? ` · ${t('stages.boss')}` : ''}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {t('stages.power')} {fmt(nextStage.power)} · {t('battle.stamina')}
                </p>
              </div>
              <GoldButton onClick={() => navigate(`/battle?mode=${mode}&stage=${nextN}`)} className="shrink-0 px-3 py-1.5 text-[10px]">
                {t('stages.challenge')}
              </GoldButton>
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
                            onClick={() => navigate(`/battle?mode=${mode}&stage=${stageN}`)}
                            className={`tap relative flex h-[52px] flex-col items-center justify-center rounded-lg border text-[11px] ${
                              isNext
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
    </AppShell>
  );
}