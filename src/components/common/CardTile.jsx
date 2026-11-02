import SigilArt from './SigilArt';
import GameIcon from './GameIcon';
import { RARITY_COLOR, classOf } from '@/lib/gameData';

const SIZES = {
  xs: { box: 'h-[76px] w-[58px]', name: 'text-[10px]', meta: 'text-[9px]' },
  sm: { box: 'h-[104px] w-[78px]', name: 'text-[11px]', meta: 'text-[9px]' },
  md: { box: 'h-[132px] w-[98px]', name: 'text-xs', meta: 'text-[10px]' },
};

export default function CardTile({
  def,
  lang = 'zh',
  size = 'sm',
  locked = false,
  power,
  onClick,
  selected = false,
  lp,
  badge,
  className = '',
}) {
  const s = SIZES[size] || SIZES.sm;
  const color = RARITY_COLOR[def?.rarity || 'C'];
  const name = locked || !def ? '???' : def.name[lang] || def.name.zh;
  const cls = def ? classOf(def.classId) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`tap group relative flex flex-col overflow-hidden rounded-xl border text-left ${
        selected ? 'border-primary/70 shadow-[0_0_0_1px_rgba(232,200,122,0.5),0_16px_40px_-24px_rgba(232,200,122,0.7)]' : 'border-white/10'
      } ${className}`}
    >
      <SigilArt def={def} size={size} locked={locked} className={s.box}>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-1">
          <span
            className="rounded px-1 py-[1px] text-[8px] font-semibold tracking-wider"
            style={{ color, background: `${color}1f`, border: `1px solid ${color}44` }}
          >
            {def?.rarity || '?'}
          </span>
          {badge ? <span className="rounded bg-black/50 px-1 text-[8px] text-primary">{badge}</span> : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 px-1.5 pb-1.5">
          <p className={`truncate font-medium text-foreground/95 ${s.name}`}>{name}</p>
          <div className={`flex items-center justify-between ${s.meta} text-muted-foreground`}>
            <span className="truncate">{cls ? cls.name[lang] || cls.name.zh : ''}</span>
            {typeof lp === 'number' ? (
              <span className="flex items-center gap-0.5 text-[8px] text-primary/80">
                <GameIcon name="Heart" className="h-2 w-2" />
                {lp}
              </span>
            ) : null}
          </div>
          {typeof power === 'number' ? (
            <p className={`mt-0.5 ${s.meta} text-primary/80`}>{power.toLocaleString('en-US')}</p>
          ) : null}
        </div>
      </SigilArt>
    </button>
  );
}