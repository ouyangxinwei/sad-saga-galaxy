import { useMemo } from 'react';

function lineOf(ev, lang, t) {
  switch (ev.kind) {
    case 'round':
      return { tone: 'round', text: t('battle.round', { n: ev.round }) };
    case 'action':
      return { tone: 'action', text: `${ev.name} · ${ev.skill?.[lang] || ev.skill?.zh || ''}` };
    case 'damage':
      return {
        tone: ev.crit ? 'crit' : 'damage',
        text: `${ev.actor} → ${ev.target}  ${ev.amount.toLocaleString('en-US')}${ev.crit ? ' ✦' : ''}`,
      };
    case 'heal':
      return { tone: 'heal', text: `${ev.actor} → ${ev.target}  ${ev.amount.toLocaleString('en-US')}` };
    case 'shield':
      return { tone: 'shield', text: `${ev.target} 🛡 ${ev.amount.toLocaleString('en-US')}` };
    case 'ward':
      return { tone: 'shield', text: `${ev.name} · ${Math.round(ev.value * 100)}%` };
    case 'taunt':
      return { tone: 'action', text: `${ev.target} · ${t('battle.taunt')}` };
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
  damage: 'text-rose-300/85',
  crit: 'text-[#FFC978]',
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
