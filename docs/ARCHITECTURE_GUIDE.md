# Sad Saga Galaxy — 核心架构导读

> Phase 1 注释版。本文用于建立代码阅读路径；具体实现以当前分支源码为准。

## 1. 应用启动与组件组合

入口链路：

`index.html → src/main.jsx → src/App.jsx → GameProvider → 页面`

- **main.jsx**：创建 React root、安装诊断日志捕获、生产环境注册 Service Worker。
- **App.jsx**：组合 QueryClientProvider、GameProvider、HashRouter、页面路由与全局 Toaster。
- **GameContext.jsx**：向页面提供玩家状态和业务操作。
- 页面组件负责展示与用户交互，业务计算尽量委托给 `src/lib/`。

GitHub Pages 使用仓库子路径部署。Vite 的 `BASE_URL` 会影响资源与 Service Worker 地址，不要随意改成根路径。

## 2. 全局状态与数据流

主要链路：

`页面事件 → GameContext action → commit() → normalize → ref/state → save.persist()`

- `state`：React 状态，驱动页面重新渲染。
- `ref.current`：同步保存最新状态，供回调和连续业务操作读取，避免闭包旧值。
- `commit(fn)`：统一生成新状态，执行角色成长与阵型状态归一化，再同步更新 ref 和 state。
- `useEffect([state])`：状态变化后调用 `persist(state)` 写入本地存档。
- 页面不应自行改写 Context 内部状态，也不应绕过存档模块直接操作玩家存档 key。

修改状态更新机制时，必须确认 ref 与 state 始终指向同一份最新业务状态。

## 3. 存档与兼容

核心文件：`src/lib/save.js`

职责：
- 创建默认状态。
- 从当前浏览器 localStorage 读取并归一化存档。
- 持久化完整状态。
- 重置/替换存档。
- 导出、检查和恢复备份。

重要区别：
- 应用版本（package.json）用于标识程序发布版本。
- `SAVE_SCHEMA_VERSION` 用于标识玩家存档结构版本，两者不能混用。
- 新增存档字段时，应同时补充默认值、旧档归一化和导入归一化。
- 导入流程先校验和迁移，再写入；不要在校验完成前覆盖现有存档。
- 日志存储与玩家存档分离，清理诊断日志不应清除玩家进度。

## 4. 诊断日志

核心文件：`src/lib/logger.js`

- `logInfo` / `logWarn`：记录业务信息与警告。
- `traceSync`：为同步/异步调用记录开始、完成、耗时和异常。
- `traceId`：关联同一业务调用链中的嵌套记录。
- 日志写入当前设备的独立 localStorage key，最多保留 2000 条。
- 日志模块是诊断设施，不应改变奖励、战斗或存档业务结果。

## 5. 业务模块定位

| 模块 | 主要职责 |
|---|---|
| `gameData.js` | 角色、敌人、关卡、基础静态数据与基础规则 |
| `cards.js` | 卡牌定义、角色/队伍战力计算 |
| `equipment.js` | 装备定义、穿戴与装备状态处理 |
| `characterProgression.js` | 角色经验、突破、融合等成长规则 |
| `formationSystem.js` | 阵型配置、位置与阵型状态归一化 |
| `stageProgression.js` | 关卡胜利后的推进规则 |
| `desperateCombat.js` | 战斗概率与特殊战斗机制 |
| `idleRewards.js` | 挂机时间与挂机资源掉落计算 |
| `clearGemSystem.js` | 通关宝石结算与统计 |
| `resourceExchange.js` | 资源兑换规则 |
| `i18n.js` | 中/日/英文案翻译 |
| `version/` | 应用版本、版本历史和版本展示数据 |

GameContext 负责把这些模块组合成玩家实际操作；独立模块负责可复用的业务计算。

## 6. 关键业务调用路径

### 战斗
页面（Battle）触发战斗 → 战斗模块执行单位行动与结算 → GameContext 的战斗完成 action → 更新玩家进度/奖励 → commit → save。

### 挂机
页面或定时触发挂机结算 → GameContext 计算已完成小时数 → idleRewards 计算各类独立掉落 → grant/更新材料与统计 → commit → save。

