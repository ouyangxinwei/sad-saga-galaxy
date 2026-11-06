// Settings and maintenance page: exposes language selection, local save export/import, and version information. Save validation and persistence are handled by the save layer.
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import PageHeader from '@/components/common/PageHeader';
import GameIcon from '@/components/common/GameIcon';
import { GhostButton, GoldButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { LANGS } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/version/index.js';

export default function Settings() {
  const { t, lang, setLang, actions, level, rebirth, cleared, testSupport, gems, tickets, stamina, staminaMax } = useGame();
  const [confirming, setConfirming] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');
  const [importText, setImportText] = useState('');
  const [importConfirming, setImportConfirming] = useState(false);
  const fileInputRef = useRef(null);
  const importIsHigher = importPreview
    ? importPreview.rebirth > rebirth
      || (importPreview.rebirth === rebirth && importPreview.level > level)
    : false;

  return (
    <AppShell>
      <div className="mx-auto max-w-[720px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
        <PageHeader title={t('settings.title')} subtitle={t('settings.version', { version: APP_VERSION })} />

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
          <p className="text-[10px] tracking-wider text-primary">{t('save.title')}</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground">{t('save.description')}</p>
          <GoldButton className="mt-3 w-full py-2" onClick={() => {
            try {
              const payload = actions.exportSave();
              const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'sad-saga-galaxy-save-' + new Date().toISOString().slice(0, 10) + '.json';
              document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
            } catch { setImportError(t('save.exportFailed')); }
          }}>{t('save.export')}</GoldButton>
          <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setImportError(''); setImportPreview(null); setImportConfirming(false);
              let fileReadCompleted = false;
              try {
                const raw = await file.text();
                fileReadCompleted = true;
                const result = actions.inspectSave(raw);
                setImportText(raw); setImportPreview({ ...result.metadata, fileName: file.name });
              } catch (error) {
                const messageKey = !fileReadCompleted
                  ? 'save.fileReadFailed'
                  : error?.message === 'unsupported-version' ? 'save.unsupported' : 'save.invalid';
                setImportError(t(messageKey));
              } finally { event.target.value = ''; }
            }} />
          <GhostButton className="mt-2 w-full py-2" onClick={() => fileInputRef.current?.click()}>{t('save.chooseFile')}</GhostButton>
          {importError ? <p className="mt-2 text-[9.5px] text-rose-300">{importError}</p> : null}
          {importPreview ? (
            <div className="mt-3 rounded-xl border border-primary/20 bg-white/[0.025] p-3">
              <p className="text-[10px] text-primary">{t('save.previewTitle')}</p>
              <p className="mt-1 break-all text-[9px] text-muted-foreground">{importPreview.fileName}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-white/[0.07] bg-black/10 p-2 text-[9.5px]">
                <div>
                  <p className="text-muted-foreground">{t('save.currentProgress')}</p>
                  <p className="mt-1">{t('player.rebirth')}: <strong className="text-accent">R{rebirth}</strong></p>
                  <p>{t('player.level')}: <strong className="text-primary">Lv.{level}</strong></p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('save.importProgress')}</p>
                  <p className="mt-1">{t('player.rebirth')}: <strong className="text-accent">R{importPreview.rebirth}</strong></p>
                  <p>{t('player.level')}: <strong className="text-primary">Lv.{importPreview.level}</strong></p>
                </div>
                <p className={importIsHigher ? 'col-span-2 text-emerald-300' : 'col-span-2 text-rose-300'}>
                  {t(importIsHigher ? 'save.importAllowed' : 'save.importRejected')}
                </p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[9.5px]">
                <p>{t('save.appVersion')}: <strong>{importPreview.appVersion}</strong></p>
                <p>{t('save.schemaVersion')}: <strong>{importPreview.saveSchemaVersion}</strong></p>
                <p>{t('save.characters')}: <strong>{importPreview.characterCount} ({importPreview.characterCopies})</strong></p>
                <p>{t('res.gold')}: <strong>{importPreview.gold.toLocaleString('en-US')}</strong></p>
                <p>{t('res.gems')}: <strong>{importPreview.gems.toLocaleString('en-US')}</strong></p>
                <p>{t('res.tickets')}: <strong>{importPreview.tickets.toLocaleString('en-US')}</strong></p>
                <p>{t('res.stamina')}: <strong>{importPreview.stamina}</strong></p>
                <p>{t('res.medals')}: <strong>{importPreview.medals}</strong></p>
                <p>{t('stages.normal')}: <strong>{importPreview.normal}</strong></p>
                <p>{t('stages.hard')}: <strong>{importPreview.hard}</strong></p>
                <p>{t('stages.nightmare')}: <strong>{importPreview.nightmare}</strong></p>
                <p>{t('save.totalCleared')}: <strong>{importPreview.cleared}</strong></p>
                <p>{t('save.tower')}: <strong>{importPreview.tower}</strong></p>
                <p>{t('save.eventClears')}: <strong>{importPreview.eventClears}</strong></p>
              </div>
              <p className="mt-2 text-[9px] leading-relaxed text-rose-300">{t('save.warning')}</p>
              {importConfirming ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <GhostButton className="py-2" onClick={() => setImportConfirming(false)}>{t('common.cancel')}</GhostButton>
                  <GoldButton className="py-2" onClick={() => {
                    const result = actions.restoreSave(importText);
                    if (result.success) {
                      setImportPreview(null);
                      setImportText('');
                      setImportConfirming(false);
                      setImportError('');
                    } else {
                      const messageKey = {
                        'progress-not-higher': 'save.progressNotHigher',
                        'current-save-invalid': 'save.currentSaveInvalid',
                        'current-save-read-failed': 'save.currentSaveReadFailed',
                        'storage-write-failed': 'save.storageFailed',
                      }[result.reason] || 'save.importFailed';
                      setImportError(t(messageKey));
                      setImportConfirming(false);
                    }
                  }}>{t('save.confirmRestore')}</GoldButton>
                </div>
              ) : <GoldButton className="mt-3 w-full py-2" disabled={!importIsHigher} onClick={() => setImportConfirming(true)}>{t('save.restore')}</GoldButton>}
            </div>
          ) : null}
        </section>

        <section className="saga-panel mt-3 p-3.5">
          <p className="text-[10px] tracking-wider text-primary">{t('testSupport.title')}</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground">{t('testSupport.grant')}</p>
          <p className="mt-2 text-[9.5px] text-muted-foreground">
            {testSupport?.active
              ? t('testSupport.active', { days: testSupport.daysRemaining })
              : t('testSupport.expired')}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/[0.03] py-2">
              <p className="text-[8px] text-muted-foreground">{t('res.tickets')}</p>
              <p className="text-[12px] tabular-nums">{tickets.toLocaleString('en-US')}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] py-2">
              <p className="text-[8px] text-muted-foreground">{t('res.gems')}</p>
              <p className="text-[12px] tabular-nums">{gems.toLocaleString('en-US')}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] py-2">
              <p className="text-[8px] text-muted-foreground">{t('res.stamina')}</p>
              <p className="text-[12px] tabular-nums">{stamina}/{staminaMax}</p>
            </div>
          </div>
          <GoldButton
            onClick={() => actions.refillTestStamina()}
            disabled={!testSupport?.active || stamina >= staminaMax}
            className="mt-2 w-full py-2"
          >
            {t('testSupport.refill')}
          </GoldButton>
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
              { to: '/debug', icon: 'Bug', key: 'Debug Console' },
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
                  if (actions.resetSave()) setConfirming(false);
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