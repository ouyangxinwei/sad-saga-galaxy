// ===== Static master data for 悲伤沙加银河系 =====

export const RARITIES = ['C', 'B', 'A', 'S', 'SS'];
export const RARITY_NEXT = { A: 'S', S: 'SS' };

export function upgradedId(cardId, nextRarity) {
  return `up_${cardId}_${nextRarity}`;
}

export function upgradedName(name) {
  return { zh: `${name.zh} ★`, ja: `${name.ja} ★`, en: `${name.en} ★` };
}
export const RARITY_MULT = { C: 0.8, B: 1, A: 1.28, S: 1.68, SS: 2.15 };
export const RARITY_COLOR = { C: '#93A0B8', B: '#6FA8FF', A: '#9B8CFF', S: '#F07A9B', SS: '#E8C87A' };

export const CLASSES = [
  {
    id: 'sword',
    name: { zh: '剑士', ja: '剣士', en: 'Swordsman' },
    icon: 'Swords',
    stats: { hp: 1040, atk: 154, def: 88, spd: 96, mp: 90, crit: 0.12 },
    skills: ['slash', 'whirl'],
    ascend: { zh: '星刃宗师', ja: '星刃の宗師', en: 'Starblade Master' },
    passive: { zh: '连击本能：暴击率 +6%', ja: '連撃本能：会心率 +6%', en: 'Combo Instinct: +6% crit' },
  },
  {
    id: 'guardian',
    name: { zh: '守护者', ja: '守護者', en: 'Guardian' },
    icon: 'Shield',
    stats: { hp: 1480, atk: 108, def: 138, spd: 70, mp: 100, crit: 0.06 },
    skills: ['provoke', 'bulwark'],
    ascend: { zh: '不朽壁垒', ja: '不朽の壁', en: 'Eternal Bulwark' },
    passive: { zh: '钢铁意志：受到伤害 -8%', ja: '鋼の意志：被ダメージ -8%', en: 'Iron Will: -8% damage taken' },
  },
  {
    id: 'lancer',
    name: { zh: '枪骑', ja: '槍騎', en: 'Lancer' },
    icon: 'Sword',
    stats: { hp: 1160, atk: 162, def: 92, spd: 88, mp: 95, crit: 0.1 },
    skills: ['pierce', 'sweep'],
    ascend: { zh: '彗星枪圣', ja: '彗星の槍聖', en: 'Comet Lancer' },
    passive: { zh: '贯穿：无视 10% 防御', ja: '貫通：防御 10% 無視', en: 'Pierce: ignore 10% DEF' },
  },
  {
    id: 'archer',
    name: { zh: '弓师', ja: '弓師', en: 'Archer' },
    icon: 'Crosshair',
    stats: { hp: 920, atk: 178, def: 66, spd: 108, mp: 90, crit: 0.18 },
    skills: ['shot', 'rain'],
    ascend: { zh: '星辰游侠', ja: '星辰の遊侠', en: 'Astral Ranger' },
    passive: { zh: '鹰眼：暴击伤害 +20%', ja: '鷹の目：会心ダメージ +20%', en: 'Hawkeye: +20% crit damage' },
  },
  {
    id: 'mage',
    name: { zh: '术士', ja: '術士', en: 'Mage' },
    icon: 'Wand2',
    stats: { hp: 860, atk: 188, def: 62, spd: 92, mp: 130, crit: 0.1 },
    skills: ['bolt', 'nova'],
    ascend: { zh: '虚数贤者', ja: '虚数の賢者', en: 'Void Sage' },
    passive: { zh: '奥义增幅：技能伤害 +10%', ja: '奥義増幅：スキル +10%', en: 'Arcane Amp: +10% skill damage' },
  },
  {
    id: 'priest',
    name: { zh: '僧侣', ja: '僧侶', en: 'Priest' },
    icon: 'Sun',
    stats: { hp: 1020, atk: 126, def: 78, spd: 86, mp: 140, crit: 0.06 },
    skills: ['mend', 'sanctuary'],
    ascend: { zh: '悲悯圣者', ja: '悲憫の聖者', en: 'Saint of Sorrow' },
    passive: { zh: '生命回响：治疗量 +12%', ja: '生命の響き：回復 +12%', en: 'Life Echo: +12% healing' },
  },
  {
    id: 'rogue',
    name: { zh: '斥候', ja: '斥候', en: 'Scout' },
    icon: 'Eye',
    stats: { hp: 900, atk: 184, def: 62, spd: 122, mp: 95, crit: 0.24 },
    skills: ['assassin', 'shadow'],
    ascend: { zh: '无声之影', ja: '無音の影', en: 'Silent Shade' },
    passive: { zh: '暗袭：先手时伤害 +15%', ja: '暗襲：先手 +15%', en: 'Ambush: +15% damage when acting first' },
  },
  {
    id: 'alchemist',
    name: { zh: '炼金师', ja: '錬金師', en: 'Alchemist' },
    icon: 'FlaskConical',
    stats: { hp: 1060, atk: 138, def: 88, spd: 84, mp: 125, crit: 0.08 },
    skills: ['elixir', 'acid'],
    ascend: { zh: '万象熔解者', ja: '万象の熔解者', en: 'Panacea Melter' },
    passive: { zh: '催化：全队治疗 +6%', ja: '触媒：全隊回復 +6%', en: 'Catalyst: +6% party healing' },
  },
  {
    id: 'stargazer',
    name: { zh: '星灵使', ja: '星霊使', en: 'Stargazer' },
    icon: 'Star',
    stats: { hp: 960, atk: 168, def: 74, spd: 100, mp: 120, crit: 0.12 },
    skills: ['ward', 'meteor'],
    ascend: { zh: '银河观测者', ja: '銀河の観測者', en: 'Galaxy Watcher' },
    passive: { zh: '星轨：全队减伤 +5%', ja: '星軌：全隊軽減 +5%', en: 'Star Orbit: +5% party mitigation' },
  },
];
export const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