### 阵型
Formation 页面提交选择或换位 → GameContext 阵型 action → formationSystem 校验/归一化 → commit → save。阵型数据和当前上阵名单是不同概念。

### 存档恢复
用户选择备份 → save.js 校验格式与 schema → 归一化为当前状态 → 成功后写入 localStorage → 应用状态重新加载/同步。恢复前不应破坏原存档。

## 7. 修改代码时的安全检查

1. 先确认业务规则所在的独立模块，再检查 GameContext 如何调用。
2. 涉及存档字段时，同时检查默认状态、旧档迁移和导入归一化。
3. 涉及奖励时，检查正常战斗、失败结算、挂机补算是否存在重复发放风险。
4. 涉及角色/阵型时，检查队伍变更后归一化结果。
5. 涉及语言时，检查中、日、英三套文案。
6. 注释必须描述源码当前行为；规则变化后同步更新注释和文档。

## 8. Phase 1 覆盖范围

本阶段为 App 入口、GameContext、save、logger、main 增加模块/关键函数说明，并新增本架构导读。只增加注释和文档，不改变业务计算、存档结构、UI 或运行时行为。


## 9. Phase 2 — 战斗系统阅读指南

### 9.1 战斗数据准备

`cards.js → partyUnits(state, fortune)` 将当前队伍转换为战斗单位：
- `cardStats` 计算角色个人面板属性。
- 玩家等级团队加成只在组装战斗单位时应用一次。
- 幸运效果、阵型基础属性、技能效果和概率加成在此汇总。
- `formationBonus`、`formationEffects` 等字段随后由战斗模拟消费。

不要把 `cardStats` 的个人面板与 `partyUnits` 的最终战斗属性混为一谈。

### 9.2 战斗模拟主链路

`simulateBattle → simulateImpl → orderBattleUnits → act → damage/heal → events`

- `makeUnit`：补齐战斗运行时字段（MP、护盾、存活标记、概率上限等）。
- `orderBattleUnits`：先按速度排序；阵型指定行动顺序时，仅调整我方单位在行动序列中的槽位。
- `act`：触发装备回合事件、AI 选技能、扣除 MP、选择目标并结算动作。
- `damage`：单次命中结算闪避、普通暴击、伤害减免、护盾、装备触发和死亡/复活。
- 多段技能通过多次调用 `damage` 生成逐段事件，不能把多段误认为一次总伤害。
- `applyEvent` 只把已经结算的事件投影到 UI live 状态，不重新计算伤害。

### 9.3 普通概率与濒危概率

- 普通暴击由战斗单位的 `crit`、技能 `critBonus` 和阵型追击加成参与计算。
- 濒危暴击由 `desperateCombat.js` 判断：我方存活角色 HP 比例低于 20% 才具备资格。
- 濒危闪避要求我方存活角色 HP 比例低于 10%。
- 濒危暴击和濒危闪避的基础概率由角色基础属性相对全体角色平均值派生，并带有基于角色 ID 的稳定微调。
- 战斗时才执行随机掷骰；角色详情展示模块只汇总概率，不执行随机判定。
- 阵型概率加成以百分点字段单独传递，不应与属性百分比混用。

### 9.4 阵型效果分层

`formationSystem.js` 分别派生三类效果：
1. `getFormationStatBonuses`：HP、ATK、DEF、SPD、MP。
2. `getFormationEffectBonuses`：技能伤害/效果、减伤、MP 消耗、行动顺序。
3. `getFormationCombatBonuses`：普通/濒危暴击、闪避及条件概率。

`cards.js` 负责把这些效果注入战斗单位；`battle.js` 负责在正确的结算节点消费它们。

### 9.5 关卡推进

`stageProgression.js` 统一处理主线胜利后的进度与下一场关卡：
- Boss 胜利后解锁后续四个小关。
- 下一场实际战斗进入下一个 Boss 关。
- 被跳过的小关不会在推进函数中自动产生战斗奖励。
- tower/event 模式不走普通主线下一关逻辑。

### 9.6 角色详情概率

`characterCombatDisplay.js` 优先读取实际 battleUnit 最终概率，并保留基础、装备、幸运、阵型等来源拆分。条件闪避同时返回是否已激活，避免把条件加成错误显示为当前有效概率。

