import { SKILLS } from './gameData';
import { traceSync } from './logger';

const rnd = (min, max) => min + Math.random() * (max - min);

const BASIC = {
  name: { zh: '普通攻击', ja: '通常攻撃', en: 'Basic Attack' },
  kind: 'attack',
  target: 'single',
  power: 1,
  mp: 0,
};

function makeUnitImpl(cfg) {
  return {
    ...cfg,
    maxHp: cfg.maxHp || cfg.hp,
    hp: cfg.hp,
    shield: 0,
    mp: cfg.maxMp ?? 100,
    maxMp: cfg.maxMp ?? 100,
    alive: true,
    taunt: 0,
    dr: 0,
    drTurns: 0,
    lp: cfg.lp ?? 0,
    maxLp: cfg.maxLp ?? 0,
    crit: cfg.crit ?? 0.08,
    role: cfg.role || cfg.classId,
    skills: cfg.skills && cfg.skills.length ? cfg.skills : ['claw'],
  };
}

const lowestHpRatio = (list) =>
  list.filter((u) => u.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

const lowestHp = (list) => list.filter((u) => u.alive).sort((a, b) => a.hp - b.hp)[0];

function chooseSkillImpl(unit, allies, foes, round) {
  const options = [];
  unit.skills.forEach((id) => {
    const sk = SKILLS[id];
    if (!sk) return;
    if ((sk.mp || 0) > unit.mp) return;
    let score = 0;
    const wounded = allies.filter((a) => a.alive && a.hp < a.maxHp * 0.72);
    if (sk.kind === 'attack') {
      score = sk.target === 'all' ? 28 + foes.length * 24 : 56;
    } else if (sk.kind === 'support') {
      if (!wounded.length) score = 0;
      else if (sk.target === 'all') score = 72 + wounded.length * 14;
      else if (sk.target === 'random') score = 68;
      else score = 58 + (1 - wounded[0].hp / wounded[0].maxHp) * 42;
    } else if (sk.kind === 'defense') {
      if (sk.taunt) score = round < 3 ? 76 : 18;
      else if (sk.mitigate) score = round < 5 ? 70 : 24;
      else score = allies.some((a) => a.alive && a.hp < a.maxHp * 0.72) ? 66 : 12;
    }
    options.push({ sk, id, score: score * rnd(0.92, 1.08) });
  });
  options.sort((a, b) => b.score - a.score);
  if (options.length && options[0].score > 40) return options[0];
  return { sk: BASIC, id: 'basic' };
}

function damageImpl(attacker, target, sk, events, units) {
  const crit = Math.random() < attacker.crit + (sk.critBonus || 0);
  let dmg = attacker.atk * sk.power * rnd(0.93, 1.07) * (crit ? 1.65 : 1);
  dmg = Math.max(1, dmg - target.def * (1 - (sk.pierce || 0)) * 0.45);
  if (target.dr) dmg *= 1 - target.dr;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, dmg);
    target.shield -= absorbed;
    dmg -= absorbed;
  }
  target.hp = Math.max(0, target.hp - dmg);
  events.push({
    kind: 'damage',
    sid: attacker.uid,
    tid: target.uid,
    actor: attacker.name,
    target: target.name,
    amount: Math.round(dmg),
    crit,
    shield: Math.round(target.shield),
    hp: Math.round(target.hp),
    maxHp: Math.round(target.maxHp),
  });
  if (target.hp <= 0) handleDeath(target, units, events);
}

function healImpl(attacker, target, sk, events) {
  const amount = Math.round(attacker.atk * sk.heal * (1 + (attacker.healBonus || 0)) * rnd(0.95, 1.05));
  target.hp = Math.min(target.maxHp, target.hp + amount);
  events.push({
    kind: 'heal',
    sid: attacker.uid,
    tid: target.uid,
    actor: attacker.name,
    target: target.name,
    amount,
    hp: Math.round(target.hp),
    maxHp: Math.round(target.maxHp),
  });
}