export const SKILLS = {
  slash: { name: { zh: '裂空斩', ja: '裂空斬', en: 'Skyrend Slash' }, kind: 'attack', target: 'single', power: 1.5, mp: 0 },
  whirl: { name: { zh: '回旋风暴', ja: '旋風嵐', en: 'Whirlstorm' }, kind: 'attack', target: 'all', power: 0.8, mp: 34 },
  pierce: { name: { zh: '贯星突刺', ja: '貫星突き', en: 'Star Pierce' }, kind: 'attack', target: 'single', power: 1.55, mp: 12, pierce: 0.2 },
  sweep: { name: { zh: '横扫千军', ja: '掃討', en: 'Wide Sweep' }, kind: 'attack', target: 'all', power: 0.82, mp: 32 },
  shot: { name: { zh: '星矢', ja: '星の矢', en: 'Star Arrow' }, kind: 'attack', target: 'single', power: 1.52, mp: 0 },
  rain: { name: { zh: '箭雨', ja: '矢の雨', en: 'Arrow Rain' }, kind: 'attack', target: 'all', power: 0.76, mp: 30 },
  bolt: { name: { zh: '苍蓝雷击', ja: '蒼雷', en: 'Azure Bolt' }, kind: 'attack', target: 'single', power: 1.62, mp: 14 },
  nova: { name: { zh: '新星爆发', ja: 'ノヴァ', en: 'Nova Burst' }, kind: 'attack', target: 'all', power: 0.86, mp: 38 },
  meteor: { name: { zh: '陨星坠落', ja: '隕星', en: 'Meteor Fall' }, kind: 'attack', target: 'all', power: 0.95, mp: 42 },
  assassin: { name: { zh: '无音刺杀', ja: '無音の刺殺', en: 'Silent Kill' }, kind: 'attack', target: 'single', power: 1.72, mp: 16, critBonus: 0.25 },
  shadow: { name: { zh: '影分身', ja: '影分身', en: 'Shadow Split' }, kind: 'attack', target: 'single', power: 1.1, mp: 10, hits: 2 },
  mend: { name: { zh: '愈合之光', ja: '癒しの光', en: 'Mending Light' }, kind: 'support', target: 'single', heal: 2.6, mp: 16 },
  sanctuary: { name: { zh: '圣域祈愿', ja: '聖域の祈り', en: 'Sanctuary' }, kind: 'support', target: 'all', heal: 1.15, mp: 38 },
  elixir: { name: { zh: '随机万灵药', ja: '万霊薬', en: 'Erratic Elixir' }, kind: 'support', target: 'random', heal: 1.8, mp: 26, targets: 2 },
  provoke: { name: { zh: '钢铁嘲讽', ja: '鋼の挑発', en: 'Iron Taunt' }, kind: 'defense', target: 'self', shield: 0.3, taunt: 2, mp: 16 },
  bulwark: { name: { zh: '壁垒护盾', ja: '防壁シールド', en: 'Bulwark Shield' }, kind: 'defense', target: 'ally', shield: 0.55, mp: 22 },
  ward: { name: { zh: '星轨守护', ja: '星軌の守り', en: 'Star Ward' }, kind: 'defense', target: 'ally', mitigate: 0.3, turns: 3, mp: 30 },
  acid: { name: { zh: '腐蚀药剂', ja: '腐食薬', en: 'Acid Flask' }, kind: 'attack', target: 'all', power: 0.7, mp: 28 },
  claw: { name: { zh: '撕裂', ja: '引裂', en: 'Rend' }, kind: 'attack', target: 'single', power: 1.4, mp: 0 },
  howl: { name: { zh: '虚空咆哮', ja: '虚空の咆哮', en: 'Void Howl' }, kind: 'attack', target: 'all', power: 0.66, mp: 30 },
  crush: { name: { zh: '碎星重击', ja: '砕星重撃', en: 'Star Crush' }, kind: 'attack', target: 'single', power: 1.8, mp: 20 },
};

