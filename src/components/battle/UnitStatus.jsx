import SigilArt from '@/components/common/SigilArt';
import GameIcon from '@/components/common/GameIcon';
import { RARITY_COLOR } from '@/lib/gameData';
import { fmt, pct } from '@/lib/format';

export default function UnitStatus({ unit, state, compact = false }) {
  const st = state || {};
  const maxHp = st.maxHp ?? unit.maxHp ?? unit.hp;
  const hp = Math.max(0, st.hp ?? unit.hp);
  const alive = st.alive !== false;
  const shield = st.shield ?? 0;
  const lp = st.lp ?? unit.lp ?? 0;
  const maxLp = unit.maxLp ?? 0;
  const isAlly = unit.side === 'ally';
  const maxMp = st.maxMp ?? unit.maxMp ?? 100;
  const mp = st.mp ?? unit.mp ?? 0;

  return (
    <div className={`flex min-w-0 flex-col items-center ${alive ? '' : 'opacity-35 saturate-0'}`}>
      <div className={`relative w-full ${compact ? 'max-w-[76px]' : 'max-w-[92px]'}`}>
        <SigilArt
          def={{ rarity: unit.rarity, classId: unit.classId, converted: !isAlly, type: unit.type }}
          size={compact ? 'xs' : 'sm'}
          className={`w-full ${compact ? 'h-[66px]' : 'h-[78px]'} rounded-lg border`}
        />
        {shield > 0 && (
          <span className="absolute right-1 top-1 rounded bg-[#6FA8FF]/20 px-1 text-[8px] text-[#9CC4FF]">
            +{fmt(shield)}
          </span>
        )}
        {!alive && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[9px] tracking-widest text-rose-300/80">
            DOWN
          </span>
        )}
        <div className="absolute inset-x-1 bottom-1">
          <div className="h-1 overflow-hidden rounded-full bg-black/60">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct(hp, maxHp)}%`,
                background: isAlly ? 'linear-gradient(90deg,#3fbf9a,#8ef0cf)' : 'linear-gradient(90deg,#b03a55,#f0798f)',
                transition: 'width .35s ease',
              }}
            />
          </div>
          <div className="mt-0.5 h-[2px] overflow-hidden rounded-full bg-black/60">
            <div className="h-full rounded-full bg-[#6FA8FF]" style={{ width: `${pct(mp, maxMp)}%`, transition: 'width .35s ease' }} />
          </div>
        </div>
      </div>
      <p className="mt-1 w-full truncate text-center text-[9.5px] text-foreground/85">{unit.name}</p>
      <p className="text-[8px] tabular-nums text-muted-foreground">{fmt(hp)} / {fmt(maxHp)}</p>
      {isAlly && maxLp > 0 && (
        <div className="mt-0.5 flex items-center gap-[2px]">
          {Array.from({ length: maxLp }, (_, i) => (
            <span key={i} className="h-1 w-1 rounded-full" style={{ background: i < lp ? '#E8C87A' : 'rgba(255,255,255,0.14)' }} />
          ))}
        </div>
      )}
      {unit.taunt > 0 && (
        <span className="mt-0.5 flex items-center gap-0.5 text-[8px] text-[#F0B85C]">
          <GameIcon name="Shield" className="h-2 w-2" />
          TAUNT
        </span>
      )}
    </div>
  );
}
