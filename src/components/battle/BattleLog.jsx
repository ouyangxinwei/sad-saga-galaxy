import { useMemo } from 'react';

const BATTLE_COPY = {
  zh: { actionOrder:'本回合实际行动顺序', formation:'阵型效果', formationBonus:'阵型加成', damageReduction:'受到伤害 -{n}%', skillDamage:'技能伤害 +{n}%', skillEffect:'技能效果 +{n}%', mpCost:'技能 MP 消耗 -{n}%', crit:'普通暴击率 +{n} 个百分点', desperateCrit:'绝境暴击率 +{n} 个百分点', dodge:'危机闪避率 +{n} 个百分点', followUp:'连续行动暴击率 +{n} 个百分点' },
  ja: { actionOrder:'このターンの実際の行動順', formation:'陣形効果', formationBonus:'陣形ボーナス', damageReduction:'被ダメージ -{n}%', skillDamage:'スキルダメージ +{n}%', skillEffect:'スキル効果 +{n}%', mpCost:'スキル MP 消費 -{n}%', crit:'通常会心率 +{n} ポイント', desperateCrit:'窮地会心率 +{n} ポイント', dodge:'危機回避率 +{n} ポイント', followUp:'連続行動時の会心率 +{n} ポイント' },
  en: { actionOrder:'Actual action order this round', formation:'Formation effect', formationBonus:'Formation bonuses', damageReduction:'Damage taken -{n}%', skillDamage:'Skill damage +{n}%', skillEffect:'Skill effects +{n}%', mpCost:'Skill MP cost -{n}%', crit:'Critical chance +{n} pp', desperateCrit:'Desperate critical chance +{n} pp', dodge:'Desperate dodge chance +{n} pp', followUp:'Follow-up critical chance +{n} pp' },
};
function battleText(lang, key, vars = {}) {
  return (BATTLE_COPY[lang] || BATTLE_COPY.en)[key].replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}