const hero = (id, zh, ja, en, classId, gender, rarity) => ({
  id,
  name: { zh, ja, en },
  classId,
  gender,
  rarity,
});

export const HEROES = [
  hero('lise', '莉瑟', 'リセ', 'Lise', 'sword', 'female', 'B'),
  hero('kain', '卡恩', 'カイン', 'Kain', 'guardian', 'male', 'B'),
  hero('shera', '雪拉', 'シェラ', 'Shera', 'priest', 'female', 'B'),
  hero('rook', '洛克', 'ローク', 'Rook', 'archer', 'male', 'B'),
  hero('nia', '妮娅', 'ニア', 'Nia', 'rogue', 'female', 'B'),
  hero('gale', '疾风', 'ゲイル', 'Gale', 'lancer', 'male', 'A'),
  hero('mira', '米拉', 'ミラ', 'Mira', 'mage', 'female', 'A'),
  hero('orin', '奥林', 'オリン', 'Orin', 'alchemist', 'male', 'A'),
  hero('selene', '塞勒涅', 'セレネ', 'Selene', 'stargazer', 'female', 'A'),
  hero('varg', '瓦格', 'ヴァルグ', 'Varg', 'sword', 'male', 'A'),
  hero('yukie', '雪绘', 'ユキエ', 'Yukie', 'priest', 'female', 'A'),
  hero('zeth', '泽斯', 'ゼス', 'Zeth', 'rogue', 'male', 'S'),
  hero('aria', '阿莉娅', 'アリア', 'Aria', 'stargazer', 'female', 'S'),
  hero('brutus', '布鲁图', 'ブルートゥス', 'Brutus', 'guardian', 'male', 'S'),
  hero('lyra', '莱拉', 'ライラ', 'Lyra', 'archer', 'female', 'S'),
  hero('iku', '伊库', 'イク', 'Iku', 'alchemist', 'male', 'S'),
  hero('novis', '诺维斯', 'ノヴィス', 'Novis', 'mage', 'male', 'SS'),
  hero('astra', '阿斯特拉', 'アストラ', 'Astra', 'stargazer', 'female', 'SS'),
  hero('kuroha', '黑羽', 'クロハ', 'Kuroha', 'sword', 'female', 'SS'),
  hero('elys', '艾莉丝', 'エリス', 'Elys', 'priest', 'female', 'SS'),
];

export const DEFAULT_UNLOCKED = ['lise', 'kain', 'shera', 'rook', 'nia'];

