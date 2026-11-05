/** 资源兑换的固定兑换倍率：每消耗 1 单位来源资源获得 2 单位目标资源。 */
export const RESOURCE_EXCHANGE_RATIO = 2;
/** 可作为兑换来源或目标的白名单；不在此列表的状态字段不能参与兑换。 */
export const EXCHANGEABLE_RESOURCES = [
 { key: 'gold', translationKey: 'res.gold' },
 { key: 'gems', translationKey: 'res.gems' },
 { key: 'idleGems', translationKey: 'res.idleGems' },
 { key: 'clearGems', translationKey: 'res.clearGems' },
 { key: 'tickets', translationKey: 'res.tickets' },
];
const RESOURCE_KEYS = new Set(EXCHANGEABLE_RESOURCES.map((item) => item.key));
/** 返回可兑换余额；仅接受白名单资源及正的安全整数余额。 */
export function getExchangeableBalance(state,key) {
 if (!RESOURCE_KEYS.has(key)) return 0;
 const value=Number(state?.[key]);
 return Number.isSafeInteger(value)&&value>0?value:0;
}
/** 纯计算/校验兑换结果，不修改 state；返回失败原因或支出、获得数量。 */
export function calculateResourceExchange(state,fromKey,toKey,amount) {
 if (!RESOURCE_KEYS.has(fromKey)||!RESOURCE_KEYS.has(toKey)) return {success:false,reason:'unsupported-resource'};
 if (fromKey===toKey) return {success:false,reason:'same-resource'};
 if (!Number.isSafeInteger(amount)||amount<=0) return {success:false,reason:'invalid-amount'};
 if (amount>getExchangeableBalance(state,fromKey)) return {success:false,reason:'insufficient-balance'};
 const received=amount*RESOURCE_EXCHANGE_RATIO, target=Number(state?.[toKey])||0;
 if (!Number.isSafeInteger(received)||!Number.isSafeInteger(target+received)) return {success:false,reason:'balance-overflow'};
 return {success:true,fromKey,toKey,spent:amount,received,ratio:RESOURCE_EXCHANGE_RATIO};
}
/** 应用已通过校验的兑换，追加最多保留 30 条的兑换历史记录。 */
export function applyResourceExchange(state,fromKey,toKey,amount,now=Date.now()) {
 const result=calculateResourceExchange(state,fromKey,toKey,amount);
 if(!result.success)return result;
 const history=Array.isArray(state.resourceExchangeHistory)?state.resourceExchangeHistory:[];
 const record={id:String(now)+'-'+String(history.length+1),at:now,fromKey,spent:amount,toKey,received:result.received,ratio:RESOURCE_EXCHANGE_RATIO};
 return {...result,state:{...state,[fromKey]:state[fromKey]-amount,[toKey]:(Number(state[toKey])||0)+result.received,resourceExchangeHistory:[...history,record].slice(-30)},record};
}