### 9.7 修改战斗逻辑时的联动检查

- 改属性来源：检查 `cards.js` 与角色详情统计，防止团队加成重复计算。
- 改概率阈值/上限：检查 `desperateCombat.js`、`battle.js`、`characterCombatDisplay.js` 与概率专项测试。
- 改阵型效果：检查 `formationSystem.js`、`cards.js`、`battle.js` 和角色详情展示。
- 改事件结构：检查 `applyEvent` 与战斗 UI 的事件消费组件。
- 改 Boss 跳关：检查 `stageProgression.js` 及普通/困难/超困难模式的专项测试。

Phase 2 只补充注释和架构文档，不修改战斗数值、概率、结算顺序、存档或 UI 行为。


## 10. Phase 3 — 角色成长、装备与资源系统阅读指南

### 10.1 角色属性汇总（`src/lib/cards.js`）

角色面板不是单一来源，主要计算链路为：

`getCardDef → cardStats → characterStatBreakdown / partyUnits`

- `getCardDef`：解析内置 HERO 或存档中的自定义角色定义。
- `cardStats`：合并角色基础属性、角色实例成长、玩家等级成长、装备加成与突破固定属性。
- `partyUnits`：把当前队伍转换成战斗单位，并在此处加入玩家团队加成、幸运与阵型效果。
- `partyPower`：用于界面展示/比较的估算战力，不等于战斗模拟结果。

排查属性不一致时，先确认比较的是个人面板还是最终战斗单位；不要把玩家团队加成重复加到 `cardStats`。

### 10.2 独立角色成长（`src/lib/characterProgression.js`）

`characterProgression.instances[instanceId]` 为每张重复角色卡保存独立成长记录。角色卡定义 ID 仍用于队伍与碎片归属，实例 ID 用于区分重复卡。

- `normalizeCharacterProgressionState`：依据旧存档的持有数量补齐实例，并归一化已有记录；不会在这里删除实例。
- `addCharacterExperience`：按当前等级经验需求升级；达到等级上限后保留剩余经验。
- `grantPartyCharacterExperience`：只给上阵角色发经验，每个角色 ID 只选最强的一个实例。
- `strongestCharacterInstance`：按等级、经验、突破次数等稳定规则选择最强实例，角色属性计算也使用该选择结果。
- `breakthroughCharacter`：必须达到当前等级上限，并消耗角色自身碎片与金币；突破保留等级、上限增加 10，并累加职业对应固定属性。
- `previewFusionCharacterProgression` / `fuseCharacterProgressionInstances`：融合时优先消耗较弱来源实例，并在被消耗来源与已有结果实例之间保留成长最高者。

### 10.3 装备与遗物（`src/lib/equipment.js`）

`getEquipmentDefinition → getEquippedItem → getEquipmentBonuses / getEquipmentEffects` 是读取链路；`normalizeEquipmentState` 与 `equipItem` 负责状态校验。

- 装备槽位为 weapon、armor、relic；库存分别来自 equipmentInventory 与 relics。
- 装备属性加成以加法汇总，最后按 LIMITS 限制部分概率/效果属性的上限。
- `getEquipmentEffects` 只收集装备声明的事件效果，实际触发由战斗系统消费。
- 归一化兼容旧版仅保存遗物字符串的 equipped 格式，并防止同一件物品被多个角色重复穿戴。

改装备字段时，要同步检查静态装备目录、属性汇总、战斗事件消费和旧存档兼容测试。

### 10.4 重置与资源兑换

- `resetState.js`：`createResetState` 基于默认状态创建重置状态；`persistResetState` 负责序列化写入指定 storage key，并以布尔值报告写入是否成功。
- `resourceExchange.js`：白名单定义可兑换资源；`getExchangeableBalance` 校验余额；`calculateResourceExchange` 纯计算并校验，不修改状态；`applyResourceExchange` 才真正扣除/增加资源并记录最多 30 条历史。

排查资源数量时，区分“计算预览”与“正式应用”；兑换历史属于玩家状态的一部分，应检查对应存档归一化与测试。

### 10.5 Phase 3 覆盖范围

