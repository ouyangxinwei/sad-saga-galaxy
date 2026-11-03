import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameModal from '@/components/common/GameModal';
import GameIcon from '@/components/common/GameIcon';
import { Bar, Chip } from '@/components/common/Bits';
import CardTile from '@/components/common/CardTile';
import CharacterDetailDialog from '@/components/dialogs/CharacterDetailDialog';
import { useGame } from '@/lib/GameContext';
import { CLASSES, ENEMIES, HEROES, MONSTER_TYPES, RARITY_COLOR } from '@/lib/gameData';
import { copiesOf } from '@/lib/cards';

export default function GalleryDialog({ open, onClose }) {
  const { t, lang, cards, cardCounts, codex, cardShards, enemyShards, ownedHeroCount, enemyUnlocked, defOf } = useGame();
  const navigate = useNavigate();
  const [tab, setTab] = useState('heroes');
  const [filter, setFilter] = useState('all');
  const [selectedHeroId, setSelectedHeroId] = useState(null);

  const genderFilters = [
    { id: 'all', label: t('common.all') },
    { id: 'female', label: t('gallery.female') },
    { id: 'male', label: t('gallery.male') },
    { id: 'none', label: t('gallery.none') },
  ];

  const heroList = HEROES.filter((h) => {
    if (filter === 'all') return true;
    if (['female', 'male', 'none'].includes(filter)) return h.gender === filter;
    return h.classId === filter;
  });

  const enemyList = ENEMIES.filter((e) => filter === 'all' || e.type === filter);

  return (
    <>
    <GameModal open={open && !selectedHeroId} onClose={onClose} title={t('gallery.title')} width="max-w-3xl">
      <div className="flex items-center gap-1.5">
        {[
          { id: 'heroes', label: t('gallery.heroes'), count: ownedHeroCount, max: HEROES.length },
          { id: 'enemies', label: t('gallery.enemies'), count: enemyUnlocked, max: ENEMIES.length },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => {
              setTab(tabItem.id);
              setFilter('all');
            }}
            className={`tap flex-1 rounded-xl border px-3 py-2 text-[11px] tracking-wide ${
              tab === tabItem.id ? 'border-primary/45 bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground'
            }`}
          >
            {tabItem.label}
            <span className="ml-1 tabular-nums text-[9px] opacity-80">
              {tabItem.count}/{tabItem.max}
            </span>
          </button>
        ))}
        <button
        type="button"
        onClick={() => {
          onClose?.();
          navigate('/synthesis?tab=fuse');
        }}
        className="tap flex shrink-0 items-center gap-1 rounded-xl border border-primary/40 bg-primary/10 px-2.5 py-2 text-[10px] tracking-wide text-primary"
        >
        <GameIcon name="Hammer" className="h-3 w-3" />
        {t('gallery.fuseEntry')}
        </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{t('gallery.progress')}</span>
        <Bar
          value={tab === 'heroes' ? ownedHeroCount : enemyUnlocked}
          max={tab === 'heroes' ? HEROES.length : ENEMIES.length}
          color={tab === 'heroes' ? '#E8C87A' : '#F0748F'}
          className="flex-1"
        />
      </div>

      <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
        <Chip color="#8B93A8" className="shrink-0">
          <button type="button" onClick={() => setFilter('all')} className={filter === 'all' ? 'text-primary' : ''}>
            {t('common.all')}
          </button>
        </Chip>
        {tab === 'heroes'
          ? genderFilters.slice(1).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFilter(g.id)}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] ${
                  filter === g.id ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground'
                }`}
              >
                {g.label}
              </button>
            ))
          : null}
        {(tab === 'heroes' ? CLASSES : MONSTER_TYPES).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] ${
              filter === item.id ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground'
            }`}
          >
            <GameIcon name={item.icon} className="h-2.5 w-2.5" />
            {item.name[lang] || item.name.zh}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {tab === 'heroes'
          ? heroList.map((h) => {
              const owned = !!cards[h.id];
              const copies = copiesOf({ cards, cardCounts }, h.id);
              return (
                <CardTile
                  key={h.id}
                  def={defOf(h.id)}
                  lang={lang}
                  size="sm"
                  locked={!owned}
                  badge={owned ? (copies > 1 ? `×${copies}` : null) : cardShards[h.id] ? `${cardShards[h.id]}/5` : null}
                  onClick={owned ? () => setSelectedHeroId(h.id) : undefined}
                />
              );
            })
          : enemyList.map((e) => {
              const kills = codex[e.id] || 0;
              return (
                <CardTile
                  key={e.id}
                  def={{ ...e, classId: 'stargazer', converted: true }}
                  lang={lang}
                  size="sm"
                  locked={!kills}
                  badge={kills ? `${kills}` : null}
                />
              );
            })}
      </div>

      {tab === 'enemies' ? (
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <p className="text-[10px] text-muted-foreground">{t('synth.convert')}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ENEMIES.filter((e) => (enemyShards[e.id] || 0) > 0).map((e) => (
              <span key={e.id} className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[9px]" style={{ color: RARITY_COLOR[e.rarity] }}>
                {e.name[lang] || e.name.zh} {enemyShards[e.id]}/5
              </span>
            ))}
            {!ENEMIES.some((e) => (enemyShards[e.id] || 0) > 0) ? (
              <span className="text-[10px] text-muted-foreground">{t('synth.empty')}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </GameModal>
    <CharacterDetailDialog
      cardId={selectedHeroId}
      open={!!selectedHeroId}
      onClose={() => setSelectedHeroId(null)}
    />
    </>
  );
}