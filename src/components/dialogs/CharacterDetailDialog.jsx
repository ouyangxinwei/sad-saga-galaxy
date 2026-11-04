import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import CardTile from '@/components/common/CardTile';
import { GoldButton, GhostButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { SKILLS, classOf } from '@/lib/gameData';
import { cardStats, characterStatBreakdown, relicOf } from '@/lib/cards';
import { getDesperateCombatRates } from '@/lib/desperateCombat';
import { characterBreakthroughCost, characterBreakthroughReward, characterExpNeed, getCharacterBreakthroughBonuses, strongestCharacterInstance } from '@/lib/characterProgression';
import { fmt } from '@/lib/format';

const LABELS = {
  zh: { breakthrough: '角色突破', breakthroughCount: '突破次数', exp: '经验', expStored: '已储存经验', expRemaining: '距离升级还需', expStoredHint: '突破提高等级上限后将自动结算储存经验', shards: '角色碎片', gold: '金币', breakthroughNeedMax: '角色达到当前等级上限后才能突破', breakthroughNeedMaterials: '突破材料不足', breakthroughSuccess: '角色突破成功', doBreakthrough: '突破（等级上限 +10）', level: '等级', power: '战力', hp: '最大 HP', mp: '最大 MP', stats: '基础属性', atk: '攻击', def: '防御', spd: '速度', crit: '暴击率', desperateCombat: '绝境战斗能力', desperateCrit: '绝境暴击率', desperateDodge: '危机闪避率', desperateCombatNote: 'HP 低于 20% 时有概率造成三倍伤害；HP 低于 10% 时有概率完全闪避敌方直接攻击。概率根据角色初始能力计算并固定。', equipment: '装备', none: '尚未装备遗物', skills: '主动技能', passive: '职业被动', target: '目标', cost: 'MP 消耗', attack: '攻击', support: '辅助', defense: '防御', single: '单体', all: '全体', self: '自身', ally: '友方', random: '随机', note: 'HP / MP 显示角色自身最大值；全队等级加成单独显示，并在战斗中统一应用。', effectPower: '倍率', effectHeal: '治疗', effectShield: '护盾', effectMitigate: '减伤', effectPierce: '无视防御', effectCrit: '暴击加成', effectHits: '连击', effectTargets: '目标数', effectTaunt: '嘲讽', turns: '回合', place: '编入当前选中位置', openForge: '前往装备管理', equipped: '装备中', sourceTitle: '属性来源', mainLevel: '主角等级', teamBonus: '全队等级加成', careerGrowth: '职业成长', breakthroughReward: '突破奖励（累计）', equipmentBonus: '装备加成', nextReward: '下次突破奖励预览', nextCap: '突破后等级上限', critShort: '暴击' },
  ja: { breakthrough: 'キャラクター突破', breakthroughCount: '突破回数', exp: '経験値', expStored: '保存経験値', expRemaining: '次のレベルまで', expStoredHint: '突破で上限を上げると保存経験値を自動反映', shards: 'キャラの欠片', gold: 'ゴールド', breakthroughNeedMax: '現在のレベル上限に到達すると突破できます', breakthroughNeedMaterials: '突破素材が不足しています', breakthroughSuccess: 'キャラクター突破成功', doBreakthrough: '突破（上限 +10）', level: 'レベル', power: '戦力', hp: '最大 HP', mp: '最大 MP', stats: '基本ステータス', atk: '攻撃', def: '防御', spd: '速度', crit: '会心率', desperateCombat: '窮地戦闘能力', desperateCrit: '窮地クリティカル率', desperateDodge: '危機回避率', desperateCombatNote: 'HP が 20% 未満のとき攻撃が 3 倍になる可能性があります。HP が 10% 未満のとき敵の直接攻撃を完全回避する可能性があります。確率は初期能力に基づき固定されます。', equipment: '装備', none: '遺物未装備', skills: 'アクティブスキル', passive: '職業パッシブ', target: '対象', cost: 'MP 消費', attack: '攻撃', support: '支援', defense: '防御', single: '単体', all: '全体', self: '自身', ally: '味方', random: 'ランダム', note: 'HP / MP はキャラクター自身の最大値です。全体レベル補正は別表示され、戦闘中に全員へ適用されます。', effectPower: '倍率', effectHeal: '回復', effectShield: 'シールド', effectMitigate: 'ダメージ軽減', effectPierce: '防御無視', effectCrit: '会心補正', effectHits: '連撃', effectTargets: '対象数', effectTaunt: '挑発', turns: 'ターン', place: '選択中の枠に編成', openForge: '装備管理へ', equipped: '装備中', sourceTitle: '能力値の内訳', mainLevel: '主人公レベル', teamBonus: '全体レベル補正', careerGrowth: '職業成長', breakthroughReward: '突破報酬（累計）', equipmentBonus: '装備補正', nextReward: '次回突破報酬プレビュー', nextCap: '突破後レベル上限', critShort: '会心' },
  en: { breakthrough: 'Character Breakthrough', breakthroughCount: 'Breakthroughs', exp: 'EXP', expStored: 'Stored EXP', expRemaining: 'EXP to next level', expStoredHint: 'Stored EXP is applied automatically after breakthrough', shards: 'Character shards', gold: 'Gold', breakthroughNeedMax: 'Reach the current level cap to break through', breakthroughNeedMaterials: 'Not enough breakthrough materials', breakthroughSuccess: 'Character breakthrough complete', doBreakthrough: 'Break through (+10 cap)', level: 'Level', power: 'Power', hp: 'Max HP', mp: 'Max MP', stats: 'Attributes', atk: 'ATK', def: 'DEF', spd: 'SPD', crit: 'Crit Rate', desperateCombat: 'Desperate Combat Traits', desperateCrit: 'Desperate Crit Rate', desperateDodge: 'Desperate Dodge Rate', desperateCombatNote: 'Below 20% HP, attacks may deal triple damage. Below 10% HP, direct enemy attacks may be fully dodged. Rates are based on initial character stats and remain fixed.', equipment: 'Equipment', none: 'No relic equipped', skills: 'Active Skills', passive: 'Class Passive', target: 'Target', cost: 'MP cost', attack: 'Attack', support: 'Support', defense: 'Defense', single: 'Single', all: 'All', self: 'Self', ally: 'Ally', random: 'Random', note: 'HP / MP show the character’s own maximum values. The teamwide level bonus is shown separately and applied to all allies in battle.', effectPower: 'Power', effectHeal: 'Heal', effectShield: 'Shield', effectMitigate: 'Mitigation', effectPierce: 'DEF ignore', effectCrit: 'Crit bonus', effectHits: 'Hits', effectTargets: 'Targets', effectTaunt: 'Taunt', turns: 'turns', place: 'Place in selected slot', openForge: 'Open equipment manager', equipped: 'Equipped', sourceTitle: 'Stat Sources', mainLevel: 'Main character level', teamBonus: 'Teamwide level bonus', careerGrowth: 'Career growth', breakthroughReward: 'Breakthrough rewards (total)', equipmentBonus: 'Equipment bonuses', nextReward: 'Next breakthrough preview', nextCap: 'Level cap after breakthrough', critShort: 'Crit' },
};
const percent = (value) => `${Math.round(value * 100)}%`;
const precisePercent = (value) => `${(value * 100).toFixed(1)}%`;

export default function CharacterDetailDialog({ cardId, open, onClose, onPlace, onOpenForge }) {
  const game = useGame();
  const { lang, defOf, powerOf, actions } = game;
  const L = LABELS[lang] || LABELS.zh;
  const def = cardId ? defOf(cardId) : null;
  if (!def) return null;

  const cls = classOf(def.classId);
  const stats = cardStats(game, cardId);
  const desperateRates = getDesperateCombatRates(cardId, def);
  const breakdown = characterStatBreakdown(game, cardId);
  const relic = relicOf(game, cardId);
  const skills = (def.skills || cls.skills || []).map((id) => ({ id, skill: SKILLS[id] })).filter((x) => x.skill);
  const progressionEntry = strongestCharacterInstance(game, cardId);
  const progression = progressionEntry?.[1] || null;
  const breakthroughCost = characterBreakthroughCost(progression?.breakthroughCount || 0);
  const nextBreakthroughReward = characterBreakthroughReward(def.classId);
  const totalBreakthroughReward = getCharacterBreakthroughBonuses(progression, def.classId);
  const expRequired = progression ? characterExpNeed(progression.level) : 0;
  const expPercent = progression && progression.level < progression.levelCap ? Math.min(100, Math.round((progression.exp / Math.max(1, expRequired)) * 100)) : 100;
  const canBreakthrough = Boolean(progression && progression.level >= progression.levelCap && (game.cardShards?.[cardId] || 0) >= breakthroughCost.shards && (game.gold || 0) >= breakthroughCost.gold);
  const name = def.name?.[lang] || def.name?.zh || cardId;
  const className = cls.name?.[lang] || cls.name?.zh || '';
  const relicName = relic?.name?.[lang] || relic?.name?.zh;
  const effectText = (skill) => {
    const parts = [];
    if (skill.power) parts.push(`${L.effectPower} ×${skill.power}`);
    if (skill.heal) parts.push(`${L.effectHeal} ×${skill.heal}`);
    if (skill.shield) parts.push(`${L.effectShield} ${percent(skill.shield)}`);
    if (skill.mitigate) parts.push(`${L.effectMitigate} ${percent(skill.mitigate)}`);
    if (skill.pierce) parts.push(`${L.effectPierce} ${percent(skill.pierce)}`);
    if (skill.critBonus) parts.push(`${L.effectCrit} +${percent(skill.critBonus)}`);
    if (skill.hits) parts.push(`${skill.hits} ${L.effectHits}`);
    if (skill.targets) parts.push(`${L.effectTargets} ${skill.targets}`);
    if (skill.taunt) parts.push(`${L.effectTaunt} ${skill.taunt} ${L.turns}`);
    if (skill.turns) parts.push(`${skill.turns} ${L.turns}`);
    return parts.join(' · ');
  };
  const targetName = (target) => L[target] || target;

  return (
    <GameModal open={open} onClose={onClose} title={name} subtitle={className} width="max-w-lg">
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <CardTile def={def} lang={lang} size="md" power={powerOf(cardId)} />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] text-primary">{def.rarity} · {className}</p>
            <p className="text-[10px] text-muted-foreground">{L.level} {progression ? `${progression.level} / ${progression.levelCap}` : '—'}{progression?.breakthroughCount ? ` · ${L.breakthroughCount} ${progression.breakthroughCount}` : ''}</p>
            <p className="text-[10px] text-muted-foreground">{L.power} <span className="text-primary">{fmt(powerOf(cardId))}</span></p>
            <p className="text-[10px] text-emerald-300">{L.hp}: {fmt(stats.hp)}</p>
            <p className="text-[10px] text-sky-300">{L.mp}: {fmt(stats.mp)}</p>
            <p className="text-[9px] text-muted-foreground">{L.note}</p>
          </div>
        </div>

        {progression ? (
          <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-[10px] tracking-wider text-primary"><GameIcon name="TrendingUp" className="h-3 w-3" />{L.breakthrough}</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-lg bg-black/20 p-2"><p className="text-muted-foreground">{L.level}</p><p className="text-foreground tabular-nums">{progression.level} / {progression.levelCap}</p></div>
              <div className="rounded-lg bg-black/20 p-2"><p className="text-muted-foreground">{L.breakthroughCount}</p><p className="text-foreground tabular-nums">{progression.breakthroughCount}</p></div>
              <div className="col-span-2 rounded-lg bg-black/20 p-2">
                <div className="flex flex-wrap items-center justify-between gap-1"><p className="text-muted-foreground">{L.exp}</p><p className="tabular-nums text-foreground">{fmt(progression.exp)}{progression.level >= progression.levelCap ? ` · ${L.expStored}` : ` / ${fmt(expRequired)}`}</p></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={L.exp} aria-valuemin={0} aria-valuemax={100} aria-valuenow={expPercent}><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-300 transition-[width]" style={{ width: `${expPercent}%` }} /></div>
                {progression.level < progression.levelCap ? <p className="mt-1 text-right text-[9px] text-muted-foreground">{L.expRemaining}: {fmt(Math.max(0, expRequired - progression.exp))}</p> : <p className="mt-1 text-right text-[9px] text-muted-foreground">{L.expStoredHint}</p>}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-[9px] text-muted-foreground">
              <span>{L.shards}: {game.cardShards?.[cardId] || 0} / {breakthroughCost.shards}</span>
              <span>{L.gold}: {fmt(game.gold || 0)} / {fmt(breakthroughCost.gold)}</span>
            </div>
            <div className="mt-3 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.035] p-2.5">
              <p className="text-[9px] text-emerald-200">{L.nextCap}: {progression.levelCap} → {progression.levelCap + 10}</p>
              <p className="mt-1 text-[9px] text-muted-foreground">{L.nextReward}</p>
              <p className="mt-1 text-[10px] text-foreground">HP +{nextBreakthroughReward.hp} · ATK +{nextBreakthroughReward.atk} · DEF +{nextBreakthroughReward.def} · MP +{nextBreakthroughReward.mp}</p>
              <p className="mt-1 text-[8px] text-muted-foreground">{L.breakthroughReward}: HP +{totalBreakthroughReward.hp} · ATK +{totalBreakthroughReward.atk} · DEF +{totalBreakthroughReward.def} · MP +{totalBreakthroughReward.mp}</p>
            </div>
            <GoldButton onClick={() => actions.breakthroughHero(cardId)} disabled={!canBreakthrough} className="mt-3 w-full py-2">{L.doBreakthrough}</GoldButton>
            {progression.level < progression.levelCap ? <p className="mt-2 text-center text-[9px] text-muted-foreground">{L.breakthroughNeedMax}</p> : null}
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] tracking-wider text-primary"><GameIcon name="Activity" className="h-3 w-3" />{L.stats}</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[['atk', stats.atk], ['def', stats.def], ['spd', stats.spd], ['crit', percent(stats.crit)]].map(([key, value]) => (
              <div key={key} className="rounded-lg bg-black/20 p-2">
                <p className="text-[9px] text-muted-foreground">{L[key]}</p>
                <p className="text-[13px] tabular-nums text-foreground">{typeof value === 'number' ? fmt(value) : value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.035] p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] tracking-wider text-rose-200"><GameIcon name="Flame" className="h-3 w-3" />{L.desperateCombat}</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-black/20 p-2"><p className="text-[9px] text-muted-foreground">{L.desperateCrit}</p><p className="text-[15px] font-semibold tabular-nums text-rose-200">{precisePercent(desperateRates.desperateCritRate)}</p></div>
            <div className="rounded-lg bg-black/20 p-2"><p className="text-[9px] text-muted-foreground">{L.desperateDodge}</p><p className="text-[15px] font-semibold tabular-nums text-sky-200">{precisePercent(desperateRates.desperateDodgeRate)}</p></div>
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">{L.desperateCombatNote}</p>
        </section>

        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] tracking-wider text-primary"><GameIcon name="Activity" className="h-3 w-3" />{L.sourceTitle}</h4>
          <div className="space-y-2 text-[9px]">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-muted-foreground">{L.mainLevel}: {breakdown.mainCharacterLevel}</span>
              <span className="font-semibold text-emerald-300">{L.teamBonus}: +{breakdown.teamBonusPercent}%</span>
            </div>
            <div className="rounded-lg bg-black/20 p-2">
              <p className="text-muted-foreground">{L.careerGrowth} · Lv {breakdown.characterLevel}</p>
              <p className="mt-1 text-foreground">HP +{breakdown.careerGrowthPercent.hp}% · ATK +{breakdown.careerGrowthPercent.atk}% · DEF +{breakdown.careerGrowthPercent.def}% · MP +{breakdown.careerGrowthPercent.mp}%</p>
            </div>
            <div className="rounded-lg bg-black/20 p-2">
              <p className="text-muted-foreground">{L.breakthroughReward}</p>
              <p className="mt-1 text-foreground">HP +{breakdown.breakthrough.hp} · ATK +{breakdown.breakthrough.atk} · DEF +{breakdown.breakthrough.def} · MP +{breakdown.breakthrough.mp}</p>
            </div>
            <div className="rounded-lg bg-black/20 p-2">
              <p className="text-muted-foreground">{L.equipmentBonus}</p>
              <p className="mt-1 text-foreground">HP +{percent(breakdown.equipment.hpPct)} · ATK +{percent(breakdown.equipment.atkPct)} · DEF +{percent(breakdown.equipment.defPct)} · SPD +{percent(breakdown.equipment.spdPct)} · {L.critShort} +{percent(breakdown.equipment.crit)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] tracking-wider text-primary"><GameIcon name="Shield" className="h-3 w-3" />{L.equipment}</h4>
          {relic ? (
            <div className="flex items-center gap-2">
              <GameIcon name={relic.icon} className="h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-foreground">{relicName}</p>
                <p className="text-[9px] text-muted-foreground">{[['atk', relic.atk], ['hp', relic.hp], ['def', relic.def], ['spd', relic.spd]].filter(([, v]) => v).map(([k, v]) => `${k.toUpperCase()} +${percent(v)}`).join(' · ')}</p>
              </div>
              <span className="text-[9px] text-emerald-300">{L.equipped}</span>
            </div>
          ) : <p className="text-[10px] text-muted-foreground">{L.none}</p>}
          {onOpenForge ? <GhostButton onClick={() => onOpenForge(cardId)} className="mt-2 px-3 py-1.5 text-[9px]">{L.openForge}</GhostButton> : null}
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] tracking-wider text-primary"><GameIcon name="Zap" className="h-3 w-3" />{L.skills}</h4>
          <div className="space-y-2">
            {skills.map(({ id, skill }, index) => (
              <div key={id} className="rounded-lg bg-black/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10.5px] text-foreground">{index + 1}. {skill.name?.[lang] || skill.name?.zh || id}</p>
                  <span className="text-[9px] text-sky-300">{L.cost}: {skill.mp ?? 0}</span>
                </div>
                <p className="mt-1 text-[9px] text-muted-foreground">{L[skill.kind] || skill.kind} · {L.target}: {targetName(skill.target)}{effectText(skill) ? ` · ${effectText(skill)}` : ''}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-3">
          <h4 className="mb-1 flex items-center gap-1.5 text-[10px] tracking-wider text-primary"><GameIcon name="Sparkles" className="h-3 w-3" />{L.passive}</h4>
          <p className="text-[10px] leading-relaxed text-foreground/85">{cls.passive?.[lang] || cls.passive?.zh || '—'}</p>
        </section>

        {onPlace ? <GoldButton onClick={() => onPlace(cardId)} className="w-full py-2">{L.place}</GoldButton> : null}
      </div>
    </GameModal>
  );
}