export const MONSTER_TYPES = [
  { id: 'beast', name: { zh: '兽族', ja: '獣族', en: 'Beast' }, icon: 'PawPrint' },
  { id: 'wraith', name: { zh: '亡魂', ja: '亡魂', en: 'Wraith' }, icon: 'Ghost' },
  { id: 'machine', name: { zh: '机骸', ja: '機骸', en: 'Machine' }, icon: 'Bot' },
  { id: 'dragon', name: { zh: '龙裔', ja: '竜裔', en: 'Dragon' }, icon: 'Flame' },
  { id: 'insect', name: { zh: '虫群', ja: '蟲群', en: 'Insect' }, icon: 'Bug' },
  { id: 'abyss', name: { zh: '深溟', ja: '深溟', en: 'Abyss' }, icon: 'Waves' },
  { id: 'angel', name: { zh: '堕天', ja: '堕天', en: 'Fallen' }, icon: 'Feather' },
  { id: 'demon', name: { zh: '魔人', ja: '魔人', en: 'Demon' }, icon: 'Skull' },
  { id: 'core', name: { zh: '星核', ja: '星核', en: 'Star Core' }, icon: 'Orbit' },
];
export const TYPE_MAP = Object.fromEntries(MONSTER_TYPES.map((t) => [t.id, t]));

const enemy = (id, zh, ja, en, type, rarity, skill) => ({ id, name: { zh, ja, en }, type, rarity, skill });

export const ENEMIES = [
  enemy('starfang', '星牙兽', 'スターファング', 'Starfang', 'beast', 'B', 'claw'),
  enemy('abysswolf', '渊狼', 'アビスウルフ', 'Abysswolf', 'beast', 'A', 'claw'),
  enemy('silvermoon', '银月兽', 'シルバームーン', 'Silvermoon Beast', 'beast', 'S', 'howl'),
  enemy('wailing', '哀哭亡魂', 'ウィーピング', 'Wailing Wraith', 'wraith', 'B', 'claw'),
  enemy('husk', '虚数亡骸', 'イマジナリー', 'Imaginary Husk', 'wraith', 'A', 'howl'),
  enemy('faceless', '无面幽影', 'フェイスレス', 'Faceless Shade', 'wraith', 'S', 'crush'),
  enemy('gear', '齿轮傀儡', 'ギアゴーレム', 'Gear Golem', 'machine', 'B', 'claw'),
  enemy('judge', '断罪机兵', 'ジャッジ', 'Judgment Unit', 'machine', 'A', 'crush'),
  enemy('drake', '鳞龙', 'スケイルドレイク', 'Scaled Drake', 'dragon', 'A', 'howl'),
  enemy('eclipse', '蚀天龙', 'エクリプス', 'Eclipse Wyrm', 'dragon', 'SS', 'crush'),
  enemy('starant', '群星蚁', 'スターミート', 'Star Ant', 'insect', 'C', 'claw'),
  enemy('voidwasp', '虚空蜂', 'ヴォイドワスプ', 'Void Wasp', 'insect', 'B', 'claw'),
  enemy('tentacle', '深溟触手', 'アビスタコル', 'Abyss Tentacle', 'abyss', 'A', 'howl'),
  enemy('sunken', '沉没圣者', 'ダイバー', 'Sunken Saint', 'abyss', 'S', 'crush'),
  enemy('fallen', '堕天骑士', 'フォールン', 'Fallen Knight', 'angel', 'S', 'crush'),
  enemy('seraph', '断翼炽天使', 'セラフ', 'Broken Seraph', 'angel', 'SS', 'howl'),
  enemy('ashdemon', '灰烬魔人', 'アッシュデーモン', 'Ash Demon', 'demon', 'A', 'claw'),
  enemy('sorrowking', '悲叹魔王', 'サローキング', 'Sorrow King', 'demon', 'SS', 'crush'),
  enemy('corefrag', '星核碎片', 'コアフラグメント', 'Core Fragment', 'core', 'B', 'claw'),
  enemy('sorrowcore', '悲叹星核', 'サローコア', 'Sorrow Core', 'core', 'SS', 'howl'),
];
export const ENEMY_MAP = Object.fromEntries(ENEMIES.map((e) => [e.id, e]));

