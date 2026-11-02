# 开发手册补充：挂机系统 V1.1

## 代码入口
- `src/lib/GameContext.jsx`: IDLE_PASSIVES、idleBonusOf、idleRatesOf、idlePreview、claimIdle、toggleIdle。
- `src/lib/save.js`: idle.elapsedSeconds 默认值与旧存档 merge。
- `src/components/dialogs/IdleDialog.jsx`: 收益预览和队伍被动明细。
- `src/lib/i18n.js`: zh/ja/en 翻译。
- `src/lib/version.js`: v0.25 更新记录。
- `public/sw.js`: PWA cache v6。

## 数据与计算约定
- 存档键保持 `saga_galaxy_save_v20`，Schema 仍为 20；新增 `idle.elapsedSeconds` 为向后兼容字段。
- 当前队伍按 `state.party.slice(0,5)` 读取；卡牌必须在 `state.cards` 中标记拥有且能由 `getCardDef` 解析。
- 通过 `classOf(def.classId)` 解析职业，优先使用 `baseId`，确保进阶职业继承基础职业挂机被动。
- 分类加成相加，单类封顶 25%；收益仅调整原有金币、经验和主线推进率。
- 挂机时间使用 `elapsedSeconds + (Date.now() - idle.at)` 计算；暂停时固化秒数，领取时只扣除已结算秒数。

## 发布检查
执行 `npm run validate:version`、`npm run lint`、`npm run typecheck`、`npm run build`。GitHub Actions 的 Pages build/deploy 均成功后，才可将线上地址标记为 v0.25 已部署。