本阶段仅为角色属性、独立成长、突破/融合、装备、重置和资源兑换模块补充模块说明、关键函数注释与本阅读指南。不得改变成长公式、消耗数量、资源倍率、装备效果、状态结构、存档兼容或运行时行为。


## 11. Phase 4 — 挂机、通关宝石与资源循环阅读指南

### 11.1 挂机掉落纯计算（`src/lib/idleRewards.js`）

`getCompletedIdleHours → rollIdleResourceDrops`：

- `getCompletedIdleHours` 只统计完整小时，不足一小时的时间会继续累计。
- `rollIdleResourceDrops` 按小时循环，并对 `gems`、`clearGems`、`tickets` 分别调用随机函数。
- 每种资源的 30% 判定彼此独立；同一小时可以同时掉落多种资源，也可能全部未掉落。
- 函数返回掉落数量汇总，不直接修改玩家状态；测试可注入 random 函数固定结果。

### 11.2 挂机收益编排（`src/lib/GameContext.jsx`）

`idleStageOf → idleBonusOf → idleRatesOf` 负责确定挂机收益档位与每小时收益：

- 挂机收益按当前已推进的难度/关卡档位计算。
- 只读取当前队伍前五个位置的挂机被动；挂机被动与战斗被动是两套机制。
- `idlePreview` 只生成预览，不领取、不写入资源。
- `claimIdle` 负责手动领取并统一提交资源变化。
- `processIdleAutoRewards` 负责自动结算完整小时；定时 effect 会周期性调用它。
- `toggleIdle` 在暂停/恢复计时前先处理已完成的整小时收益，剩余秒数继续累计。

### 11.3 通关宝石快速结算（`src/lib/clearGemSystem.js`）

- `normalizeClearGemBatch` 将请求值限制在系统支持的批量档位。
- `getClearGemSettlementCount` 将请求数量限制为玩家实际持有数量。
- `isStageCleared` 验证关卡是否在指定模式的已通关进度范围内。
- 这些函数只负责规则校验与数量计算；实际资源扣除、奖励发放、统计和历史记录由 GameContext 的 `quickClear` 统一完成。

### 11.4 战斗掉落与资源统计（`src/lib/GameContext.jsx`）

`finishBattle` 是战斗结束后的奖励入口。胜利与失败分支分别更新对应的挂机宝石/通关宝石统计、历史记录及其他奖励；阅读时要区分“掉落判定”“资源余额变化”和“统计记录”三个动作，避免重复发放。

### 11.5 存档生命周期（`src/lib/save.js`）

- `defaultState`：创建 V20 默认玩家状态，包含资源、挂机计时、掉落统计与历史等默认字段。
- `loadState`：读取本地 JSON，与默认状态合并并执行阵型、装备、角色成长归一化。
- `persist`：将完整状态写入 V20 localStorage key；读取异常时的写入保护用于避免默认状态覆盖损坏的原始存档。
- `replaceSave` / `resetState`：分别负责写入替换状态和创建重置状态。
- `exportSaveData` / `inspectSaveData` / `restoreSaveData`：备份导出、只读检查与校验后恢复；恢复流程先验证和归一化，再触碰当前存档。

### 11.6 Phase 4 阅读时的关键边界

页面不直接修改资源余额；独立模块负责纯计算/校验，GameContext 编排业务状态变化，save.js 负责持久化。涉及挂机或资源的修改必须同时检查整小时累计、手动领取、自动领取、战斗奖励、快速通关和存档恢复路径。

Phase 4 仅增加模块/函数注释与架构阅读文档，不改变挂机收益公式、30% 独立掉落概率、通关宝石批量规则、奖励数量、V20 存档字段、函数名称或 UI 行为。


## Phase 5 — 页面、多语言、版本与发布基础设施

本阶段只补充阅读注释与架构说明，不改变页面行为、游戏规则、数据结构或部署参数。

### 页面入口（src/pages）