const ENEMY_ARCH = {
  beast: { hp: 1000, atk: 148, def: 70, spd: 108 },
  wraith: { hp: 940, atk: 156, def: 62, spd: 100 },
  machine: { hp: 1300, atk: 132, def: 118, spd: 74 },
  dragon: { hp: 1450, atk: 168, def: 104, spd: 82 },
  insect: { hp: 820, atk: 128, def: 58, spd: 124 },
  abyss: { hp: 1180, atk: 158, def: 86, spd: 90 },
  angel: { hp: 1120, atk: 172, def: 88, spd: 104 },
  demon: { hp: 1240, atk: 180, def: 92, spd: 96 },
  core: { hp: 1500, atk: 164, def: 110, spd: 88 },
};

export function classStats(classId, rarity) {
  const base = CLASS_MAP[classId].stats;
  const m = RARITY_MULT[rarity] || 1;
  return {
    hp: Math.round(base.hp * m),
    atk: Math.round(base.atk * m),
    def: Math.round(base.def * m),
    spd: Math.round(base.spd * (0.94 + m * 0.06)),
    mp: base.mp,
    crit: base.crit,
  };
}

export function heroStats(h) {
  return classStats(h.classId, h.rarity);
}

export function enemyStats(e, scale = 1) {
  const arch = ENEMY_ARCH[e.type] || ENEMY_ARCH.beast;
  const m = (RARITY_MULT[e.rarity] || 1) * 0.92 * scale;
  return {
    hp: Math.round(arch.hp * m),
    atk: Math.round(arch.atk * m),
    def: Math.round(arch.def * m),
    spd: Math.round(arch.spd * (0.9 + scale * 0.1)),
    mp: 100,
    crit: 0.08,
  };
}

// ===== Stages: 3 modes × 100 = 300, boss every 5th =====
export const STAGES_PER_MODE = 100;
export const MODES = [
  { id: 'normal', name: { zh: '普通', ja: 'ノーマル', en: 'Normal' }, mult: 1, tint: '#8B9DFF' },
  { id: 'hard', name: { zh: '困难', ja: 'ハード', en: 'Hard' }, mult: 1.28, tint: '#E8A05C' },
  { id: 'nightmare', name: { zh: '特别难', ja: 'ナイトメア', en: 'Nightmare' }, mult: 1.66, tint: '#F0748F' },
];
export const MODE_MAP = Object.fromEntries(MODES.map((m, i) => [m.id, { ...m, index: i }]));
export const TOTAL_STAGES = MODES.length * STAGES_PER_MODE;

const ENEMY_ORDER = ['C', 'B', 'A', 'S', 'SS'];
const ENEMY_LADDER = [...ENEMIES].sort(
  (a, b) => ENEMY_ORDER.indexOf(a.rarity) - ENEMY_ORDER.indexOf(b.rarity),
);

export function getStage(mode, n) {
  const modeDef = MODE_MAP[mode] || MODE_MAP.normal;
  const tier = modeDef.index * STAGES_PER_MODE + n - 1;
  const boss = n % 5 === 0;
  const scale = (0.8 + tier * 0.048) * modeDef.mult;
  const count = boss ? 3 : n % 3 === 0 ? 3 : 2;
  const poolSize = Math.min(ENEMY_LADDER.length, 3 + Math.floor(tier / 4));
  const enemies = [];
  for (let i = 0; i < count; i += 1) {
    let picked;
    if (boss && i === 0) {
      const start = Math.min(ENEMY_LADDER.length - 3, 4 + Math.floor(tier / 8));
      const bossPool = ENEMY_LADDER.slice(start, start + 4);
      picked = bossPool[(tier + n) % bossPool.length];
    } else {
      picked = ENEMY_LADDER[(tier * 5 + i * 7 + 3) % poolSize];
    }
    enemies.push({ enemyId: picked.id, scale });
  }
  return {
    mode,
    n,
    tier,
    boss,
    chapter: Math.ceil(n / 5),
    scale,
    enemies,
    power: Math.round(5200 * scale),
    gold: Math.round((70 + tier * 11) * (boss ? 2 : 1)),
    exp: Math.round((48 + tier * 9) * (boss ? 1.6 : 1)),
    gems: boss ? 12 + modeDef.index * 8 : 0,
    shards: boss ? 2 : 1,
  };
}

export function stageLabel(mode, n) {
  return `${mode === 'normal' ? '' : mode === 'hard' ? 'H ' : 'N '}${n}`;
}

