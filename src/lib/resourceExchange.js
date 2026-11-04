export const RESOURCE_EXCHANGE_RATIO = 2;
export const EXCHANGEABLE_RESOURCES = [
 { key: 'gold', translationKey: 'res.gold' },
 { key: 'gems', translationKey: 'res.gems' },
 { key: 'idleGems', translationKey: 'res.idleGems' },
 { key: 'clearGems', translationKey: 'res.clearGems' },
 { key: 'tickets', translationKey: 'res.tickets' },
];
const RESOURCE_KEYS = new Set(EXCHANGEABLE_RESOURCES.map((item) => item.key));
export function getExchangeableBalance(state,key) {
 if (!RESOURCE_KEYS.has(key)) return 0;
 const value=Number(state?.[key]);
 return Number.isSafeInteger(value)&&value>0?value:0;
}
export function calculateResourceExchange(state,fromKey,toKey,amount) {
 if (!RESOURCE_KEYS.has(fromKey)||!RESOURCE_KEYS.has(toKey)) return {success:false,reason:'unsupported-resource'};
 if (fromKey===toKey) return {success:false,reason:'same-resource'};
 if (!Number.isSafeInteger(amount)||amount<=0) return {success:false,reason:'invalid-amount'};
 if (amount>getExchangeableBalance(state,fromKey)) return {success:false,reason:'insufficient-balance'};
 const received=amount*RESOURCE_EXCHANGE_RATIO, target=Number(state?.[toKey])||0;
 if (!Number.isSafeInteger(received)||!Number.isSafeInteger(target+received)) return {success:false,reason:'balance-overflow'};
 return {success:true,fromKey,toKey,spent:amount,received,ratio:RESOURCE_EXCHANGE_RATIO};
}
export function applyResourceExchange(state,fromKey,toKey,amount,now=Date.now()) {
 const result=calculateResourceExchange(state,fromKey,toKey,amount);
 if(!result.success)return result;
 const history=Array.isArray(state.resourceExchangeHistory)?state.resourceExchangeHistory:[];
 const record={id:String(now)+'-'+String(history.length+1),at:now,fromKey,spent:amount,toKey,received:result.received,ratio:RESOURCE_EXCHANGE_RATIO};
 return {...result,state:{...state,[fromKey]:state[fromKey]-amount,[toKey]:(Number(state[toKey])||0)+result.received,resourceExchangeHistory:[...history,record].slice(-30)},record};
}
