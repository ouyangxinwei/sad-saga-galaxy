import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton, GhostButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';

export default function ShopDialog({ open, onClose }) {
  const { t, gems, medals, actions, stamina, staminaMax } = useGame();

  const items = [
    { id: 'stamina', icon: 'BatteryFull', color: '#F0748F', name: t('shop.stamina'), cost: 100, note: `${stamina}/${staminaMax}` },
    { id: 'ticket', icon: 'Ticket', color: '#6FE3C0', name: t('shop.ticket'), cost: 80, note: '' },
  ];

  return (
    <GameModal open={open} onClose={onClose} title={t('shop.title')} width="max-w-md">
      <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2">
        <span className="flex items-center gap-1.5 text-[11px] text-accent">
          <GameIcon name="Gem" className="h-3.5 w-3.5" />
          {gems.toLocaleString('en-US')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-primary">
          <GameIcon name="Trophy" className="h-3.5 w-3.5" />
          {medals}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
            <span className="rounded-lg border border-white/10 bg-black/25 p-2">
              <GameIcon name={item.icon} className="h-4 w-4" style={{ color: item.color }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] text-foreground/90">{item.name}</p>
              <p className="text-[9px] text-muted-foreground">{item.note}</p>
            </div>
            <GhostButton onClick={() => actions.buyShop(item.id)} className="shrink-0 px-2.5 py-1 text-[10px]">
              <span className="flex items-center gap-1">
                <GameIcon name="Gem" className="h-2.5 w-2.5 text-accent" />
                {item.cost}
              </span>
            </GhostButton>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.05] p-3">
        <p className="flex items-center gap-1.5 text-[11px] text-primary/90">
          <GameIcon name="Crown" className="h-3.5 w-3.5" />
          {t('shop.exchange')}
        </p>
        <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground">{t('shop.exchangeDesc')}</p>
        <GoldButton
          onClick={actions.exchangeMedals}
          disabled={medals < 40}
          className="mt-2.5 w-full py-2 text-[10px]"
        >
          {medals < 40 ? `${t('common.need')} 40 ${t('res.medals')}` : `${t('shop.sold')} ? 40`}
        </GoldButton>
      </div>
    </GameModal>
  );
}