export const TOWER_STAGE = (floor) => {
  const tier = 120 + floor * 4;
  const scale = 5.2 + floor * 0.55;
  const idx = 15 + (floor % 5);
  return {
    mode: 'tower',
    n: floor,
    tier,
    boss: true,
    chapter: floor,
    scale,
    enemies: [
      { enemyId: ENEMIES[idx].id, scale },
      { enemyId: ENEMIES[(idx + 4) % 20].id, scale: scale * 0.85 },
      { enemyId: ENEMIES[(idx + 2) % 20].id, scale: scale * 0.85 },
    ],
    power: Math.round(5200 * scale),
    gold: Math.round(600 + floor * 120),
    exp: Math.round(500 + floor * 90),
    gems: 40 + floor * 6,
    shards: 2,
  };
};

export const EVENT_STAGE = {
  mode: 'event',
  n: 1,
  tier: 160,
  boss: true,
  chapter: 1,
  scale: 7.4,
  enemies: [
    { enemyId: 'sorrowcore', scale: 7.4 },
    { enemyId: 'seraph', scale: 5.6 },
  ],
  power: Math.round(5200 * 7.4),
  gold: 2600,
  exp: 2200,
  gems: 120,
  shards: 3,
  medal: 8,
};

// ===== Progression / economy =====
export const expNeed = (level) => Math.round(70 + level * 26 + level * level * 0.9);
export const levelCap = (rebirth) => 1000 + rebirth * 200;

export const CHECKIN = [
  { gold: 800, gems: 0, tickets: 0 },
  { gold: 0, gems: 120, tickets: 0 },
  { gold: 0, gems: 0, tickets: 1 },
  { gold: 1600, gems: 0, tickets: 0 },
  { gold: 0, gems: 220, tickets: 0 },
  { gold: 0, gems: 0, tickets: 2 },
  { gold: 0, gems: 600, tickets: 3 },
];

export const FORTUNES = [
  { id: 'star', name: { zh: 'ⅩⅦ 星', ja: 'ⅩⅦ 星', en: 'XVII The Star' }, effect: { atk: 0.08 }, text: { zh: '希望之光：全队攻击 +8%', ja: '希望の光：全隊攻撃 +8%', en: 'Light of hope: +8% party ATK' } },
  { id: 'moon', name: { zh: 'ⅩⅧ 月', ja: 'ⅩⅧ 月', en: 'XVIII The Moon' }, effect: { hp: 0.1 }, text: { zh: '深海的梦：全队 HP +10%', ja: '深海の夢：全隊 HP +10%', en: 'Dream of the deep: +10% party HP' } },
  { id: 'sun', name: { zh: 'ⅩⅨ 太阳', ja: 'ⅩⅨ 太陽', en: 'XIX The Sun' }, effect: { heal: 0.15 }, text: { zh: '不落的辉光：治疗量 +15%', ja: '不落の輝き：回復 +15%', en: 'Undying radiance: +15% healing' } },
  { id: 'tower', name: { zh: 'ⅩⅥ 高塔', ja: 'ⅩⅥ 塔', en: 'XVI The Tower' }, effect: { crit: 0.06 }, text: { zh: '崩落的宿命：暴击率 +6%', ja: '崩落の宿命：会心率 +6%', en: 'Falling fate: +6% crit' } },
  { id: 'justice', name: { zh: 'Ⅺ 正义', ja: 'Ⅺ 正義', en: 'XI Justice' }, effect: { def: 0.12 }, text: { zh: '天秤的裁决：全队减伤 +12%', ja: '天秤の裁き：軽減 +12%', en: 'Verdict of scales: +12% mitigation' } },
  { id: 'hanged', name: { zh: 'Ⅻ 吊人', ja: 'Ⅻ 吊られた男', en: 'XII The Hanged Man' }, effect: { spd: 0.1 }, text: { zh: '静默的献祭：全队速度 +10%', ja: '静寂の献身：速度 +10%', en: 'Silent offering: +10% SPD' } },
];