function handleDeathImpl(unit, units, events) {
  unit.alive = false;
  unit.hp = 0;
  unit.taunt = 0;
  events.push({ kind: 'death', tid: unit.uid, target: unit.name });
  if (unit.lp <= 0) {
    events.push({ kind: 'perma', tid: unit.uid, target: unit.name });
    return;
  }
  const rescuers = units
    .filter((u) => u.side === unit.side && u.alive && u.uid !== unit.uid && u.lp > 0)
    .sort((a, b) => (b.role === 'priest' ? 1 : 0) - (a.role === 'priest' ? 1 : 0));
  const caster = rescuers[0];
  if (!caster) {
    events.push({ kind: 'perma', tid: unit.uid, target: unit.name });
    return;
  }
  caster.lp -= 1;
  unit.lp -= 1;
  unit.alive = true;
  unit.hp = Math.round(unit.maxHp * 0.4);
  events.push({
    kind: 'revive',
    tid: unit.uid,
    target: unit.name,
    caster: caster.name,
    casterUid: caster.uid,
    casterLp: caster.lp,
    lp: unit.lp,
    hp: unit.hp,
    maxHp: Math.round(unit.maxHp),
  });
}

function actImpl(unit, units, round, events) {
  const allies = units.filter((u) => u.side === unit.side && u.alive);
  const foes = units.filter((u) => u.side !== unit.side && u.alive);
  if (!foes.length) return;

  const { sk, id } = chooseSkill(unit, allies, foes, round);
  unit.mp = Math.max(0, unit.mp - (sk.mp || 0));
  events.push({
    kind: 'action',
    uid: unit.uid,
    name: unit.name,
    sid: unit.uid,
    skill: sk.name,
    skillId: id,
    mp: unit.mp,
  });

  if (sk.kind === 'attack') {
    const taunters = foes.filter((f) => f.taunt > 0);
    const pool = taunters.length ? taunters : foes;
    const targets = sk.target === 'all' ? [...foes] : [lowestHp(pool) || foes[0]];
    const hits = sk.hits || 1;
    for (let h = 0; h < hits; h += 1) {
      targets.forEach((tg) => {
        if (tg && tg.alive) damage(unit, tg, sk, events, units);
      });
    }
  } else if (sk.kind === 'support') {
    let targets;
    if (sk.target === 'all') targets = allies;
    else if (sk.target === 'random') {
      targets = allies
        .filter((a) => a.alive && a.hp < a.maxHp)
        .sort(() => Math.random() - 0.5)
        .slice(0, sk.targets || 2);
    } else targets = [lowestHpRatio(allies) || unit];
    if (!targets.length) targets = [unit];
    targets.forEach((tg) => tg && heal(unit, tg, sk, events));
  } else if (sk.taunt) {
    const amount = Math.round(unit.maxHp * (sk.shield || 0.3));
    unit.shield += amount;
    unit.taunt = sk.taunt;
    events.push({ kind: 'shield', tid: unit.uid, target: unit.name, amount, shield: unit.shield });
    events.push({ kind: 'taunt', tid: unit.uid, target: unit.name });
  } else if (sk.shield) {
    const tg = lowestHpRatio(allies) || unit;
    const amount = Math.round(tg.maxHp * sk.shield);
    tg.shield += amount;
    events.push({ kind: 'shield', tid: tg.uid, target: tg.name, amount, shield: tg.shield });
  } else if (sk.mitigate) {
    allies.forEach((a) => {
      a.dr = sk.mitigate;
      a.drTurns = sk.turns;
    });
    events.push({ kind: 'ward', name: unit.name, value: sk.mitigate });
  }
}

