import { useEffect, useState } from 'react';
import CheckinDialog from '@/components/dialogs/CheckinDialog';
import MilestoneDialog from '@/components/dialogs/MilestoneDialog';
import SummonDialog from '@/components/dialogs/SummonDialog';
import GalleryDialog from '@/components/dialogs/GalleryDialog';
import IdleDialog from '@/components/dialogs/IdleDialog';
import PatchesDialog from '@/components/dialogs/PatchesDialog';
import ShopDialog from '@/components/dialogs/ShopDialog';
import FortuneDialog from '@/components/dialogs/FortuneDialog';
import TavernDialog from '@/components/dialogs/TavernDialog';
import EventDialog from '@/components/dialogs/EventDialog';
import TrialsDialog from '@/components/dialogs/TrialsDialog';

const PANELS = {
  checkin: CheckinDialog,
  milestone: MilestoneDialog,
  summon: SummonDialog,
  gallery: GalleryDialog,
  idle: IdleDialog,
  patches: PatchesDialog,
  shop: ShopDialog,
  fortune: FortuneDialog,
  tavern: TavernDialog,
  event: EventDialog,
  trials: TrialsDialog,
};

export default function HomePanels({ panel, onClose }) {
  const [last, setLast] = useState(null);

  useEffect(() => {
    if (panel) setLast(panel);
  }, [panel]);

  const key = panel || last;
  const Comp = key ? PANELS[key] : null;
  if (!Comp) return null;

  return <Comp open={!!panel} onClose={onClose} />;
}