export const RELICS = [
  { id: 'r_sword', name: { zh: '星刃残片', ja: '星刃の残片', en: 'Starblade Shard' }, atk: 0.12, hp: 0, spd: 0, cost: 400, icon: 'Swords' },
  { id: 'r_aegis', name: { zh: '悲叹之盾', ja: '悲嘆の盾', en: 'Shield of Sorrow' }, atk: 0, hp: 0.18, def: 0.1, cost: 400, icon: 'Shield' },
  { id: 'r_wing', name: { zh: '银河之翼', ja: '銀河の翼', en: 'Galactic Wing' }, atk: 0.06, hp: 0.06, spd: 0.12, cost: 700, icon: 'Feather' },
  { id: 'r_orb', name: { zh: '星核宝珠', ja: '星核の珠', en: 'Core Orb' }, atk: 0.2, hp: 0.1, spd: 0, cost: 1100, icon: 'Orbit' },
  { id: 'r_crown', name: { zh: '旧王冠冕', ja: '旧王の冠', en: 'Crown of Old Kings' }, atk: 0.16, hp: 0.2, def: 0.08, cost: 1600, icon: 'Crown' },
  { id: 'r_tear', name: { zh: '星海之泪', ja: '星海の涙', en: 'Tear of the Star Sea' }, atk: 0.1, hp: 0.26, spd: 0.06, cost: 2000, icon: 'Gem' },
];

export const BOUNTY_TEMPLATES = [
  { id: 'b_rogue', classId: 'rogue', minutes: 25, name: { zh: '夜色信使', ja: '夜色の使者', en: 'Night Courier' }, rewards: { gold: 900, exp: 520, shards: 1 } },
  { id: 'b_priest', classId: 'priest', minutes: 40, name: { zh: '废墟祝祷', ja: '廃墟の祈り', en: 'Ruin Benediction' }, rewards: { gold: 1200, exp: 640, shards: 1 } },
  { id: 'b_mage', classId: 'mage', minutes: 60, name: { zh: '遗迹解咒', ja: '遺跡の解呪', en: 'Ruin Unbinding' }, rewards: { gold: 1500, exp: 900, shards: 2 } },
  { id: 'b_guardian', classId: 'guardian', minutes: 90, name: { zh: '商队护卫', ja: '隊商の護衛', en: 'Caravan Escort' }, rewards: { gold: 2200, exp: 1200, shards: 2 } },
  { id: 'b_archer', classId: 'archer', minutes: 50, name: { zh: '边境狩猎', ja: '辺境の狩り', en: 'Frontier Hunt' }, rewards: { gold: 1400, exp: 780, shards: 2 } },
  { id: 'b_sword', classId: 'sword', minutes: 70, name: { zh: '陨星讨伐', ja: '隕星討伐', en: 'Meteor Subjugation' }, rewards: { gold: 1800, exp: 1000, shards: 2 } },
];
export const BOUNTY_MAP = Object.fromEntries(BOUNTY_TEMPLATES.map((b) => [b.id, b]));

