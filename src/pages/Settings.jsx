import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import PageHeader from '@/components/common/PageHeader';
import GameIcon from '@/components/common/GameIcon';
import { GhostButton, GoldButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { LANGS } from '@/lib/i18n';

export default function Settings() {
  const { t, lang, setLang, actions, level, rebirth, cleared } = useGame();
  const [confirming, setConfirming] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-[720px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <PageHeader title={t('settings.title')} subtitle={t('settings.version')} />

        <section className="saga-panel mt-3 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground">
            <GameIcon name="Languages" className="h-3 w-3" />
            {t('settings.language')}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                className={`tap rounded-xl border px-2 py-2 text-[11px] ${
                  lang === l.id ? 'border-primary/45 bg-primary/[0.08] text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section className="saga-panel mt-3 p-3.5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-2">
              <p className="text-[8px] uppercase tracking-widest text-muted-foreground">{t('player.level')}</p>
              <p className="text-[14px] tabular-nums text-primary">{level}</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-2">
              <p className="text-[8px] uppercase tracking-widest text-muted-foreground">{t('player.rebirth')}</p>
              <p className="text-[14px] tabular-nums text-accent">{rebirth}</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-2">
              <p className="text-[8px] uppercase tracking-widest text-muted-foreground">{t('menu.progress')}</p>
              <p className="text-[14px] tabular-nums text-[#8EF0CF]">{cleared}/300</p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {[
              { to: '/stages', icon: 'Map', key: 'stages.title' },
              { to: '/formation', icon: 'Users', key: 'nav.formation' },
              { to: '/synthesis', icon: 'Sparkles', key: 'nav.synthesis' },
              { to: '/forge', icon: 'Hammer', key: 'nav.forge' },
            ].map((row) => (
              <Link
                key={row.to}
                to={row.to}
                className="tap flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[10.5px] text-foreground/85 hover:border-primary/30"
              >
                <GameIcon name={row.icon} className="h-3.5 w-3.5 text-primary/70" />
                {t(row.key)}
                <GameIcon name="ChevronRight" className="ml-auto h-3 w-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section className="saga-panel mt-3 p-3.5">
          <p className="text-[10px] tracking-wider text-muted-foreground">{t('settings.reset')}</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground">{t('settings.resetDesc')}</p>
          {confirming ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <GhostButton onClick={() => setConfirming(false)} className="py-2">
                {t('common.cancel')}
              </GhostButton>
              <GoldButton
                onClick={() => {
                  actions.resetSave();
                  setConfirming(false);
                }}
                className="py-2"
              >
                {t('common.confirm')}
              </GoldButton>
            </div>
          ) : (
            <GhostButton onClick={() => setConfirming(true)} className="mt-2 w-full py-2 text-rose-300/90">
              {t('settings.reset')}
            </GhostButton>
          )}
        </section>

        <p className="mt-4 text-center text-[9px] tracking-widest text-muted-foreground/60">
          {t('settings.credits')}
        </p>
      </div>
    </AppShell>
  );
}