function simulateBattleImpl(allyCfgs, enemyCfgs, maxRounds = 40) {
  const units = [
    ...allyCfgs.map((u) => makeUnit({ ...u, side: 'ally' })),
    ...enemyCfgs.map((u, i) => makeUnit({ ...u, side: 'enemy', uid: `e_${i}` })),
  ];
  const events = [];
  let round = 0;

  const anyAlive = (side) => units.some((u) => u.side === side && u.alive);

  while (round < maxRounds && anyAlive('ally') && anyAlive('enemy')) {
    round += 1;
    events.push({ kind: 'round', round });
    const order = units.filter((u) => u.alive).sort((a, b) => b.spd - a.spd);
    for (const u of order) {
      if (!u.alive) continue;
      if (!anyAlive('ally') || !anyAlive('enemy')) break;
      act(u, units, round, events);
    }
    units.forEach((u) => {
      u.mp = Math.min(u.maxMp, u.mp + 14);
      if (u.drTurns > 0) {
        u.drTurns -= 1;
        if (u.drTurns === 0) u.dr = 0;
      }
      if (u.taunt > 0) u.taunt -= 1;
    });
  }

  const result = anyAlive('enemy') ? 'lose' : 'win';
  events.push({ kind: 'end', result });

  const final = Object.fromEntries(
    units.map((u) => [
      u.uid,
      {
        hp: Math.max(0, Math.round(u.hp)),
        maxHp: Math.round(u.maxHp),
        mp: Math.round(u.mp),
        maxMp: u.maxMp,
        lp: u.lp,
        shield: Math.round(u.shield),
        alive: u.alive,
      },
    ]),
  );

  return { events, result, rounds: round, final, units };
}

function initialLiveImpl(units) {
  return Object.fromEntries(
    units.map((u) => [
      u.uid,
      {
        hp: Math.round(u.hp),
        maxHp: Math.round(u.maxHp),
        mp: Math.round(u.mp),
        maxMp: u.maxMp,
        lp: u.lp,
        shield: 0,
        alive: true,
      },
    ]),
  );
}

function applyEventImpl(live, ev) {
  if (!ev) return live;
  const patch = (uid, data) => (live[uid] ? { ...live, [uid]: { ...live[uid], ...data } } : live);
  switch (ev.kind) {
    case 'damage':
      return patch(ev.tid, { hp: ev.hp, shield: ev.shield });
    case 'heal':
      return patch(ev.tid, { hp: ev.hp });
    case 'shield':
      return patch(ev.tid, { shield: ev.shield });
    case 'death':
      return patch(ev.tid, { alive: false, hp: 0 });
    case 'perma':
      return patch(ev.tid, { alive: false, hp: 0 });
    case 'revive':
      return {
        ...patch(ev.tid, { alive: true, hp: ev.hp, lp: ev.lp }),
        ...(ev.casterUid ? { [ev.casterUid]: { ...live[ev.casterUid], lp: ev.casterLp } } : {}),
      };
    case 'action':
      return patch(ev.uid, { mp: ev.mp });
    default:
      return live;
  }
}
function chooseSkill(unit, allies, foes, round) { return traceSync('Battle.chooseSkill', () => chooseSkillImpl(unit, allies, foes, round), { unit: unit?.uid, round }); }
function damage(attacker, target, sk, events, units) { return traceSync('Battle.damage', () => damageImpl(attacker, target, sk, events, units), { attacker: attacker?.uid, target: target?.uid, skill: sk?.name }); }
function heal(attacker, target, sk, events) { return traceSync('Battle.heal', () => healImpl(attacker, target, sk, events), { healer: attacker?.uid, target: target?.uid, skill: sk?.name }); }
function handleDeath(unit, units, events) { return traceSync('Battle.handleDeath', () => handleDeathImpl(unit, units, events), { unit: unit?.uid }); }
function act(unit, units, round, events) { return traceSync('Battle.act', () => actImpl(unit, units, round, events), { unit: unit?.uid, round }); }
export function makeUnit(cfg) { return traceSync('Battle.makeUnit', () => makeUnitImpl(cfg), { unit: cfg?.uid || cfg?.name || 'unknown' }); }
export function simulateBattle(allyCfgs, enemyCfgs, maxRounds = 40) { return traceSync('Battle.simulateBattle', () => simulateBattleImpl(allyCfgs, enemyCfgs, maxRounds), { allies: allyCfgs?.length || 0, enemies: enemyCfgs?.length || 0, maxRounds }); }
export function initialLive(units) { return traceSync('Battle.initialLive', () => initialLiveImpl(units), { units: units?.length || 0 }); }
export function applyEvent(live, ev) { return traceSync('Battle.applyEvent', () => applyEventImpl(live, ev), { eventKind: ev?.kind || 'unknown' }); }