- `Home.jsx`：主页组合层，组织顶部操作栏、玩家状态、快捷阵型、命运卡片、主菜单和主页弹窗。
- `Battle.jsx`：战斗 URL 适配层，从查询参数读取模式、关卡与运行标识，再挂载战斗场景；战斗规则由战斗模块负责。
- `Stages.jsx`：关卡选择与进度展示层；读取本地记忆的模式/关卡选择，根据存档进度计算解锁状态，具体结算委托给 GameContext。
- `Formation.jsx`：阵容槽位、预设、筛选和角色详情的交互入口；阵容变更通过统一 actions 执行。
- `Synthesis.jsx`：卡片合成、融合、转换和转生的展示入口；预览计算与最终操作分离，真正写入状态由 actions 执行。
- `Forge.jsx`：装备/遗物库存、穿戴槽位、效果说明和穿戴前后属性预览；实际装备状态由装备逻辑与统一状态层维护。
- `Settings.jsx`：语言选择、本地存档导入导出和版本信息入口；存档检查、解析和持久化交由 save 层处理。
- `Debug.jsx`：本地日志和警告诊断入口；订阅 logger 事件，清理诊断日志不会清理游戏存档。

### 公共界面组件

- `AppShell.jsx`：统一页面外框，组合星空背景、页面内容与可选底部导航。
- `BottomNav.jsx`：根据当前路由确定选中项，导航标题通过 i18n key 获取。
- `src/components/common/`、`home/`、`battle/`、`dialogs/` 等目录按可复用界面、主页区块、战斗展示和弹窗职责拆分。
- `src/components/ui/` 是基础 UI 原语层；业务页面优先组合这些组件，不应把游戏规则放入纯展示控件。

### 多语言（src/lib/i18n.js）

- `LANGS` 是设置页可选语言清单；`LANG_LOCALE` 提供对应的标准 locale 标识。
- `S` 是以稳定 key 为索引的文案字典，每个 key 应提供中文、日文、英文。
- 文案中的插值占位符（例如 `{count}`）必须与调用处传入的参数名称一致；新增文案应同步三种语言，避免回退语言导致页面出现缺字。

### 版本管理（src/lib/version/）

- `metadata.js` 是当前应用版本、发布日期、发布渠道和版本系统标识的单一来源。
- `releases.js` 保存按新到旧排列的多语言版本说明；历史记录应保留，不要覆盖旧版本条目。
- `index.js` 汇总公开 API，提供当前版本、指定版本说明和版本总览的只读查询。
- `validation.js` 检查版本格式、package 版本一致性、版本顺序、三语言文案完整性、历史缺口和缓存版本标记。
- `history-audit.js` 记录已知的历史版本缺口/重复项；它用于说明数据边界，不代表可以推测或补造历史发布记录。

### PWA 与离线缓存

- `public/manifest.webmanifest` 是 JSON 格式的 Web App Manifest，声明应用名称、启动地址、作用域、显示模式、主题颜色和图标。JSON 不支持注释，因此其字段含义集中记录在本指南。
- `public/sw.js` 的 install 阶段预缓存应用入口、manifest、图标和构建产物；activate 阶段清除同前缀的旧缓存并接管页面；fetch 阶段优先使用缓存，并为导航请求提供离线入口回退。
- Service Worker 缓存名带显式版本号。若将来修改预缓存资源或缓存策略，应按发布流程调整缓存版本，避免客户端持续使用旧资源。
- PWA 缓存仅负责静态应用资源，不等同于云端存档；当前游戏进度仍由本地存档层管理。

### Vite 与 GitHub Pages 部署

- `vite.config.js` 中的 `base` 必须与项目站点路径 `/sad-saga-galaxy/` 对应；`@` alias 指向 `src/`。
- `.github/workflows/deploy-pages.yml` 只监听 `standalone-migration` 分支推送或手动触发。
- 工作流先检出代码、配置 Node、安装依赖并运行指定测试，再生成 `dist/`；只有 build 成功后才上传 Pages artifact 并执行 deploy。
- 构建时注入 Git commit SHA 与分支名，便于应用显示/诊断当前部署来源。
- `public/manifest.webmanifest` 是静态配置，不应把它当作 React 组件或在 JSON 中添加注释。

### Phase 5 变更边界

本阶段只新增文件头部说明和本节文档；未修改业务逻辑、数值、概率、公式、存档 schema、函数名称、页面布局/交互、多语言文案内容、PWA 缓存策略、Vite base 或 GitHub Actions 执行步骤。JSON manifest 保持原样，因为 JSON 不支持注释。
