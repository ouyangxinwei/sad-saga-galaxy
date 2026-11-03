// Single source of truth for in-app, package, and release-document version.
export const APP_VERSION = 'v0.26';
export const RELEASE_DATE = '2026-11-03';

export const CHANGELOG = [
  {
    version: APP_VERSION,
    date: RELEASE_DATE,
    title: { zh: '角色详情系统', ja: 'キャラクター詳細画面', en: 'Character detail system' },
    items: {
      zh: ['首页队伍卡片和队伍编成页面中的角色卡片，点击后直接打开角色详情', '详情展示最大 HP、最大 MP、攻击、防御、速度、暴击率、等级与战力', '展示当前装备遗物及其属性加成，并可从详情快捷进入装备管理', '展示职业主动技能的目标、MP 消耗、伤害/治疗/防御效果，以及职业被动', '队伍编成页面保留队伍槽位选择，并在详情中提供编入当前选中位置的操作', '支持中文、日文、英文；不改变存档结构和战斗计算规则'],
      ja: ['ホームの編成カードと編成画面のキャラクターカードをタップすると詳細を直接表示', '最大 HP・最大 MP・攻撃・防御・速度・会心率・レベル・戦力を表示', '装備中の遺物と能力補正を表示し、装備管理へ移動可能', '職業アクティブスキルの対象・MP 消費・攻撃/回復/防御効果と職業パッシブを表示', '編成画面では枠選択を維持し、詳細画面から選択中の枠へ配置可能', '中国語・日本語・英語に対応。セーブ構造と戦闘計算は変更しない'],
      en: ['Tapping party cards on Home or Formation now opens character details directly', 'Shows maximum HP/MP, ATK, DEF, SPD, crit rate, level, and power', 'Displays equipped relic and stat bonuses, with a shortcut to equipment management', 'Lists class active skills with target, MP cost, attack/heal/defense effects, plus class passive', 'Formation keeps explicit slot selection and adds a place-in-selected-slot action in the detail dialog', 'Supports Chinese, Japanese, and English without changing save data or combat calculations'],
    },
  },

  {
    version: APP_VERSION,
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
