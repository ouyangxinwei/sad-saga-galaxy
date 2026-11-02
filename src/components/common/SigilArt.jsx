import GameIcon from './GameIcon';
import { RARITY_COLOR, TYPE_MAP, classOf } from '@/lib/gameData';

export default function SigilArt({ def, size = 'sm', locked = false, className = '', children }) {
  const rarity = def?.rarity || 'C';
  const color = RARITY_COLOR[rarity] || RARITY_COLOR.C;
  const cls = def ? classOf(def.classId) : null;
  const iconName = def?.converted ? TYPE_MAP[def.type]?.icon || 'Skull' : cls?.icon || 'Sparkles';

  const iconSize = size === 'xs' ? 'h-7 w-7' : size === 'md' ? 'h-14 w-14' : 'h-10 w-10';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 28% 4%, ${color}42, transparent 62%), linear-gradient(160deg, #171d36 0%, #0b0f1c 58%, #070a12 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{ backgroundImage: 'repeating-linear-gradient(112deg, rgba(255,255,255,.5) 0 1px, transparent 1px 11px)' }}
      />
      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ background: color }} />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#04060d] via-[#04060d]/60 to-transparent" />
      {locked ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <GameIcon name="Lock" className="h-4 w-4 text-white/25" />
        </div>
      ) : (
        <GameIcon
          name={iconName}
          className={`absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 ${iconSize}`}
          style={{ color, filter: `drop-shadow(0 0 14px ${color}70)` }}
        />
      )}
      {children}
    </div>
  );
}