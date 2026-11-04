// Formation system V1.0 — definitions and persistent position configuration.
// Phase 1 stores effect metadata but does not apply combat modifiers.

export const FORMATION_SCHEMA_VERSION = 1;
export const FORMATION_SLOT_COUNT = 5;
export const DEFAULT_FORMATION_ID = 'balanced-ring';
const localized = (zh, ja, en) => ({ zh, ja, en });
const p = (id, role, x, y) => ({ id, role, x, y });

export const FORMATIONS = [
  { id: 'star', name: localized('五芒星阵','五芒星陣','Star Formation'), role: localized('单核爆发','単体集中火力','Single-carry burst'), description: localized('指定一名核心角色集中输出，其他成员承担属性代价。','指定した主力 1 人に火力を集中し、他のメンバーは能力低下を受ける。','Concentrates power in one chosen carry while the other members accept stat penalties.'), positions: [p('star-top','core',50,5),p('star-upper-right','support',94,36),p('star-lower-right','support',78,91),p('star-lower-left','support',22,91),p('star-upper-left','support',6,36)], effects: { positions: { core: { statPct: { atk: 0.30 }, chancePp: { desperateCrit: 0.05 } }, support: { statPct: { hp: -0.10, atk: -0.10, def: -0.10, spd: -0.10, mp: -0.10 } } } } },
  { id: 'four-corner-core', name: localized('四方核心阵','四方コア陣','Four-Corner Core'), role: localized('核心技能','コアスキル','Core skill'), description: localized('中央角色最后行动，以更充足的 MP 释放强力技能。','中央のキャラクターが最後に行動し、十分な MP で強力なスキルを使用する。','The central character acts last and uses a stronger skill with extra MP.'), positions: [p('north-west','corner',15,15),p('north-east','corner',85,15),p('center','core',50,50),p('south-west','corner',15,85),p('south-east','corner',85,85)], effects: { positions: { core: { statPct: { mp: 0.25 }, skillDamagePct: 0.10, actionOrder: 'ally-last' }, corner: { statPct: { def: 0.05 } } } } },
  { id: 'spearhead', name: localized('尖锋突击阵','尖鋒突撃陣','Spearhead'), role: localized('高速突击','高速突撃','Fast assault'), description: localized('前锋承担主要输出，两翼协助突破。','先鋒が主力火力を担い、両翼が突破を支援する。','The vanguard leads the attack while the wings support the breakthrough.'), positions: [p('vanguard','vanguard',50,6),p('left-wing','wing',20,42),p('right-wing','wing',80,42),p('rear-left','rear',32,88),p('rear-right','rear',68,88)], effects: { positions: { vanguard: { statPct: { atk: 0.25, spd: 0.15 } }, wing: { chancePp: { critical: 0.05 } }, rear: { statPct: { def: -0.10 } } } } },
  { id: 'diamond-guard', name: localized('菱形守护阵','菱形守護陣','Diamond Guard'), role: localized('防御生存','防御・生存','Defensive survival'), description: localized('前锋稳固防线，后卫获得额外闪避能力。','前衛が防衛線を支え、後衛は追加の回避能力を得る。','The front line anchors defense while the rear guard gains extra evasion.'), positions: [p('front','front',50,5),p('left-support','support',18,48),p('center-support','support',50,55),p('right-support','support',82,48),p('rear-guard','rear',50,95)], effects: { team: { damageReductionPct: 0.05 }, positions: { front: { statPct: { def: 0.25, hp: 0.20 } }, rear: { chancePp: { dodge: 0.10 } } } } },
  { id: 'long-serpent', name: localized('一字长蛇阵','一字長蛇陣','Long Serpent'), role: localized('速度连击','速度・連続攻撃','Speed and chain attacks'), description: localized('全队提升速度，并按照阵型位置建立行动先后。','全員の速度を高め、陣形の位置順で行動優先度を設定する。','Raises team speed and uses formation positions to establish ally action priority.'), positions: [p('line-1','line',8,50),p('line-2','line',29,50),p('line-3','line',50,50),p('line-4','line',71,50),p('line-5','line',92,50)], effects: { team: { statPct: { spd: 0.10 } }, positions: { line: { actionOrder: 'formation-order', followUpCriticalPp: 0.05 } } } },
  { id: 'cross-support', name: localized('十字协同阵','十字協同陣','Cross Support'), role: localized('技能协作','スキル連携','Skill synergy'), description: localized('中央角色获得 MP，四周角色降低技能消耗。','中央のキャラクターは MP を獲得し、周囲のキャラクターはスキル消費を抑える。','The center gains MP while surrounding allies reduce skill costs.'), positions: [p('cross-center','center',50,50),p('cross-north','outer',50,7),p('cross-east','outer',92,50),p('cross-south','outer',50,93),p('cross-west','outer',8,50)], effects: { team: { skillEffectPct: 0.05 }, positions: { center: { statPct: { mp: 0.25 } }, outer: { mpCostReductionPct: 0.10 } } } },
  { id: 'staggered-skirmish', name: localized('错位游击阵','錯位遊撃陣','Staggered Skirmish'), role: localized('闪避反击','回避・反撃','Evasion and counterplay'), description: localized('通过交错站位提高全队闪避，高速角色获得额外优势。','交差した配置で全員の回避率を高め、高速キャラクターは追加効果を得る。','Staggered positions improve team evasion, with an extra benefit for fast characters.'), positions: [p('stagger-1','stagger',14,24),p('stagger-2','stagger',55,8),p('stagger-3','stagger',88,37),p('stagger-4','stagger',30,76),p('stagger-5','stagger',72,91)], effects: { team: { chancePp: { dodge: 0.05 }, statPct: { atk: -0.05 } }, conditions: { highSpeedDodgePp: 0.05 } } },
  { id: 'balanced-ring', name: localized('五环均衡阵','五環均衡陣','Balanced Ring'), role: localized('全能平衡','総合バランス','All-round balance'), description: localized('没有明显短板，适合普通关卡与挂机战斗。','大きな弱点がなく、通常ステージや放置戦闘に適している。','A well-rounded formation for regular stages and idle battles.'), positions: [p('ring-north','ring',50,5),p('ring-east','ring',92,50),p('ring-south-east','ring',75,90),p('ring-south-west','ring',25,90),p('ring-west','ring',8,50)], effects: { team: { statPct: { hp: 0.05, def: 0.05, mp: 0.10 }, chancePp: { critical: 0.03, dodge: 0.03 } } } },
];

