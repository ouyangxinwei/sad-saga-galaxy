# PWA 安装兼容性修复 V29

- 应用版本：v0.29（package 0.29.0）
- 日期：2026-11-03
- 分支：`standalone-migration`
- 游戏地址：https://ouyangxinwei.github.io/sad-saga-galaxy/

## 修复内容

1. `index.html` 原 favicon 路径引用 `oooo-icon.svg`，但 `public/` 中不存在该文件；现改为实际存在的 `oooo-icon-192.svg`。
2. `public/sw.js` 安装阶段原本会对缺失的 `oooo-icon.svg` 执行 `cache.addAll()`。该资源返回 404 时，整个 install 预缓存步骤会失败。现移除这条不存在的资源引用。
3. `manifest.webmanifest` 的图标路径与实际文件名一致，保留 192×192、512×512 SVG 图标。
4. Service Worker 缓存版本由 v9 升级为 v10。
5. 不更改 `saga_galaxy_save_v20`、schema version 20、游戏逻辑、PWA start_url/scope 或应用 ID。

## Android 安装步骤

部署完成后，在 Android 手机上用 Chrome 打开游戏 HTTPS 地址：
1. 打开游戏并等待页面加载完成。
2. 点击 Chrome 右上角「⋮」菜单。
3. 选择「安装应用」；若菜单显示「添加到主屏幕」，也可选择并按系统提示完成。
4. 安装后从桌面图标启动，确认以独立应用窗口打开。

若菜单仍未出现：
- 确认使用 Chrome，而非社交软件内置浏览器。
- 保持联网打开页面，等待 Service Worker 注册和更新完成，再刷新一次。
- 检查 Chrome 是否已有同一 PWA 安装；若已安装，菜单可能显示「打开应用」。
- 安装入口由浏览器按自身条件决定，不保证自动弹窗。

## 验证边界

- GitHub Actions 构建和 Pages 部署成功后，才视为线上发布完成。
- 还需在真实 Android Chrome 检查 Manifest、Service Worker 注册状态和安装菜单。
- 本次修复解决源码中可确认的缺失图标引用；未声称已在用户手机完成实际安装测试。

## 累计变更履历（V01–V29）

- **V01**：初始迁移审查，识别 oooo 集成边界。
- **V02**：初步审查依赖与平台边界，分类保留项、复核项和候选移除项。
- **V03**：扩大静态源码与导入关系审查，覆盖 120 个受跟踪的 `src/` 文件、UI 包装、路由、存档机制和构建配置。
- **V04**：复核独立应用入口、闲置 oooo Auth/MFA/OAuth 子系统、用户元数据、SDK/API 引用与本地存档路径。
- **V05**：移除闲置 oooo 认证相关文件和 SDK/Vite 包及项目元数据；更新应用名称、图标和 README；审查七个路由与 v20 存档契约；加入 PWA manifest、SVG 图标、Service Worker、离线导航回退和资源预缓存。
- **V06**：验证 GitHub Actions 构建/部署，并审查七个路由及残留 oooo 引用；浏览器 Console/Network 和手动交互仍未验证。
- **V07**：按用户要求暂缓真实浏览器 v20 旧存档读写测试；保持原本地存档键、结构与游戏逻辑。
- **V08**：复核 PWA manifest 与 Service Worker；修正 Vite Base URL 资源引用；补充安装和离线验证说明。
- **V09**：完成七个页面的静态玩法回归审查，增加手动测试矩阵。
- **V10**：共用游戏弹窗移至 document portal，改善移动端层级、动态视口、安全区和滚动。
- **V11**：统一版本管理和中/日/英更新记录；加入构建前版本/翻译校验。
- **V12**：战斗倍速改为全局本地记忆设置，支持 1x/2x/3x。
- **V13**：增加 30 天本地测试资源支持，一次性发放抽卡券和钻石，并提供测试期免费补体力。
- **V14–V17**：现有累计资料未提供可独立核实的版本说明，不补写未经核实的功能。
- **V18**：转生与图鉴系统。
- **V19**：LP 复活机制。
- **V20**：首页重构、签到成就、快捷布阵和悬赏看板。
- **V21**：卡牌融合系统。
- **V22**：版本管理和多语言更新记录统一。
- **V23**：全局战斗倍速记忆。
- **V24**：30 天测试资源补给。
- **V25**：队伍挂机被动与收益优化。
- **V26**：角色详情系统。
- **V27**：图鉴角色详情。
- **V28**：普通任务 BOSS 跳关。
- **V29**：修复 PWA favicon 与 Service Worker 预缓存引用不存在图标的问题，缓存版本升级至 v10。

## 部署后检查清单

- [ ] `npm run validate:version` 通过。
- [ ] `npm run build` 通过。
- [ ] favicon URL 返回 200。
- [ ] Manifest 两个 SVG 图标 URL 均返回 200。
- [ ] Service Worker 注册成功，install/activate 无失败。
- [ ] Android Chrome 菜单出现「安装应用」或「添加到主屏幕」。
- [ ] 安装后从桌面图标以 standalone 模式启动。
- [ ] 已有游戏存档保留。
