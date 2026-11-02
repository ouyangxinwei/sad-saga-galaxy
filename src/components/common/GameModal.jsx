import { useEffect } from 'react';
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-6"
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
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[1.6rem] border border-white/12 bg-[#070a14]/96 shadow-[0_50px_140px_-50px_#000] sm:rounded-[1.6rem] ${width}`}
          >
            <div className="hairline absolute inset-x-0 top-0" />
            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-7">
              <div>
                <h2 className="saga-heading text-base text-foreground/95 sm:text-lg">{title}</h2>
                {subtitle ? <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}
              </div>
              <div className="flex items-center gap-2">
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
            <div className="saga-scroll flex-1 overflow-y-auto px-5 pb-6 pt-1 sm:px-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}