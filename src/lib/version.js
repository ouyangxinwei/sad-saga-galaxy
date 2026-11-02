// Single source of truth for in-app, package, and release-document version.
export const APP_VERSION = 'v0.22';
export const RELEASE_DATE = '2026-11-03';

export const CHANGELOG = [
  {
    version: APP_VERSION,
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
