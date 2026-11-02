import { useNavigate } from 'react-router-dom';
import GameIcon from '@/components/common/GameIcon';

export default function PageHeader({ title, subtitle, right, back = '/' }) {
  const navigate = useNavigate();
  return (
    <header className="saga-panel flex items-center gap-3 px-3.5 py-3">
      <button
        type="button"
        onClick={() => navigate(back)}
        className="tap rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-muted-foreground hover:text-primary"
      >
        <GameIcon name="ChevronRight" className="h-3.5 w-3.5 rotate-180" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="saga-heading truncate text-[13px] text-foreground/95">{title}</p>
        {subtitle ? <p className="truncate text-[9px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  );
}