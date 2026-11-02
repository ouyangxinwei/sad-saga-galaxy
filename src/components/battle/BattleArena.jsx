import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppShell from '@/components/common/AppShell';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, GhostButton, RewardLine } from '@/components/common/Bits';
import UnitStatus from '@/components/battle/UnitStatus';
import BattleLog from '@/components/battle/BattleLog';
import { useGame } from '@/lib/GameContext';
import { ENEMY_MAP, EVENT_STAGE, MODE_MAP, TOWER_STAGE, TYPE_MAP, enemyStats, getStage } from '@/lib/gameData';
import { partyUnits } from '@/lib/cards';
import { applyEvent, initialLive, simulateBattle } from '@/lib/battle';
import { fmt } from '@/lib/format';

const STAMINA_COST = 6;
const BATTLE_SPEED_KEY = 'oooo_battle_speed_v1';

function loadBattleSpeed() {
  try {
    const saved = Number(window.localStorage.getItem(BATTLE_SPEED_KEY));
    return [1, 2, 3].includes(saved) ? saved : 1;
  } catch {
    return 1;
  }
}


export default function BattleArena({ mode, n }) {
  const game = useGame();
  const { t, lang, actions, notify, fortuneDef, progress, party } = game;
  const navigate = useNavigate();

  const stage = useMemo(
    () => (mode === 'tower' ? TOWER_STAGE(n) : mode === 'event' ? EVENT_STAGE : getStage(mode, n)),
    [mode, n],
  );

  const locked =
    mode !== 'tower' && mode !== 'event' && (n > (progress[mode] || 0) + 1 || (mode !== 'normal' && (progress[MODE_MAP[mode].index === 1 ? 'normal' : 'hard'] || 0) < 100));

  const [paid, setPaid] = useState(null);
  const paidRef = useRef(false);

  useEffect(() => {
    if (paidRef.current) return;
    paidRef.current = true;
    if (locked) {
      setPaid(true);
      return;
    }
    setPaid(mode === 'event' ? true : actions.spendStamina(STAMINA_COST));
  }, []);

  useEffect(() => {
    if (locked) navigate('/stages', { replace: true });
  }, [locked, navigate]);

  const partyKey = (party || []).join('|');
  const allies = useMemo(
    () => partyUnits(game, fortuneDef),
    [partyKey, game.level, game.rebirth, game.lang, game.equipped, fortuneDef?.id],
  );

  const enemies = useMemo(
    () =>
      stage.enemies.map((e, i) => {
        const edef = ENEMY_MAP[e.enemyId];
        const st = enemyStats(edef, e.scale);
        return {
          uid: `e_${i}`,
          name: edef.name[lang] || edef.name.zh,
          hp: st.hp,
          atk: st.atk,
          def: st.def,
          spd: st.spd,
          crit: st.crit,
          mp: 100,
          maxMp: 100,
          lp: 0,
          maxLp: 0,
          skills: [edef.skill, 'claw'],
          classId: 'beast',
          role: 'enemy',
          rarity: edef.rarity,
          type: edef.type,
        };
      }),
    [stage, lang],
  );

  const sim = useMemo(() => simulateBattle(allies, enemies), [allies, enemies]);
  const [step, setStep] = useState(0);
  const [live, setLive] = useState(() => initialLive(sim.units));
  const [speed, setSpeed] = useState(loadBattleSpeed);

  useEffect(() => {
    try {
      window.localStorage.setItem(BATTLE_SPEED_KEY, String(speed));
    } catch {
      // Keep the selected speed for the current battle if storage is unavailable.
    }
  }, [speed]);
  const [finished, setFinished] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const ev = sim.events[step];
    if (!ev) return;
    setLive((prev) => applyEvent(prev, ev));
    if (ev.kind === 'end') {
      setFinished(true);
      setResult(ev.result);
      const r = actions.finishBattle({ mode, n, stage, win: ev.result === 'win' });
      setRewards(r);
      if (r?.levels) notify(t('notif.levelup', { n: game.level + r.levels }));
    }
  }, [step]);

  useEffect(() => {
    if (finished) return undefined;
    if (step >= sim.events.length - 1) return undefined;
    const timer = setTimeout(() => setStep((s) => s + 1), 620 / speed);
    return () => clearTimeout(timer);
  }, [step, speed, finished, sim]);

  const round = useMemo(() => {
    let r = 1;
    for (let i = 0; i <= step && i < sim.events.length; i += 1) {
      if (sim.events[i].kind === 'round') r = sim.events[i].round;
    }
    return r;
  }, [step, sim]);

  const allyUnits = sim.units.filter((u) => u.side === 'ally');
  const enemyUnits = sim.units.filter((u) => u.side === 'enemy');

  const title =
    mode === 'tower'
      ? t('tower.title', { n })
      : mode === 'event'
        ? t('event.title')
        : `${t('stages.title')} ? ${t(`stages.${mode}`)} ${n}`;

  const backTo = mode === 'tower' || mode === 'event' ? '/' : '/stages';

  if (paid === false) {
    return (
      <AppShell hideNav>
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6">
          <GameIcon name="BatteryFull" className="h-8 w-8 text-rose-400/80" />
          <p className="text-center text-[12px] text-muted-foreground">{t('common.notEnough')}</p>
          <GoldButton onClick={() => navigate('/')} className="px-6 py-2">
            {t('common.close')}
          </GoldButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <div className="mx-auto max-w-[1080px] px-2.5 pb-8 pt-3 sm:px-6 sm:pt-4">
        <header className="saga-panel flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="tap rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-muted-foreground hover:text-primary"
          >
            <GameIcon name="ChevronRight" className="h-3.5 w-3.5 rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] text-foreground/90">{title}</p>
            <p className="text-[9px] text-muted-foreground">
              {t('stages.power')} {fmt(stage.power)}
              {stage.boss ? ` ? ${t('stages.boss')}` : ''}
            </p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] tabular-nums text-primary">
            {t('battle.round', { n: round })}
          </span>
          <button
            type="button"
            onClick={() => setSpeed((current) => (current === 1 ? 2 : current === 2 ? 3 : 1))}
            className="tap rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] tabular-nums text-foreground/80"
          >
            ×{speed}
          </button>
          <button
            type="button"
            onClick={() => {
              setLive(sim.final);
              setStep(sim.events.length - 1);
            }}
            className="tap rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] text-foreground/80"
          >
            {t('battle.skip')}
          </button>
        </header>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="saga-panel relative overflow-hidden p-3 sm:p-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-rose-500/[0.07] to-transparent" />
            <div className="relative flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-rose-300/70">{t('battle.enemy')}</span>
              <span className="text-[9px] text-muted-foreground">{stage.enemies.length}</span>
            </div>
            <div className="relative mt-2 grid grid-cols-3 gap-2">
              {enemyUnits.map((u) => (
                <UnitStatus key={u.uid} unit={u} state={live[u.uid]} />
              ))}
            </div>

            <div className="relative my-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="saga-display text-[10px] tracking-[0.3em] text-muted-foreground/70">
                {finished ? (result === 'win' ? t('battle.win') : t('battle.lose')) : 'VS'}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <div className="relative flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-primary/70">{t('battle.party')}</span>
              <span className="text-[9px] text-muted-foreground">{t('battle.auto')}</span>
            </div>
            <div className="relative mt-2 grid grid-cols-5 gap-1.5">
              {allyUnits.map((u) => (
                <UnitStatus key={u.uid} unit={u} state={live[u.uid]} compact />
              ))}
            </div>
          </div>

          <BattleLog events={sim.events} step={step} lang={lang} t={t} />
        </div>
      </div>

      {finished ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-[#03050d]/75 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 26, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="saga-panel relative w-full max-w-sm overflow-hidden p-5 text-center"
          >
            <div className="hairline absolute inset-x-6 top-0" />
            <p className={`saga-display text-2xl ${result === 'win' ? 'gold-text' : 'text-rose-300/90'}`}>
              {result === 'win' ? t('battle.win') : t('battle.lose')}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {t('battle.round', { n: sim.rounds })} ? {title}
            </p>

            {result === 'win' && rewards ? (
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
                <p className="mb-1.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{t('common.reward')}</p>
                <RewardLine reward={rewards} t={t} lang={lang} />
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <GhostButton
                onClick={() =>
                  navigate(`/battle?mode=${mode}&stage=${n}&r=${Date.now()}`)
                }
                className="py-2.5"
              >
                {t('battle.again')}
              </GhostButton>
              {result === 'win' && mode !== 'tower' && mode !== 'event' && n < 100 ? (
                <GoldButton
                  onClick={() => navigate(`/battle?mode=${mode}&stage=${n + 1}&r=${Date.now()}`)}
                  className="py-2.5"
                >
                  {t('battle.next')}
                </GoldButton>
              ) : (
                <GoldButton onClick={() => navigate(backTo)} className="py-2.5">
                  {t('battle.back')}
                </GoldButton>
              )}
            </div>
            {result === 'win' && mode !== 'tower' && mode !== 'event' && n < 100 ? (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="mt-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                {t('battle.back')}
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AppShell>
  );
}