export const FORMATION_MAP = Object.fromEntries(FORMATIONS.map((formation) => [formation.id, formation]));

function partySlots(party = []) {
  return Array.from({ length: FORMATION_SLOT_COUNT }, (_, index) => {
    const id = party[index];
    return typeof id === 'string' && id.length > 0 ? id : null;
  });
}

export function createDefaultFormationState(party = []) {
  const slots = partySlots(party);
  return { schemaVersion: FORMATION_SCHEMA_VERSION, activeFormationId: DEFAULT_FORMATION_ID, assignmentsByFormation: Object.fromEntries(FORMATIONS.map(({ id }) => [id, [...slots]])) };
}

export function normalizeFormationState(value, party = []) {
  const activeFormationId = FORMATION_MAP[value?.activeFormationId] ? value.activeFormationId : DEFAULT_FORMATION_ID;
  const currentParty = partySlots(party);
  const partySet = new Set(currentParty.filter(Boolean));
  const sourceAssignments = value?.assignmentsByFormation || {};
  const assignmentsByFormation = {};
  FORMATIONS.forEach(({ id }) => {
    const source = Array.isArray(sourceAssignments[id]) ? sourceAssignments[id] : [];
    const used = new Set();
    let fallbackIndex = 0;
    assignmentsByFormation[id] = Array.from({ length: FORMATION_SLOT_COUNT }, (_, index) => {
      const candidate = source[index];
      if (typeof candidate === 'string' && partySet.has(candidate) && !used.has(candidate)) { used.add(candidate); return candidate; }
      while (fallbackIndex < currentParty.length && (!currentParty[fallbackIndex] || used.has(currentParty[fallbackIndex]))) fallbackIndex += 1;
      const fallback = currentParty[fallbackIndex] || null;
      if (fallback) { used.add(fallback); fallbackIndex += 1; }
      return fallback;
    });
  });
  return { schemaVersion: FORMATION_SCHEMA_VERSION, activeFormationId, assignmentsByFormation };
}

export function setActiveFormation(value, formationId, party = []) {
  if (!FORMATION_MAP[formationId]) return value;
  const normalized = normalizeFormationState(value, party);
  if (normalized.activeFormationId === formationId) return value;
  return { ...normalized, activeFormationId: formationId };
}

export function setFormationPosition(value, formationId, positionIndex, cardId, party = []) {
  if (!FORMATION_MAP[formationId] || !Number.isInteger(positionIndex) || positionIndex < 0 || positionIndex >= FORMATION_SLOT_COUNT) return value;
  const normalized = normalizeFormationState(value, party);
  if (cardId !== null && (typeof cardId !== 'string' || !partySlots(party).includes(cardId))) return value;
  const assignments = [...normalized.assignmentsByFormation[formationId]];
  if (cardId === null) {
    if (assignments[positionIndex] === null) return value;
    assignments[positionIndex] = null;
  } else {
    const existingIndex = assignments.indexOf(cardId);
    if (existingIndex === positionIndex) return value;
    const displaced = assignments[positionIndex];
    if (existingIndex >= 0) assignments[existingIndex] = displaced;
    assignments[positionIndex] = cardId;
  }
  return { ...normalized, assignmentsByFormation: { ...normalized.assignmentsByFormation, [formationId]: assignments } };
}

export function getFormationDefinition(formationId) {
  return FORMATION_MAP[formationId] || null;
}

// Phase 3 Demo: only chance-based formation effects are connected to combat.
export function getFormationCombatBonuses(formationState, cardId, party = []) {
  const formation = FORMATION_MAP[formationState?.activeFormationId] || FORMATION_MAP[DEFAULT_FORMATION_ID];
  const assignments = formationState?.assignmentsByFormation?.[formation.id] || partySlots(party);
  const positionIndex = assignments.indexOf(cardId);
  const role = positionIndex >= 0 ? formation.positions[positionIndex]?.role : null;
  const team = formation.effects?.team?.chancePp || {};
  const position = role ? formation.effects?.positions?.[role]?.chancePp || {} : {};
  return {
    formationId: formation.id,
    formationName: formation.name,
    role,
    criticalPp: (Number(team.critical) || 0) + (Number(position.critical) || 0),
    desperateCritPp: (Number(team.desperateCrit) || 0) + (Number(position.desperateCrit) || 0),
    dodgePp: (Number(team.dodge) || 0) + (Number(position.dodge) || 0),
  };
}
