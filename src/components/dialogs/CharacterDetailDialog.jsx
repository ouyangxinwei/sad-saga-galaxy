import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import CardTile from '@/components/common/CardTile';
import { GoldButton, GhostButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { SKILLS, RELICS, classOf } from '@/lib/gameData';
import { cardStats, relicOf } from '@/lib/cards';
import { fmt } from '@/lib/format';

const LABELS = {
  zh: { level: '等级', power: '战力', hp: '最大 HP', mp: '最大 MP', stats: '基础属性', atk: '攻击', def: '防御', spd: '速度', crit: '暴击率', equipment: '装备', none: '尚未装备遗物', skills: '主动技能', passive: '职业被动', target: '目标', cost: 'MP 消耗', attack: '攻击', support: '辅助', defense: '防御', single: '单体', all: '全体', self: '自身', ally: '友方', random: '随机', place: '编入当前选中位置', openForge: '前往装备管理', equipped: '装备中' },
  ja: { level: 'レベル', power: '戦力', hp: '最大 HP', mp: '最大 MP', stats: '基本ステータス', atk: '攻撃', def: '防御', spd: '速度', crit: '会心率', equipment: '装備', none: '遺物未装備', skills: 'アクティブスキル', passive: '職業パッシブ', target: '対象', cost: 'MP 消費', attack: '攻撃', support: '支援', defense: '防御', single: '単体', all: '全体', self: '自身', ally: '味方', random: 'ランダム', place: '選択中の枠に編成', openForge: '装備管理へ', equipped: '装備中' },
  en: { level: 'Level', power: 'Power', hp: 'Max HP', mp: 'Max MP', stats: 'Attributes', atk: 'ATK', def: 'DEF', spd: 'SPD', crit: 'Crit Rate', equipment: 'Equipment', none: 'No relic equipped', skills: 'Active Skills', passive: 'Class Passive', target: 'Target', cost: 'MP cost', attack: 'Attack', support: 'Support', defense: 'Defense', single: 'Single', all: 'All', self: 'Self', ally: 'Ally', random: 'Random', place: 'Place in selected slot', openForge: 'Open equipment manager', equipped: 'Equipped' },
};
const percent = (value) => `${Math.round(value * 100)}%`;

export default function CharacterDetailDialog({ cardId, open, onClose, onPlace, onOpenForge }) {
  const game = useGame();
  const { t, lang, defOf, powerOf, level, rebirth } = game;
  const L = LABELS[lang] || LABELS.zh;
  const def = cardId ? defOf(cardId) : null;
  if (!def) return null;

  const cls = classOf(def.classId);
  const stats = cardStats(game, cardId);
  const relic = relicOf(game, cardId);
  const skills = (def.skills || cls.skills || []).map((id) => ({ id, skill: SKILLS[id] })).filter((x) => x.skill);
  const name = def.name?.[lang] || def.name?.zh || cardId;
  const className = cls.name?.[lang] || cls.name?.zh || '';
  const relicName = relic?.name?.[lang] || relic?.name?.zh;
  const effectText = (skill) => {
    const parts = [];
    if (skill.power) parts.push(`倍率 ×${skill.power}`);
    if (skill.heal) parts.push(`治疗 ×${skill.heal}`);
    if (skill.shield) parts.push(`护盾 ${percent(skill.shield)}`);
    if (skill.mitigate) parts.push(`减伤 ${percent(skill.mitigate)}`);
    if (skill.pierce) parts.push(`无视防御 ${percent(skill.pierce)}`);
    if (skill.critBonus) parts.push(`暴击 +${percent(skill.critBonus)}`);
    if (skill.hits) parts.push(`${skill.hits} 连击`);
    if (skill.targets) parts.push(`目标数 ${skill.targets}`);
    if (skill.taunt) parts.push(`嘲讽 ${skill.taunt} 回合`);
    if (skill.turns) parts.push(`${skill.turns} 回合`);
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
            <p className="text-[10px] text-muted-foreground">{L.level} {level}{rebirth ? ` · Rebirth ${rebirth}` : ''}</p>
            <p className="text-[10px] text-muted-foreground">{L.power} <span className="text-primary">{fmt(powerOf(cardId))}</span></p>
            <p className="text-[10px] text-emerald-300">{L.hp}: {fmt(stats.hp)}</p>
            <p className="text-[10px] text-sky-300">{L.mp}: {fmt(stats.mp)}</p>
            <p className="text-[9px] text-muted-foreground">HP / MP 显示角色最大值；战斗中的实时值仅在战斗界面变化。</p>
          </div>
        </div>

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
