// Single source of truth for in-app, package, and release-document version.
export const APP_VERSION = 'v0.33';
export const RELEASE_DATE = '2026-11-03';

export const CHANGELOG = [
  {
    version: 'v0.34', date: RELEASE_DATE,
    title: { zh: '战斗事件与装备特殊触发', ja: '戦闘イベントと装備特殊効果', en: 'Battle events and equipment triggers' },
    items: {
      zh: ['新增战斗开始、回合开始、攻击、暴击、受到伤害、治疗、击杀、技能使用、回合结束和战斗结束十类事件', '武器、防具与遗物加入追加伤害、暴击追击、反击、护盾、治疗和 MP 恢复等数据驱动效果', '特殊效果支持触发概率、回合冷却和每回合次数上限；未触发原因记录到 Debug Logger', '死亡角色不能触发装备效果；反击伤害不会再次触发反击，防止无限循环', '战斗结束清理本场冷却和触发次数，不改变主动技能 MP 消耗与每回合 MP 恢复', '战斗日志显示装备触发，新增事件、概率、冷却、次数上限和安全保护测试', '保留既有装备属性、三槽位、旧存档与完整历史更新记录'],
      ja: ['戦闘開始・ターン開始・攻撃・会心・被ダメージ・回復・撃破・スキル使用・ターン終了・戦闘終了の 10 種イベントを追加', '武器・防具・遺物に追加ダメージ、会心追撃、反撃、シールド、回復、MP 回復のデータ駆動効果を追加', '発動確率・ターン単位クールダウン・ターンごとの発動上限に対応。不発理由は Debug Logger に記録', '戦闘不能キャラクターは発動不可。反撃ダメージから反撃を再発動しない無限ループ防止を実装', '戦闘終了時に戦闘内状態を消去。アクティブスキル MP 消費と毎ターン MP 回復は維持', '戦闘ログに発動を表示し、イベント・確率・クールダウン・上限・安全制御のテストを追加', '既存装備能力、3 スロット、旧セーブ、全更新履歴を維持'],
      en: ['Added ten battle events: battle start, turn start, attack, critical, damage taken, heal, kill, skill used, turn end, and battle end', 'Added data-driven weapon, armor, and relic effects for bonus damage, critical follow-ups, counters, shields, healing, and MP recovery', 'Triggers support chance, round cooldown, and per-turn caps; skipped-trigger reasons are recorded in Debug Logger', 'Dead characters cannot trigger effects, and counter damage cannot recursively trigger another counter', 'Clears battle-local cooldowns and counters at battle end without changing active-skill MP costs or normal MP regeneration', 'Shows activations in the battle log and adds tests for dispatch, chance, cooldown, caps, and safety guards', 'Preserves existing equipment stats, three slots, old saves, and complete release history']
    }
  },

  {
    version: APP_VERSION,
    date: RELEASE_DATE,
    title: { zh: 'Hybrid 装备属性与战斗修正', ja: 'Hybrid 装備ステータスと戦闘補正', en: 'Hybrid equipment stats and combat modifiers' },
    items: {
      zh: ['建立武器、防具、遗物统一装备目录，支持 HP、ATK、DEF、SPD、暴击率、暴击伤害、治疗加成与 MP 消耗减免', '所有装备槽位的基础属性与战斗修正按加法统一叠加，并设置合理上限，避免极端数值', '现有六件遗物保留原有 HP/ATK/DEF/SPD 数值，同时加入轻量 Hybrid 战斗特性', '新增武器与防具的静态装备定义，当前不自动发放库存，也不改变现有 Forge 获取流程', '战斗计算接入伤害提升、受到伤害降低、暴击伤害、治疗强化和 MP 消耗减免', '自动技能选择按装备后的实际 MP 消耗判断可用性；MP 每回合恢复规则保持不变', '新增装备属性与战斗修正测试，保留旧存档结构、角色养成和既有战斗机制'],
      ja: ['武器・防具・遺物を統一装備カタログにまとめ、HP・ATK・DEF・SPD・会心率・会心ダメージ・回復補正・MP 消費軽減に対応', '全装備スロットの基礎能力と戦闘補正を加算方式で統合し、極端な数値を防ぐ上限を設定', '既存 6 種の遺物の HP/ATK/DEF/SPD 補正を維持しながら、軽量な Hybrid 戦闘特性を追加', '武器・防具の静的定義を追加。所持数は自動付与せず、既存 Forge の入手フローも変更しない', 'ダメージ増加、被ダメージ軽減、会心ダメージ、回復強化、MP 消費軽減を戦闘計算へ反映', '自動スキル選択は装備適用後の実際の MP 消費で使用可否を判定。毎ターンの MP 回復ルールは維持', '装備能力・戦闘補正のテストを追加し、旧セーブ構造・育成・既存戦闘仕様を維持'],
      en: ['Added a unified weapon, armor, and relic catalog supporting HP, ATK, DEF, SPD, crit rate, crit damage, healing bonus, and MP cost reduction', 'Aggregates base stats and combat modifiers additively across all equipment slots with safety caps', 'Preserved all six existing relic stat bonuses while adding modest Hybrid combat traits', 'Added static weapon and armor definitions without granting inventory or changing the current Forge acquisition flow', 'Integrated damage dealt, damage reduction, critical damage, healing, and MP-cost modifiers into battle calculations', 'Automatic skill selection now checks the actual MP cost after equipment reduction; per-turn MP recovery remains unchanged', 'Added equipment stat and combat-modifier tests while preserving old saves, character progression, and existing battle mechanics'],
    },
  },
  {
    version: 'v0.32',
    date: RELEASE_DATE,
    title: { zh: '三槽位装备底层系统', ja: '3 スロット装備基盤', en: 'Three-slot equipment foundation' },
    items: {
      zh: ['建立武器、防具、遗物三槽位装备数据结构，并保留原有遗物装备与属性加成', '新增 Unique 穿戴校验：同一件装备 ID 同一时间只能由一名角色穿戴，支持安全卸下与重新穿戴', '旧版角色到遗物的平面装备数据自动迁移为三槽位结构，重复穿戴时按首个有效角色保留', '迁移前自动保留原始存档备份，使用独立 equipmentSchemaVersion 标记并保持迁移幂等', '保留原有 v20 存档键、遗物库存、角色养成、资源和战斗规则；新增装备迁移单元测试', 'Service Worker 缓存升级至 v13，确保已安装 PWA 获取本次版本'],
      ja: ['武器・防具・遺物の 3 スロット装備データ構造を追加し、既存の遺物装備と能力補正を維持', 'Unique 装備チェックを追加。同じ装備 ID は同時に 1 人のキャラクターのみ装備可能で、安全な解除・再装備に対応', '旧形式のキャラクター→遺物データを 3 スロット形式へ自動移行し、重複装備は最初の有効な装備者のみ保持', '移行前に元のセーブをバックアップし、equipmentSchemaVersion で管理。移行は冪等', '既存 v20 セーブキー、遺物在庫、育成、資源、戦闘ルールを維持。装備移行の単体テストを追加', 'Service Worker キャッシュを v13 に更新し、インストール済み PWA に本バージョンを適用'],
      en: ['Added a three-slot equipment data model for weapons, armor, and relics while preserving existing relic equipment and stat bonuses', 'Added Unique validation: the same equipment ID can be worn by only one character at a time, with safe unequip and re-equip support', 'Automatically migrates legacy character-to-relic mappings into the three-slot structure and keeps only the first valid wearer for duplicate assignments', 'Backs up the original save before migration and tracks the schema with equipmentSchemaVersion; migration is idempotent', 'Preserves the existing v20 save key, relic inventory, character progression, resources, and battle rules; adds equipment migration unit tests', 'Bumped the Service Worker cache to v13 so installed PWAs receive this release'],
    },
  },
  {
    version: 'v0.31',
    date: RELEASE_DATE,
    title: { zh: '程序执行日志系统', ja: '実行ログシステム', en: 'Execution logging system' },
    items: {
      zh: ['新增统一 Saga Execution Logger，记录重要业务函数的 START、END、RETURN、ASYNC、WARN 与 ERROR', '日志包含时间戳、模块、函数、Trace ID、执行耗时及异常堆栈，并输出到浏览器 Console', '新增独立 Debug Console，支持日志等级、事件、模块筛选、关键字搜索和详情查看', '支持 JSON/TXT 导出、手动清空及最近 2,000 条日志本地保存，不影响游戏存档', '对存档、战斗模拟、技能选择、伤害、治疗、死亡处理、游戏状态操作和战斗结算增加追踪', '下次启动时检测上次运行未完成的函数，并标记为疑似中断；不改变战斗规则和资源数值','Service Worker 缓存版本升级至 v12，确保已安装 PWA 获取本次新版本'],
      ja: ['重要な業務関数の START・END・RETURN・ASYNC・WARN・ERROR を記録する共通 Saga Execution Logger を追加', 'タイムスタンプ、モジュール、関数、Trace ID、実行時間、例外スタックを記録し、ブラウザー Console に出力', 'ログレベル・イベント・モジュールの絞り込み、キーワード検索、詳細表示に対応した Debug Console を追加', 'JSON/TXT エクスポート、手動削除、最新 2,000 件のローカル保存に対応。ゲームセーブには影響しない', 'セーブ、バトル計算、スキル選択、ダメージ、回復、死亡処理、ゲーム状態操作、バトル精算を追跡', '次回起動時に前回未完了の関数を検出して中断の可能性として表示。戦闘ルールや数値は変更しない','Service Worker キャッシュを v12 に更新し、インストール済み PWA に新バージョンを適用'],
      en: ['Added a shared Saga Execution Logger for START, END, RETURN, ASYNC, WARN, and ERROR events in important business functions', 'Records timestamps, modules, functions, Trace IDs, execution duration, and exception stacks in the browser Console', 'Added a Debug Console with level, event, and module filters, keyword search, and expandable details', 'Supports JSON/TXT export, manual clearing, and local retention of the newest 2,000 records without touching game saves', 'Added tracing to save operations, battle simulation, skill selection, damage, healing, death handling, game actions, and battle settlement', 'Detects functions left without completion records on the next launch and marks possible interruption; combat rules and values remain unchanged','Bumped the Service Worker cache to v12 so installed PWAs receive this release'],
    },
  },

  {
    version: 'v0.30',
    date: RELEASE_DATE,
    title: { zh: 'GitHub 部署状态监控', ja: 'GitHub デプロイ状態の確認', en: 'GitHub deployment status monitor' },
    items: {
      zh: ['版本履历顶部新增 GitHub Pages 部署状态卡片，显示当前版本、目标分支和 Commit SHA', '打开版本履历时自动查询 GitHub Actions，并提供手动刷新按钮', '仅当当前构建 Commit SHA 对应的 Build 与 Deploy Job 均成功时显示部署成功', '区分部署中、失败、尚未部署和无法确认，避免把旧版本或其他分支的成功误报为当前版本成功', '显示对应 Workflow Run 链接和最后检查时间；公开仓库通过 GitHub API 查询，不保存 Token', 'GitHub Actions 构建时注入 Commit SHA 与分支信息；本地构建缺少元数据时显示未知', '支持中文、日文、英文，保留 v0.29 及以前的版本履历'],
      ja: ['バージョン履歴上部に GitHub Pages のデプロイ状態カードを追加し、現在のバージョン・対象ブランチ・Commit SHA を表示', '履歴を開くと GitHub Actions を自動確認し、手動更新ボタンも提供', '現在の Commit SHA に対応する Build と Deploy Job が両方成功した場合のみ成功と判定', 'デプロイ中・失敗・未デプロイ・確認不能を区別し、旧版や別ブランチの成功を誤表示しない', 'Workflow Run リンクと最終確認時刻を表示。公開 GitHub API を使い Token は保存しない', 'Actions のビルド時に Commit SHA とブランチを注入し、ローカルビルドで情報がなければ不明と表示', '中国語・日本語・英語に対応し、v0.29 以前の履歴を保持'],
      en: ['Added a GitHub Pages deployment status card above version history with current version, target branch, and commit SHA', 'Automatically checks GitHub Actions when history opens and provides a manual refresh button', 'Reports success only when Build and Deploy jobs for the exact current build commit both succeed', 'Distinguishes in progress, failed, not deployed, and unknown; older or other-branch deployments never count as current success', 'Shows the matching workflow run link and last check time; uses the public GitHub API without storing a token', 'Injects commit SHA and branch during Actions builds; local builds without metadata show Unknown', 'Supports Chinese, Japanese, and English while preserving v0.29 and earlier history'],
    },
  },

  {
    version: 'v0.29',
    date: RELEASE_DATE,
    title: { zh: 'PWA 安装兼容性修复', ja: 'PWA インストール互換性の修正', en: 'PWA installation compatibility fix' },
    items: {
      zh: ['修复 index.html 引用不存在的 oooo-icon.svg，改为引用实际存在的 192 SVG 图标', '修复 Service Worker 预缓存不存在的 oooo-icon.svg 导致 install 阶段失败的问题', '确认 Manifest 图标路径与 public 目录文件一致，保留 192×192 和 512×512 SVG 图标声明', '将 Service Worker 缓存版本提升至 v10，促使已访问用户更新应用壳资源', '不修改游戏存档、存档键、游戏逻辑或现有 PWA 安装身份'],
      ja: ['index.html の存在しない oooo-icon.svg 参照を修正し、実在する 192 SVG アイコンへ変更', 'Service Worker の install 時に存在しない oooo-icon.svg を事前キャッシュして失敗する問題を修正', 'Manifest のアイコンパスと public ディレクトリの実ファイルを一致させ、192/512 SVG を維持', 'Service Worker キャッシュを v10 に更新し、既存ユーザーが新しいアプリシェルを取得できるようにする', 'ゲームセーブ、セーブキー、ゲームロジック、PWA のインストール ID は変更しない'],
      en: ['Fixed index.html referencing the missing oooo-icon.svg by pointing to the existing 192 SVG icon', 'Removed the missing oooo-icon.svg from Service Worker precaching, which could fail installation', 'Aligned manifest icon paths with actual files in public while retaining 192x192 and 512x512 SVG declarations', 'Bumped the Service Worker cache to v10 so returning clients can update the app shell', 'Did not change game saves, save keys, game logic, or the existing PWA app identity'],
    },
  },
  {
    version: 'v0.29',
    date: RELEASE_DATE,
    title: { zh: '普通任务 BOSS 跳关', ja: 'ノーマルクエストの BOSS スキップ', en: 'Normal quest boss progression skip' },
    items: {
      zh: ['普通任务每 5 关仍以第 5、10、15……关作为章节 BOSS', '击败普通模式章节 BOSS 后，自动解锁并将下一关推进到下一个 BOSS（例如第 5 关胜利后直接挑战第 10 关）', 'BOSS 胜利结算后提供“挑战下一个 BOSS”按钮，不会自动开始下一场战斗', '跳过的 4 个小怪关不进行战斗、不消耗体力，也不发放小怪关奖励', '保留 BOSS 原有战斗、体力消耗、奖励和其他模式的逐关推进规则；不修改存档键与存档版本'],
      ja: ['ノーマルクエストは従来どおり 5・10・15 面目を章 BOSS とする', 'ノーマルで章 BOSS に勝利すると、次の BOSS まで進行を解放（例：第 5 面勝利後は第 10 面へ直接挑戦）', 'BOSS 勝利後に「次の BOSS に挑戦」ボタンを表示し、自動で次の戦闘は開始しない', 'スキップした雑魚 4 面は戦闘・スタミナ消費・報酬付与を行わない', 'BOSS の戦闘・スタミナ・報酬、および他モードの通常進行を維持。セーブキーとバージョンは変更しない'],
      en: ['Keeps chapter bosses at stages 5, 10, 15, and so on in Normal quests', 'Winning a Normal chapter boss unlocks progression directly to the next boss (for example, stage 5 leads to stage 10)', 'Shows a “Challenge next boss” button after victory; the next battle does not start automatically', 'The four skipped minion stages are not fought, do not consume stamina, and grant no minion rewards', 'Preserves boss combat, stamina cost, boss rewards, and sequential progression in other modes; save key/schema remain unchanged'],
    },
  },

  {
    version: 'v0.27',
    date: RELEASE_DATE,
    title: { zh: '图鉴角色详情', ja: '図鑑キャラクター詳細', en: 'Gallery character details' },
    items: {
      zh: ['图鉴中点击已获得的英雄卡片即可打开统一角色详情', '详情复用 v0.26 角色详情组件，展示最大 HP/MP、基础属性、装备、主动技能和职业被动', '未获得的英雄仍保持锁定，不开放详情；敌人图鉴交互保持不变', '关闭详情后返回原图鉴，保留当前标签与筛选状态', '与首页、阵容入口共享相同角色属性计算和多语言显示，不改变存档结构'],
      ja: ['図鑑で獲得済み英雄カードをタップすると共通キャラクター詳細を表示', 'v0.26 の詳細コンポーネントを再利用し、最大 HP/MP・基本能力・装備・アクティブスキル・職業パッシブを表示', '未獲得英雄はロック状態を維持し、敵図鑑の操作は変更しない', '詳細を閉じると現在のタブとフィルターを保持して図鑑へ戻る', 'ホーム・編成と同じ能力計算および多言語表示を使用し、セーブ構造は変更しない'],
      en: ['Tapping an owned hero card in the Gallery now opens the shared character detail dialog', 'Reuses the v0.26 detail component for maximum HP/MP, attributes, equipment, active skills, and class passive', 'Unowned heroes remain locked; enemy gallery interactions are unchanged', 'Closing details returns to the Gallery with its current tab and filters preserved', 'Shares the same stat calculations and translations as Home and Formation without changing save data'],
    },
  },

  {
    version: 'v0.26',
    date: RELEASE_DATE,
    title: { zh: '角色详情系统', ja: 'キャラクター詳細画面', en: 'Character detail system' },
    items: {
      zh: ['首页队伍卡片和队伍编成页面中的角色卡片，点击后直接打开角色详情', '详情展示最大 HP、最大 MP、攻击、防御、速度、暴击率、等级与战力', '展示当前装备遗物及其属性加成，并可从详情快捷进入装备管理', '展示职业主动技能的目标、MP 消耗、伤害/治疗/防御效果，以及职业被动', '队伍编成页面保留队伍槽位选择，并在详情中提供编入当前选中位置的操作', '支持中文、日文、英文；不改变存档结构和战斗计算规则'],
      ja: ['ホームの編成カードと編成画面のキャラクターカードをタップすると詳細を直接表示', '最大 HP・最大 MP・攻撃・防御・速度・会心率・レベル・戦力を表示', '装備中の遺物と能力補正を表示し、装備管理へ移動可能', '職業アクティブスキルの対象・MP 消費・攻撃/回復/防御効果と職業パッシブを表示', '編成画面では枠選択を維持し、詳細画面から選択中の枠へ配置可能', '中国語・日本語・英語に対応。セーブ構造と戦闘計算は変更しない'],
      en: ['Tapping party cards on Home or Formation now opens character details directly', 'Shows maximum HP/MP, ATK, DEF, SPD, crit rate, level, and power', 'Displays equipped relic and stat bonuses, with a shortcut to equipment management', 'Lists class active skills with target, MP cost, attack/heal/defense effects, plus class passive', 'Formation keeps explicit slot selection and adds a place-in-selected-slot action in the detail dialog', 'Supports Chinese, Japanese, and English without changing save data or combat calculations'],
    },
  },

  {
    version: 'v0.25',
    date: RELEASE_DATE,
    title: { zh: '队伍挂机被动与收益优化', ja: '編成の放置パッシブと報酬改善', en: 'Party idle passives and reward improvements' },
    items: {
      zh: ['挂机收益现在会根据当前五人队伍的职业被动获得加成；同类型效果按加法叠加', '金币、经验和主线推进速度分别显示加成比例及队员被动来源', '保留原有挂机基础收益、12 小时上限、5 分钟领取门槛和单次最多推进 8 关', '修复暂停/恢复挂机时未领取时间可能丢失的问题，暂停期间也可保留并领取已累积时间', '旧版 v20 存档自动补充挂机累计时间字段，不重置玩家进度或更换存档键', '挂机被动独立于战斗被动，不增加额外资源掉落'],
      ja: ['現在の 5 人編成の職業パッシブに応じて放置報酬を強化。同種効果は加算', 'ゴールド・経験値・メイン進行速度の補正率と各メンバーの効果を表示', '従来の基本報酬、12 時間上限、5 分の受取条件、1 回最大 8 面進行を維持', '放置の一時停止・再開時に未受取時間が失われる問題を修正。一時停止中も蓄積時間を保持・受取可能', '既存 v20 セーブに累積時間フィールドを自動補完し、進行状況とセーブキーは維持', '放置パッシブは戦闘パッシブと独立し、追加ドロップは発生しない'],
      en: ['Idle rewards now receive class-based bonuses from the current five-member party; matching effects stack additively', 'Shows bonus percentages and contributing members for gold, EXP, and main-stage progress', 'Preserves existing base rates, 12-hour cap, 5-minute claim threshold, and 8-stage per-claim limit', 'Fixes lost unclaimed time when pausing/resuming; accrued time remains claimable while paused', 'Automatically adds the accrual field to existing v20 saves without resetting progress or changing the save key', 'Idle passives are independent from combat passives and do not add new drop types'],
    },
  },


  {
    version: 'v0.24',
    date: RELEASE_DATE,
    title: { zh: '30 天测试资源补给', ja: '30 日間テスト資源支援', en: '30-day test resource support' },
    items: {
      zh: ['升级后对现有本地存档自动发放一次测试资源；新建本地存档也自动发放一次', '一次性发放 450 张抽卡券与 324,000 钻石，额度按 30 天测试工作量估算并预留 1.5 倍', '测试支持期从首次领取时开始计算，持续 30 天', '测试期内可在系统设置免费一键补满体力至 60，不消耗钻石', '30 天结束后关闭免费补体力，恢复正常体力与商店规则；剩余资源和全部游戏进度保留', '使用独立本地标记防止刷新或重新打开时重复发放，不修改原存档键、存档结构或版本 20'],
      ja: ['既存のローカルセーブにはアップグレード後 1 回、新規ローカルセーブにも 1 回、テスト資源を自動付与', '召喚券 450 枚とダイヤ 324,000 個を一括付与。30 日間の想定テスト量に 1.5 倍の余裕を設定', 'テスト期間は初回付与時から 30 日間', 'テスト期間中は設定画面からダイヤ消費なしでスタミナを 60 まで即時回復', '30 日経過後は無料回復を停止し、通常の回復・ショップ仕様に戻す。残り資源と全進行状況は保持', '独立したローカルマーカーで再読み込み時の重複付与を防止。既存のセーブキー・構造・バージョン 20 は変更しない'],
      en: ['Automatically grants test resources once to an existing local save after upgrade and once to a newly created local save', 'Grants 450 summon tickets and 324,000 gems in one batch, based on an estimated 30-day test workload with a 1.5x buffer', 'The 30-day test period starts when the grant is first claimed', 'During the test period, Settings provides a free one-tap refill to 60 stamina without spending gems', 'After 30 days, free refills stop and normal stamina/shop rules resume; all remaining resources and game progress are retained', 'Uses an independent local marker to prevent duplicate grants on refresh/reopen without changing the existing save key, save structure, or schema version 20'],
    },
  },

  {
    version: 'v0.23',
    date: RELEASE_DATE,
    title: { zh: '全局战斗倍速记忆', ja: '戦闘速度の全体共有と記憶', en: 'Global battle speed preference' },
    items: {
      zh: ['战斗倍速改为全局共用，切换到下一关、重试或进入其他支持战斗的模式时自动沿用', '战斗中点击倍速会立即生效，无需重新开始', '倍速选择保存在当前浏览器本地，刷新或重新打开游戏后仍会保留', '默认倍速为 1 倍，可循环切换 1 倍、2 倍、3 倍', '使用独立的本地设置键保存，不修改原有游戏存档、存档版本或战斗计算规则'],
      ja: ['戦闘速度を全体共通設定にし、次のステージ・再挑戦・他の対応モードでも引き継ぐ', '戦闘中の速度変更は即時反映され、再開始は不要', '速度設定はブラウザーのローカル領域に保存され、再読み込み後も維持', '初期値は 1 倍、1・2・3 倍を順番に切り替え', '独立したローカル設定キーを使用し、既存セーブデータ・バージョン・戦闘計算ルールは変更しない'],
      en: ['Made battle speed a shared preference across next stages, retries, and other supported battle modes', 'Speed changes take effect immediately during battle', 'Stored the selected speed locally so it survives refreshes and relaunches', 'Defaults to 1x and cycles through 1x, 2x, and 3x', 'Uses a separate local setting key without changing the existing save data, save schema, or battle calculations'],
    },
  },
  {
    version: 'v0.22',
    date: RELEASE_DATE,
    title: { zh: '版本管理与多语言更新统一', ja: 'バージョン管理と多言語更新の統一', en: 'Unified versioning and multilingual release notes' },
    items: {
      zh: ['建立统一版本配置，游戏内版本按钮、设置页面和更新记录自动读取同一版本号', '版本更新说明同步支持中文、日语和英语，切换游戏语言时自动显示对应内容', '将版本信息与 npm package 版本建立一致性检查，发布构建前自动校验', '新增版本记录完整性检查，避免遗漏语言、版本号不一致或更新说明为空', '更新 PWA 缓存版本，确保部署后客户端能够获取最新应用资源'],
      ja: ['バージョン設定を一元化し、ホームのバージョン表示・設定画面・更新履歴で同じ番号を使用', '更新内容を中国語・日本語・英語で同期し、ゲームの表示言語に合わせて切り替え', 'アプリ内バージョンと npm package のバージョン整合性をビルド前に自動検証', '言語の欠落、バージョン番号の不一致、空の更新説明を検出する検証を追加', 'PWA キャッシュのバージョンを更新し、公開後に最新リソースを取得できるよう改善'],
      en: ['Centralized version metadata so the home version button, settings page, and release history use one version value', 'Synchronized release notes in Chinese, Japanese, and English, following the selected in-game language', 'Added a pre-build consistency check between the in-app version and npm package version', 'Added validation for missing translations, mismatched version numbers, and empty release notes', 'Bumped the PWA cache version so deployed clients can retrieve the latest app assets'],
    },
  },
  { version: 'v0.21', title: { zh: '第二十一稿：卡牌融合', ja: '第 21 版：カード融合', en: 'v21: Card fusion' }, items: {
    zh: ['同一类型 3 张 A 卡可融合为 1 张 S 卡', '同一类型 3 张 S 卡可融合为 1 张 SS 卡', '融合消耗原有 3 张卡牌，不同类型无法混合', '卡牌图鉴新增融合入口', '首页新增版本按钮，可查看历次改版内容'],
    ja: ['同型の A カード 3 枚を S カード 1 枚に融合', '同型の S カード 3 枚を SS カード 1 枚に融合', '融合は元の 3 枚を消費、型違いの混合は不可', 'カード図鑑に融合入口を追加', 'ホームにバージョンボタンを追加し更新履歴を表示'],
    en: ['Fuse 3 A cards of the same type into 1 S card', 'Fuse 3 S cards of the same type into 1 SS card', 'Fusion consumes the 3 originals; types cannot be mixed', 'Added a fusion entry to the card gallery', 'Added a version button on home to review every patch']
  } },
  { version: 'v0.20', title: { zh: '第二十稿：首页重构', ja: '第 20 版：ホーム再構築', en: 'v20: Home rebuild' }, items: {
    zh: ['新增签到与成就悬浮窗、红点提示', '新增战术快捷布阵与一键最强战力', '新增冒险者酒馆随机悬赏看板', '首页四大区域排版定稿'],
    ja: ['ログイン・実績ウィンドウと通知ドットを追加', '戦術クイック編成と最強自動編成を追加', '冒険者酒場のランダム懸賞を追加', 'ホーム四大区域のレイアウト確定'],
    en: ['Added daily & milestone popovers with red dots', 'Added tactical squad panel and auto-best', 'Added tavern random bounty board', 'Finalized the four-region home layout']
  } },
  { version: 'v0.19', title: { zh: '第十九稿：LP 复活机制', ja: '第 19 版：LP 復活', en: 'v19: LP revival' }, items: {
    zh: ['每张卡牌 6 点 LP，阵亡可被复活', '复活消耗施法者与目标各 1 点 LP', 'LP 归零后永久死亡', '新增单体/群体/随机回复三类辅助技能'],
    ja: ['各カードに LP 6 点、戦闘不能から復活可能', '復活は術者と対象の LP を 1 ずつ消費', 'LP 0 で永久離脱', '単体・全体・ランダム回復を追加'],
    en: ['Every card has 6 LP and can be revived', 'Revival costs 1 LP from caster and target', 'LP 0 means permanent death', 'Added single / party / random heals']
  } },
  { version: 'v0.18', title: { zh: '第十八稿：转生与图鉴', ja: '第 18 版：転生と図鑑', en: 'v18: Rebirth & codex' }, items: {
    zh: ['1000 级满级开放转生与进阶职业', '转生提升等级上限与全队基础属性', '新增我方/敌方图鉴与里程碑奖励', '5 碎片合成 1 卡，敌方碎片可逆向转化'],
    ja: ['Lv1000 で転生・上位職を開放', '転生で上限と全隊基礎値が上昇', '味方/敵図鑑とマイルストーン報酬を追加', '欠片 5 個で 1 枚、敵欠片は味方へ転化'],
    en: ['Rebirth at Lv1000 unlocks advanced classes', 'Rebirth raises level cap and party stats', 'Added ally/enemy codex with milestones', '5 shards fuse a card; enemy shards convert']
  } },
];
