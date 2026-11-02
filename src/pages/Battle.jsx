import { useSearchParams } from 'react-router-dom';
import BattleArena from '@/components/battle/BattleArena';

export default function Battle() {
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'normal';
  const n = Number(params.get('stage') || 1);
  const run = params.get('r') || '0';

  return <BattleArena key={`${mode}-${n}-${run}`} mode={mode} n={n} />;
}