import { useEffect, useMemo, useState } from 'react';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton } from '@/components/common/Bits';
import { FORMATIONS, DEFAULT_FORMATION_ID } from '@/lib/formationSystem';

const COPY = {
  zh: {
    title: '战术阵型', subtitle: '选择阵型，安排五个站位，让队伍获得不同的战术方向。',
    active: '当前使用', preview: '预览中', apply: '启用此阵型', applied: '当前阵型',
    board: '阵型站位', choose: '调整当前站位', chooseHint: '先选择一个站位，再从下方选择队伍中的角色。点击已有角色可与该位置互换。',
    roster: '可安排角色', noParty: '当前队伍暂无可安排角色。',
    saved: '配置会自动保存在本设备。每种阵型分别保存自己的角色位置。',
    partyNote: '这里的换位只影响所选阵型，不会改变下方的当前队伍名单或队伍预设。',
    effect: '效果预览', effectNotice: 'Phase 3-D：阵型属性、概率、伤害减免、技能强化、MP 消耗及特殊行动顺序均已接入战斗。',
    selected: '已选站位', empty: '空位', assigned: '已安排', selectSlot: '请选择一个站位',
    roles: { core: '核心位', support: '支援位', corner: '角位', vanguard: '前锋', wing: '侧翼', rear: '后排', front: '前卫', line: '纵列', center: '中央', outer: '外围', stagger: '游击位', ring: '环位' },
    effects: {
      star: ['核心角色攻击力 +30%，绝境暴击概率 +5 个百分点', '其他四名角色 HP、攻击、防御、速度、MP 各降低 10%'],
      'four-corner-core': ['中央角色 MP +25%、技能伤害 +10%，并安排为我方最后行动', '四角角色防御力 +5%'],
      spearhead: ['前锋攻击力 +25%、速度 +15%', '两翼暴击率 +5 个百分点；后排防御力 -10%'],
      'diamond-guard': ['前锋 HP +20%、防御力 +25%', '后卫闪避率 +10 个百分点；全队直接伤害减免 5%'],
      'long-serpent': ['全队速度 +10%', '按阵型位置安排我方行动顺序；连续行动后续角色暴击率 +5 个百分点'],
      'cross-support': ['中央角色 MP +25%', '外围角色技能 MP 消耗 -10%；全队技能效果 +5%'],
      'staggered-skirmish': ['全队闪避率 +5 个百分点，高速角色额外 +5 个百分点', '全队攻击力 -5%'],
      'balanced-ring': ['全队 HP、防御力 +5%，MP +10%', '全队暴击率与闪避率各 +3 个百分点'],
    },
  },
  ja: {
    title: '戦術陣形', subtitle: '陣形を選び、5 つの配置を調整して部隊の戦術を決めます。',
    active: '使用中', preview: 'プレビュー', apply: 'この陣形を適用', applied: '適用中',
    board: '陣形配置', choose: '配置を変更', chooseHint: '先に配置場所を選び、下から現在の編成メンバーを選択します。配置済みのキャラを選ぶと入れ替わります。',
    roster: '配置可能なキャラクター', noParty: '現在の編成に配置可能なキャラクターがいません。',
    saved: '設定はこの端末に自動保存されます。陣形ごとに配置を個別保存します。',
    partyNote: 'ここでの入れ替えは選択中の陣形だけに反映され、現在の編成やプリセットは変更されません。',
    effect: '効果プレビュー', effectNotice: 'Phase 3-D：陣形能力値・確率・ダメージ軽減・スキル強化・MP 消費・特殊行動順を戦闘へ反映済みです。',
    selected: '選択中の配置', empty: '空き', assigned: '配置済み', selectSlot: '配置場所を選択してください',
    roles: { core: '主力', support: '支援', corner: '四隅', vanguard: '先鋒', wing: '側翼', rear: '後衛', front: '前衛', line: '縦列', center: '中央', outer: '外周', stagger: '遊撃', ring: '環状' },
    effects: {
      star: ['主力の攻撃力 +30%、窮地クリティカル率 +5 ポイント', '他の 4 人は HP・攻撃・防御・速度・MP が各 -10%'],
      'four-corner-core': ['中央の MP +25%、スキルダメージ +10%、味方の最後に行動', '四隅の防御力 +5%'],
      spearhead: ['先鋒の攻撃力 +25%、速度 +15%', '両翼のクリティカル率 +5 ポイント、後衛の防御力 -10%'],
      'diamond-guard': ['前衛の HP +20%、防御力 +25%', '後衛の回避率 +10 ポイント、全員の直接ダメージを 5% 軽減'],
      'long-serpent': ['全員の速度 +10%', '陣形順で味方の行動順を設定。連続行動時の後続キャラのクリティカル率 +5 ポイント'],
      'cross-support': ['中央の MP +25%', '外周キャラのスキル MP 消費 -10%、全員のスキル効果 +5%'],
      'staggered-skirmish': ['全員の回避率 +5 ポイント、高速キャラはさらに +5 ポイント', '全員の攻撃力 -5%'],
      'balanced-ring': ['全員の HP・防御力 +5%、MP +10%', '全員のクリティカル率・回避率がそれぞれ +3 ポイント'],
    },
  },
  en: {
    title: 'Tactical Formations', subtitle: 'Choose a formation and arrange five positions to shape your team strategy.',
    active: 'Active', preview: 'Preview', apply: 'Use this formation', applied: 'In use',
    board: 'Formation layout', choose: 'Change this position', chooseHint: 'Select a position, then choose one of your current party members below. Choosing an assigned character swaps their positions.',
    roster: 'Available party members', noParty: 'There are no available characters in the current party.',
    saved: 'Settings are saved automatically on this device. Each formation keeps its own arrangement.',
    partyNote: 'These changes affect only the selected formation; your current party roster and presets remain unchanged.',
    effect: 'Effect preview', effectNotice: 'Phase 3-D: formation stats, chance bonuses, damage reduction, skill enhancement, MP cost, and special action order now affect combat.',
    selected: 'Selected position', empty: 'Empty', assigned: 'Assigned', selectSlot: 'Select a position',
    roles: { core: 'Core', support: 'Support', corner: 'Corner', vanguard: 'Vanguard', wing: 'Wing', rear: 'Rear', front: 'Front', line: 'Line', center: 'Center', outer: 'Outer', stagger: 'Skirmish', ring: 'Ring' },
    effects: {
      star: ['Core: ATK +30%, Desperate Critical chance +5 percentage points', 'Other four allies: HP, ATK, DEF, SPD, and MP each -10%'],
      'four-corner-core': ['Center: MP +25%, skill damage +10%, and acts last among allies', 'Four corners: DEF +5%'],
      spearhead: ['Vanguard: ATK +25%, SPD +15%', 'Wings: Critical chance +5 percentage points; rear: DEF -10%'],
      'diamond-guard': ['Front: HP +20%, DEF +25%', 'Rear: Dodge chance +10 percentage points; team direct damage reduction 5%'],
      'long-serpent': ['Team SPD +10%', 'Ally action order follows formation positions; follow-up ally Critical chance +5 percentage points'],
      'cross-support': ['Center: MP +25%', 'Outer positions: skill MP cost -10%; team skill effect +5%'],
      'staggered-skirmish': ['Team Dodge chance +5 percentage points; high-speed allies gain another +5 points', 'Team ATK -5%'],
      'balanced-ring': ['Team HP and DEF +5%, MP +10%', 'Team Critical and Dodge chances each +3 percentage points'],
    },
  },
};