export const CHANGELOG = [
  {
    version: 'v0.21',
    title: { zh: '第二十一稿：卡牌融合', ja: '第 21 版：カード融合', en: 'v21: Card fusion' },
    items: {
      zh: [
        '同一类型 3 张 A 卡可融合为 1 张 S 卡',
        '同一类型 3 张 S 卡可融合为 1 张 SS 卡',
        '融合消耗原有 3 张卡牌，不同类型无法混合',
        '卡牌图鉴新增融合入口',
        '首页新增版本按钮，可查看历次改版内容',
      ],
      ja: [
        '同型の A カード 3 枚を S カード 1 枚に融合',
        '同型の S カード 3 枚を SS カード 1 枚に融合',
        '融合は元の 3 枚を消費、型違いの混合は不可',
        'カード図鑑に融合入口を追加',
        'ホームにバージョンボタンを追加し更新履歴を表示',
      ],
      en: [
        'Fuse 3 A cards of the same type into 1 S card',
        'Fuse 3 S cards of the same type into 1 SS card',
        'Fusion consumes the 3 originals; types cannot be mixed',
        'Added a fusion entry to the card gallery',
        'Added a version button on home to review every patch',
      ],
    },
  },
  {
    version: 'v0.20',
    title: { zh: '第二十稿：首页重构', ja: '第 20 版：ホーム再構築', en: 'v20: Home rebuild' },
    items: {
      zh: ['新增签到与成就悬浮窗、红点提示', '新增战术快捷布阵与一键最强战力', '新增冒险者酒馆随机悬赏看板', '首页四大区域排版定稿'],
      ja: ['ログイン・実績ウィンドウと通知ドットを追加', '戦術クイック編成と最強自動編成を追加', '冒険者酒場のランダム懸賞を追加', 'ホーム四大区域のレイアウト確定'],
      en: ['Added daily & milestone popovers with red dots', 'Added tactical squad panel and auto-best', 'Added tavern random bounty board', 'Finalized the four-region home layout'],
    },
  },
  {
    version: 'v0.19',
    title: { zh: '第十九稿：LP 复活机制', ja: '第 19 版：LP 復活', en: 'v19: LP revival' },
    items: {
      zh: ['每张卡牌 6 点 LP，阵亡可被复活', '复活消耗施法者与目标各 1 点 LP', 'LP 归零后永久死亡', '新增单体/群体/随机回复三类辅助技能'],
      ja: ['各カードに LP 6 点、戦闘不能から復活可能', '復活は術者と対象の LP を 1 ずつ消費', 'LP 0 で永久離脱', '単体・全体・ランダム回復を追加'],
      en: ['Every card has 6 LP and can be revived', 'Revival costs 1 LP from caster and target', 'LP 0 means permanent death', 'Added single / party / random heals'],
    },
  },
  {
    version: 'v0.18',
    title: { zh: '第十八稿：转生与图鉴', ja: '第 18 版：転生と図鑑', en: 'v18: Rebirth & codex' },
    items: {
      zh: ['1000 级满级开放转生与进阶职业', '转生提升等级上限与全队基础属性', '新增我方/敌方图鉴与里程碑奖励', '5 碎片合成 1 卡，敌方碎片可逆向转化'],
      ja: ['Lv1000 で転生・上位職を開放', '転生で上限と全隊基礎値が上昇', '味方/敵図鑑とマイルストーン報酬を追加', '欠片 5 個で 1 枚、敵欠片は味方へ転化'],
      en: ['Rebirth at Lv1000 unlocks advanced classes', 'Rebirth raises level cap and party stats', 'Added ally/enemy codex with milestones', '5 shards fuse a card; enemy shards convert'],
    },
  },
];

export const MILESTONES = [
  { at: 5, gems: 300 },
  { at: 10, gems: 600 },
  { at: 15, gems: 1000 },
  { at: 20, gems: 2000 },
];

export const SHOP_ITEMS = [
  { id: 'stamina', name: 'shop.stamina', cost: 100, icon: 'BatteryFull' },
  { id: 'ticket', name: 'shop.ticket', cost: 80, icon: 'Ticket' },
];

export const GACHA_RATES = { SS: 0.01, S: 0.08, A: 0.21, B: 0.7 };
export const PULL_COST = { one: 1, ten: 10 };

export function pickRarity() {
  const r = Math.random();
  let acc = 0;
  for (const key of ['SS', 'S', 'A', 'B']) {
    acc += GACHA_RATES[key];
    if (r <= acc) return key;
  }
  return 'B';
}

export function heroesOfRarity(rarity) {
  return HEROES.filter((h) => h.rarity === rarity);
}

export function pickHero(rarity) {
  const pool = heroesOfRarity(rarity);
  if (!pool.length) return HEROES[Math.floor(Math.random() * HEROES.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const ASCEND_CLASSES = CLASSES.map((c) => ({
  id: `${c.id}_asc`,
  baseId: c.id,
  name: c.ascend,
  icon: c.icon,
  passive: c.passive,
  stats: c.stats,
  skills: c.skills,
}));
export const ASCEND_MAP = Object.fromEntries(ASCEND_CLASSES.map((c) => [c.id, c]));

export function classOf(classId) {
  return CLASS_MAP[classId] || ASCEND_MAP[classId] || CLASS_MAP.sword;
}

export function convertClassFor(type) {
  const map = {
    beast: 'lancer',
    wraith: 'rogue',
    machine: 'guardian',
    dragon: 'sword',
    insect: 'archer',
    abyss: 'mage',
    angel: 'priest',
    demon: 'stargazer',
    core: 'alchemist',
  };
  return map[type] || 'sword';
}