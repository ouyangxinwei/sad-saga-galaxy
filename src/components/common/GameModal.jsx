import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function GameModal({ open, onClose, title, subtitle, children, width = 'max-w-3xl', headerRight }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Render outside AppShell's stacking context so dialogs always sit above
  // the fixed bottom navigation and remain fully interactive on mobile.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center overflow-hidden px-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#03050d]/82 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 260, damping: 27 }}
            className={`relative flex min-h-0 max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-8px)] w-full flex-col overflow-hidden rounded-t-[1.6rem] border border-white/12 bg-[#070a14]/96 shadow-[0_50px_140px_-50px_#000] sm:max-h-[92vh] sm:rounded-[1.6rem] ${width}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="hairline absolute inset-x-0 top-0" />
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-7">
              <div className="min-w-0">
                <h2 className="saga-heading text-base text-foreground/95 sm:text-lg">{title}</h2>
                {subtitle ? <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {headerRight}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="close"
                  className="tap rounded-full border border-white/10 bg-white/5 p-2 text-muted-foreground hover:border-primary/40 hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="saga-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1 sm:px-7 sm:pb-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
