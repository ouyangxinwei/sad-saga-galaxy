import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { useGame } from '@/lib/GameContext';
import { APP_VERSION, CHANGELOG, RELEASE_DATE } from '@/lib/version';

export default function PatchesDialog({ open, onClose }) {
  const { t, lang } = useGame();

  return (
    <GameModal
      open={open}
      onClose={onClose}
      title={t('patches.title')}
      subtitle={`${APP_VERSION} · ${CHANGELOG[0].title[lang] || CHANGELOG[0].title.zh} · ${RELEASE_DATE}`}
      width="max-w-2xl"
    >
      <div className="space-y-4">
        {CHANGELOG.map((entry) => (
          <article key={entry.version} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] tracking-wider text-primary">
                {entry.version}
              </span>
              <h5 className="text-[12px] text-foreground/90">{entry.title[lang] || entry.title.zh}</h5>
            </div>
            <ul className="mt-2 space-y-1.5">
              {(entry.items[lang] || entry.items.zh).map((line) => (
                <li key={line} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <GameIcon name="ChevronRight" className="mt-[3px] h-3 w-3 shrink-0 text-primary/60" />
                  {line}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </GameModal>
  );
}