function lineOf(ev, lang, t) {
  switch (ev.kind) {
    case 'round':
      return { tone: 'round', text: t('battle.round', { n: ev.round }) };
    case 'action': {
      const notes = [];
      if (ev.formationSkillDamagePct > 0) notes.push(battleText(lang, 'skillDamage', { n: Math.round(ev.formationSkillDamagePct * 100) }));
      if (ev.formationSkillEffectPct > 0) notes.push(battleText(lang, 'skillEffect', { n: Math.round(ev.formationSkillEffectPct * 100) }));
      if (ev.formationMpCostReductionPct > 0) notes.push(battleText(lang, 'mpCost', { n: Math.round(ev.formationMpCostReductionPct * 100) }));
      return { tone: notes.length ? 'formation' : 'action', text: `${ev.name} · ${ev.skill?.[lang] || ev.skill?.zh || ''}${notes.length ? ` · ✧ ${battleText(lang, 'formation')} ${notes.join(' / ')}` : ''}` };
    }
    case 'damage':
      return {
        tone: ev.desperateCrit || ev.crit ? 'crit' : 'damage',
        text: `${ev.actor} → ${ev.target}${ev.hitCount > 1 ? ` [${ev.hitIndex}/${ev.hitCount}]` : ''}  ${ev.amount.toLocaleString('en-US')}${ev.desperateCrit ? ` ✦ ${t('battle.desperateCrit')}` : ev.crit ? ' ✦' : ''}${ev.formationEnhanced || ev.formationDamageReductionPct > 0 || (ev.crit && ev.formationChancePp > 0) || (ev.desperateCrit && ev.formationDesperateCritPp > 0) ? ` · ✧ ${battleText(lang, 'formation')}` : ''}`,
      };
    case 'dodge':
      return { tone: 'dodge', text: `${ev.target}${ev.hitCount > 1 ? ` [${ev.hitIndex}/${ev.hitCount}]` : ''} · ${t('battle.dodge')}${ev.formationDodgePp > 0 ? ` · ✧ ${battleText(lang, 'formation')}` : ''}` };
    case 'equipment':
      return { tone: 'action', text: `${ev.actor} ✦ ${ev.label?.[lang] || ev.label?.zh || ev.itemName?.[lang] || 'Equipment effect'}` };
    case 'mp':
      return { tone: 'heal', text: `${ev.name} +${ev.amount} MP` };
    case 'heal':
      return { tone: ev.formationEnhanced ? 'formation' : 'heal', text: `${ev.actor} → ${ev.target}  ${ev.amount.toLocaleString('en-US')}${ev.formationEnhanced ? ` · ✧ ${battleText(lang, 'formation')}` : ''}` };
    case 'shield':
      return { tone: ev.formationEnhanced ? 'formation' : 'shield', text: `${ev.target} 🛡 ${ev.amount.toLocaleString('en-US')}${ev.formationEnhanced ? ` · ✧ ${battleText(lang, 'formation')}` : ''}` };
    case 'ward':
      return { tone: ev.formationEnhanced ? 'formation' : 'shield', text: `${ev.name} · ${Math.round(ev.value * 100)}%${ev.formationEnhanced ? ` · ✧ ${battleText(lang, 'formation')}` : ''}` };
    case 'taunt':
      return { tone: 'action', text: `${ev.target} · ${t('battle.taunt')}` };
    case 'status_applied':
      return { tone: 'action', text: t('battle.statusApplied', { target: ev.name, status: t(`battle.status.${ev.status.type}`), level: ev.status.type === 'confusion' ? ` Lv.${ev.status.level}` : '' }) };
    case 'status_removed':
      return { tone: 'heal', text: t('battle.statusRemoved', { target: ev.name, status: t(`battle.status.${ev.statusType}`), reason: ev.reason === 'damage' ? t('battle.status.damageWake') : ev.reason === 'expired' ? t('battle.status.expired') : ev.reason === 'death' ? t('battle.status.deathClear') : t('battle.status.battleEnd') }) };
    case 'status_blocked':
      return { tone: 'damage', text: t('battle.statusBlocked', { target: ev.name, status: t(`battle.status.${ev.statusType}`) }) };
    case 'poison_damage':
      return { tone: 'damage', text: t('battle.poisonDamage', { target: ev.name, amount: ev.amount.toLocaleString('en-US') }) };
    case 'miss':
      return { tone: 'dodge', text: t('battle.blindMiss', { actor: ev.actor, target: ev.target }) };
    case 'confusion_skip':
      return { tone: 'damage', text: t('battle.confusionSkip', { target: ev.name }) };
    case 'confusion_action':
      return { tone: 'damage', text: t('battle.confusionAction', { target: ev.name, level: ev.level, action: ev.behavior === 'berserk' ? t('battle.confusionBerserk') : t('battle.confusionMisdirect'), victim: ev.target || '' }) };
    case 'death':
      return { tone: 'death', text: `${ev.target} ✕` };
    case 'revive':
      return { tone: 'revive', text: t('battle.revived', { caster: ev.caster, target: ev.target }) };
    case 'perma':
      return { tone: 'perma', text: t('battle.perma', { target: ev.target }) };
    default:
      return null;
  }
}

const TONES = {
  round: 'text-primary/70 border-primary/20 bg-primary/[0.06]',
  action: 'text-foreground/60',
  formation: 'text-[#c6a4ff] font-medium',
  damage: 'text-rose-300/85',
  crit: 'text-[#FFC978]',
  dodge: 'text-[#9CC4FF] font-semibold',
  heal: 'text-[#8EF0CF]',
  shield: 'text-[#9CC4FF]',
  death: 'text-rose-400/70',
  revive: 'text-primary',
  perma: 'text-rose-500',
};

export default function BattleLog({ events, step, lang, t }) {
  const lines = useMemo(() => {
    const out = [];
    for (let i = 0; i <= step && i < events.length; i += 1) {
      const ev = events[i];
      if (ev.kind === 'end') continue;
      const line = lineOf(ev, lang, t);
      if (line) out.push({ ...line, i });
    }
    return out.slice(-40);
  }, [events, step, lang, t]);

  return (
    <div className="saga-panel flex h-[280px] flex-col p-3 lg:h-full">
      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{t('battle.log')}</p>
      <div className="saga-scroll mt-2 flex-1 space-y-[3px] overflow-y-auto pr-1">
        {lines.map((line) => (
          <p
            key={line.i}
            className={`rise-in rounded-md border px-2 py-[3px] text-[9.5px] leading-relaxed ${
              line.tone === 'round' ? TONES.round : 'border-transparent'
            } ${TONES[line.tone] || 'text-foreground/70'}`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
