import { useMemo,useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '@/components/common/AppShell';
import PageHeader from '@/components/common/PageHeader';
import GameIcon from '@/components/common/GameIcon';
import { GoldButton,GhostButton } from '@/components/common/Bits';
import { useGame } from '@/lib/GameContext';
import { EXCHANGEABLE_RESOURCES,RESOURCE_EXCHANGE_RATIO,getExchangeableBalance } from '@/lib/resourceExchange';
export default function ResourceExchange() {
 const {t,actions,...state}=useGame();
 const [fromKey,setFromKey]=useState('gold'),[toKey,setToKey]=useState('gems'),[amountText,setAmountText]=useState('1');
 const amount=/^\d+$/.test(amountText)?Number(amountText):0,balance=getExchangeableBalance(state,fromKey);
 const valid=Number.isSafeInteger(amount)&&amount>0&&amount<=balance&&fromKey!==toKey,received=valid?amount*RESOURCE_EXCHANGE_RATIO:0;
 const history=useMemo(()=>[...(state.resourceExchangeHistory||[])].reverse(),[state.resourceExchangeHistory]);
 const fmt=(v)=>Number(v||0).toLocaleString('en-US'),name=(key)=>t(EXCHANGEABLE_RESOURCES.find(x=>x.key===key)?.translationKey||key);
 return <AppShell><div className="mx-auto max-w-[720px] px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
  <PageHeader title={t('resourceExchange.title')} subtitle={t('resourceExchange.subtitle')}/>
  <section className="saga-panel mt-3 space-y-3 p-3.5">
   <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-3 text-center"><p className="text-[10px] text-muted-foreground">{t('resourceExchange.ratio')}</p><p className="saga-display mt-1 text-3xl text-primary">1 : {RESOURCE_EXCHANGE_RATIO}</p><p className="mt-1 text-[9px] text-muted-foreground">{t('resourceExchange.ratioHint')}</p></div>
   <div><label className="mb-1.5 block text-[10px] text-muted-foreground">{t('resourceExchange.from')}</label><select value={fromKey} onChange={e=>{const next=e.target.value;setFromKey(next);if(next===toKey)setToKey(EXCHANGEABLE_RESOURCES.find(x=>x.key!==next)?.key||'gems')}} className="w-full rounded-xl border border-white/10 bg-[#111629] px-3 py-3 text-xs text-foreground">{EXCHANGEABLE_RESOURCES.map(x=><option key={x.key} value={x.key}>{name(x.key)} · {fmt(getExchangeableBalance(state,x.key))}</option>)}</select></div>
   <div className="flex justify-center"><span className="rounded-full border border-primary/20 bg-primary/[0.06] p-2 text-primary"><GameIcon name="ArrowRight" className="h-4 w-4 rotate-90"/></span></div>
   <div><label className="mb-1.5 block text-[10px] text-muted-foreground">{t('resourceExchange.to')}</label><select value={toKey} onChange={e=>setToKey(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111629] px-3 py-3 text-xs text-foreground">{EXCHANGEABLE_RESOURCES.map(x=><option key={x.key} value={x.key} disabled={x.key===fromKey}>{name(x.key)} · {fmt(getExchangeableBalance(state,x.key))}</option>)}</select></div>
   <div><label className="mb-1.5 block text-[10px] text-muted-foreground">{t('resourceExchange.amount')}</label><input type="number" min="1" step="1" inputMode="numeric" value={amountText} onChange={e=>setAmountText(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center text-lg tabular-nums text-foreground outline-none focus:border-primary/50"/><div className="mt-2 grid grid-cols-4 gap-2">{[1,10,100].map(n=><GhostButton key={n} className="py-2" onClick={()=>setAmountText(String(n))}>{n}</GhostButton>)}<GhostButton className="py-2" onClick={()=>setAmountText(String(balance))}>{t('resourceExchange.max')}</GhostButton></div><p className="mt-2 text-right text-[9px] text-muted-foreground">{t('resourceExchange.available')}: {fmt(balance)}</p></div>
   <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 space-y-2"><div className="flex justify-between text-[10px]"><span className="text-muted-foreground">{t('resourceExchange.spend')} · {name(fromKey)}</span><strong>{valid?fmt(amount):'—'}</strong></div><div className="flex justify-between text-[10px]"><span className="text-muted-foreground">{t('resourceExchange.receive')} · {name(toKey)}</span><strong className="text-emerald-300">{valid?'+'+fmt(received):'—'}</strong></div></div>
   <GoldButton className="w-full py-3" disabled={!valid} onClick={()=>actions.exchangeResources(fromKey,toKey,amount)}>{t('resourceExchange.confirm')}</GoldButton>
   {fromKey===toKey?<p className="text-center text-[9px] text-rose-300">{t('resourceExchange.sameResource')}</p>:null}
   {!valid&&amount>balance?<p className="text-center text-[9px] text-rose-300">{t('resourceExchange.insufficient')}</p>:null}
   <p className="text-center text-[9px] leading-relaxed text-muted-foreground">{t('resourceExchange.testWarning')}</p>
  </section>
  <section className="saga-panel mt-3 p-3.5"><div className="flex items-center justify-between"><h2 className="text-[11px] text-primary">{t('resourceExchange.history')}</h2><span className="text-[9px] text-muted-foreground">{history.length}/30</span></div>
   {history.length?<div className="mt-3 space-y-2">{history.map(r=><div key={r.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"><div className="flex justify-between gap-2 text-[9px] text-muted-foreground"><span>{new Date(r.at).toLocaleString()}</span><span>1 : {r.ratio||RESOURCE_EXCHANGE_RATIO}</span></div><div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]"><span>{name(r.fromKey)} -{fmt(r.spent)}</span><GameIcon name="ArrowRight" className="h-3 w-3 text-primary"/><span className="text-emerald-300">{name(r.toKey)} +{fmt(r.received)}</span></div></div>)}</div>:<p className="mt-3 text-center text-[10px] text-muted-foreground">{t('resourceExchange.empty')}</p>}
  </section><Link to="/settings" className="mt-3 flex items-center justify-center gap-1 py-2 text-[10px] text-muted-foreground"><GameIcon name="ChevronRight" className="h-3 w-3 rotate-180"/>{t('settings.title')}</Link>
 </div></AppShell>;
}
