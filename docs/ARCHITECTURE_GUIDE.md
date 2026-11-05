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