export default function FormationManager({ party, lang, defOf, formationState, actions }) {
  const copy = COPY[lang] || COPY.zh;
  const [previewId, setPreviewId] = useState(formationState?.activeFormationId || DEFAULT_FORMATION_ID);
  const [selectedPosition, setSelectedPosition] = useState(0);

  useEffect(() => {
    if (formationState?.activeFormationId) setPreviewId(formationState.activeFormationId);
  }, [formationState?.activeFormationId]);

  const definition = FORMATIONS.find((item) => item.id === previewId) || FORMATIONS[FORMATIONS.length - 1];
  const assignments = formationState?.assignmentsByFormation?.[definition.id] || party.slice(0, 5);
  const selectedCharacter = assignments[selectedPosition] || null;
  const isActive = formationState?.activeFormationId === definition.id;
  const partyIds = useMemo(() => party.slice(0, 5).filter((id, index, all) => id && all.indexOf(id) === index), [party]);

  const selectFormation = (id) => {
    setPreviewId(id);
    setSelectedPosition(0);
  };

  const assignCharacter = (id) => {
    actions.setFormationPosition(definition.id, selectedPosition, id);
  };

  return (
    <section className="saga-panel mt-3 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground">{copy.title}</p>
          <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{copy.subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/25 bg-primary/[0.08] px-2 py-1 text-[8px] text-primary">
          {isActive ? copy.active : copy.preview}
        </span>
      </div>

      <div className="no-scrollbar mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {FORMATIONS.map((item) => {
          const chosen = item.id === definition.id;
          const using = item.id === formationState?.activeFormationId;
          return (
            <button key={item.id} type="button" onClick={() => selectFormation(item.id)}
              aria-pressed={chosen}
              className={`tap min-w-0 rounded-lg border px-2 py-2 text-left transition ${chosen ? 'border-primary/55 bg-primary/[0.10]' : 'border-white/10 bg-white/[0.025] hover:border-white/20'}`}>
              <span className="flex items-center justify-between gap-1">
                <span className={`truncate text-[10px] font-medium ${chosen ? 'text-primary' : 'text-foreground/85'}`}>{item.name[lang] || item.name.zh}</span>
                {using ? <GameIcon name="CheckCircle2" className="h-3 w-3 shrink-0 text-emerald-300" /> : null}
              </span>
              <span className="mt-0.5 block truncate text-[8px] text-muted-foreground">{item.role[lang] || item.role.zh}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)]">
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold tracking-wide text-foreground/85">{copy.board}</p>
            <span className="text-[8px] text-muted-foreground">{assignments.filter(Boolean).length}/5</span>
          </div>
          <div className="relative h-[280px] overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(232,200,122,0.08),transparent_68%),linear-gradient(135deg,rgba(255,255,255,0.025),rgba(255,255,255,0.005))] sm:h-[320px]">
            <div className="absolute inset-5 rounded-full border border-dashed border-primary/15" />
            <div className="absolute inset-x-8 inset-y-7 rounded-full border border-white/[0.045]" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/35" />
            {definition.positions.map((position, index) => {
              const cardId = assignments[index] || null;
              const def = cardId ? defOf(cardId) : null;
              const selected = selectedPosition === index;
              const left = `clamp(34px, ${position.x}%, calc(100% - 34px))`;
              const top = `clamp(34px, ${position.y}%, calc(100% - 34px))`;
              return (
                <div key={position.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left, top }}>
                  <button type="button" onClick={() => setSelectedPosition(index)} aria-pressed={selected}
                    className={`tap flex w-[68px] flex-col items-center rounded-xl border px-1.5 py-2 shadow-lg backdrop-blur-sm ${selected ? 'border-primary/70 bg-primary/[0.15] shadow-primary/10' : 'border-white/10 bg-[#0b0e1c]/85'}`}>
                    <span className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold ${selected ? 'bg-primary text-[#17120a]' : 'bg-white/10 text-foreground/80'}`}>{index + 1}</span>
                    <span className="max-w-full truncate text-[9px] font-medium text-foreground/90">{def ? (def.name[lang] || def.name.zh) : copy.empty}</span>
                    <span className="mt-0.5 max-w-full truncate text-[7px] text-muted-foreground">{copy.roles[position.role] || position.role}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-2 rounded-lg border border-white/[0.07] bg-white/[0.025] p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[9px] font-semibold text-primary">{copy.choose}</p>
              <p className="text-[8px] text-muted-foreground">{copy.selected}: {selectedPosition + 1}</p>
            </div>
            <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">{copy.chooseHint}</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {partyIds.map((id) => {
                const def = defOf(id);
                const assigned = assignments[selectedPosition] === id;
                const elsewhere = assignments.some((assignedId, index) => assignedId === id && index !== selectedPosition);
                return (
                  <button key={id} type="button" onClick={() => assignCharacter(id)} aria-pressed={assigned}
                    className={`tap min-w-0 rounded-lg border p-1.5 text-center ${assigned ? 'border-primary/55 bg-primary/[0.10]' : 'border-white/10 bg-white/[0.025]'}`}>
                    <span className="block truncate text-[8px] font-medium text-foreground/90">{def?.name[lang] || def?.name.zh || id}</span>
                    <span className="mt-0.5 block text-[7px] text-muted-foreground">{elsewhere ? (lang === 'ja' ? '入替' : lang === 'en' ? 'Swap' : '换位') : assigned ? (lang === 'ja' ? '配置中' : lang === 'en' ? 'Placed' : '已在此位') : (lang === 'ja' ? '配置' : lang === 'en' ? 'Place' : '安排')}</span>
                  </button>
                );
              })}
            </div>
            {!partyIds.length ? <p className="mt-2 text-[9px] text-muted-foreground">{copy.noParty}</p> : null}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <p className="text-[10px] font-semibold text-foreground/85">{copy.effect}</p>
            <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">{definition.description[lang] || definition.description.zh}</p>
            <ul className="mt-2 space-y-2">
              {(copy.effects[definition.id] || []).map((line) => (
                <li key={line} className="flex gap-2 text-[9px] leading-relaxed text-foreground/80">
                  <GameIcon name="Sparkles" className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.045] p-2 text-[8px] leading-relaxed text-amber-100/70">{copy.effectNotice}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <p className="text-[9px] font-semibold text-foreground/85">{copy.selected}: {selectedPosition + 1}</p>
            <p className="mt-1 text-[9px] text-muted-foreground">{selectedCharacter ? (defOf(selectedCharacter)?.name[lang] || defOf(selectedCharacter)?.name.zh || selectedCharacter) : copy.empty}</p>
            <div className="mt-3">
              <GoldButton onClick={() => actions.setActiveFormation(definition.id)} disabled={isActive || assignments.filter(Boolean).length !== 5} className="w-full justify-center px-3 py-2 text-[9px]">
                {isActive ? copy.applied : copy.apply}
              </GoldButton>
            </div>
            <p className="mt-2 text-[8px] leading-relaxed text-muted-foreground">{copy.saved}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-white/[0.07] pt-2 text-[8px] leading-relaxed text-muted-foreground">{copy.partyNote}</p>
    </section>
  );
}
