// Canonical localized release catalog. Preserve historical entries; add new releases at the top.
import { RELEASE_DATE } from './metadata.js';

export const CHANGELOG = [
  {
    version: 'v0.69', date: '2026-11-04',
    title: { zh: '普通、困难与超困难模式五关一 Boss 推进统一', ja: 'ノーマル・ハード・超ハードの5ステージ単位ボス進行を統一', en: 'Unified five-stage boss progression across campaign difficulties' },
    items: {
      zh: ['困难与超困难模式现在与普通模式一致：每五关挑战一次 Boss，击败 Boss 后直接解锁后续四个小怪关卡及下一个 Boss', '三个难度分别维护各自进度；仅击败当前已解锁的 Boss 才能推进，不跳过 Boss 战、不重复发放被跳过小怪关卡奖励', '保留已通关记录、奖励、难度解锁和上次手动选择关卡；不修改 V20 本地存档结构', '补充五关推进专项测试与中、日、英版本说明；修复上一版本概率上限专项测试的高速条件测试数据'],
      ja: ['ハード・超ハードもノーマルと同じく5ステージごとにボス戦を行い、撃破後に次の4つの雑魚ステージと次のボスを解放', '3つの難易度は個別に進行状況を保持。現在解放済みのボス撃破時のみ進行し、ボス戦をスキップせず、スキップ対象の雑魚報酬も重複付与しない', '既存のクリア記録・報酬・難易度解放・最後に手動選択したステージを維持。V20 ローカルセーブ構造は変更しない', '5ステージ進行の重点テストと中国語・日本語・英語の説明を追加。前バージョンの確率上限テストにおける高速条件データも修正'],
      en: ['Hard and Nightmare now match Normal: fight one boss every five stages, then unlock the next four minion stages and the following boss', 'Each difficulty keeps independent progress; only defeating the currently unlocked boss advances the block, with no boss skips or duplicate rewards for skipped minion stages', 'Preserves clear records, rewards, difficulty unlocks, and the last manually selected stage; leaves the V20 local-save schema unchanged', 'Adds focused five-stage progression tests and Chinese/Japanese/English release notes; corrects the high-speed condition fixture in the prior chance-cap test'],
    },
  },

  {
    version: 'v0.68', date: '2026-11-04',
    title: { zh: 'Phase 4：角色战斗概率详情完善', ja: 'Phase 4：キャラクター戦闘確率詳細の改善', en: 'Phase 4: Detailed character combat chances' },
    items: {
      zh: ['角色详情按实际战斗单位显示普通暴击、绝境暴击和危机闪避概率，优先使用战斗计算结果', '普通暴击概率拆分显示角色基础、装备、命运增益和阵型加成来源', '绝境暴击与危机闪避分别显示基础概率、阵型加成和最终有效概率，并标注 35% / 45% 上限', '高速条件闪避与连续行动暴击明确标记为条件效果，不混入常驻概率；显示 HP 触发阈值', '中文、日文、英文同步；增加概率来源、条件效果和概率上限专项测试；不修改战斗规则或 V20 存档结构'],
      ja: ['キャラクター詳細に通常会心・窮地会心・危機回避の実際の戦闘ユニット確率を表示し、戦闘計算値を優先', '通常会心率をキャラ基本値・装備・運命強化・陣形補正に分けて表示', '窮地会心と危機回避は基本確率・陣形補正・最終確率を個別表示し、35% / 45% の上限を明記', '高速条件回避と連続行動会心を常時確率に含めず条件付き効果として表示。HP 発動条件も明記', '中国語・日本語・英語を同期し、確率内訳・条件効果・上限の重点テストを追加。戦闘ルールと V20 セーブ構造は変更しない'],
      en: ['Character details prefer actual battle-unit values for standard critical, desperate critical, and desperate dodge chances', 'Breaks standard critical chance into character base, equipment, fortune, and formation sources', 'Shows base chance, formation bonus, and final effective chance for desperate critical and dodge, including the 35% / 45% caps', 'Keeps high-speed dodge and follow-up critical as conditional effects rather than permanent chance; shows HP trigger thresholds', 'Synchronizes Chinese, Japanese, and English; adds focused tests for chance sources, conditions, and caps without changing combat rules or the V20 save schema'],
    },
  },
  {
    version: 'v0.67', date: '2026-11-04',
    title: { zh: '阵型系统 Phase 3-E 战斗显示与日志完善', ja: '陣形 Phase 3-E 戦闘表示・ログ改善', en: 'Formation Phase 3-E battle display and logs' },
    items: {
      zh: ['战斗界面显示每回合实际行动顺序，并高亮当前行动角色；敌我顺序与阵型特殊规则一致', '战斗区域展示当前阵型对各队员实际生效的伤害减免、技能伤害/效果、MP 消耗及暴击/闪避概率加成', '战斗日志为阵型强化的技能、治疗、护盾、减伤及阵型概率触发增加独立标记，与普通效果区分', '行动顺序、加成说明与战斗日志支持中文、日文、英文', '仅增加战斗显示与事件说明字段，不改变战斗数值规则、V20 本地存档结构及队伍配置'],
      ja: ['各ターンの実際の行動順を戦闘画面に表示し、現在行動中のキャラクターを強調。敵味方の順序と陣形ルールを反映', '現在の陣形が各メンバーに適用する被ダメージ軽減、スキルダメージ/効果、MP 消費、会心/回避率補正を表示', '陣形で強化されたスキル・回復・シールド・軽減効果と陣形由来の確率発動をログで専用表示し、通常効果と区別', '行動順、ボーナス説明、戦闘ログを中国語・日本語・英語に対応', '戦闘表示とイベント説明フィールドのみを追加し、戦闘数値ルール・V20 ローカルセーブ・編成を変更しない'],
      en: ['Shows the actual action order for each round and highlights the acting unit, including enemy/ally interleaving and formation rules', 'Displays each ally’s active formation damage reduction, skill damage/effect, MP-cost, critical, and dodge bonuses', 'Adds distinct formation markers to enhanced skills, healing, shields, mitigation, and formation-based probability triggers in the battle log', 'Localizes action order, bonus descriptions, and battle logs in Chinese, Japanese, and English', 'Adds display and event metadata only; does not change combat balance, V20 local-save schema, or party configuration'],
    },
  },
  {
    version: 'v0.66', date: '2026-11-04',
    title: { zh: '阵型系统 Phase 3-D 特殊行动顺序', ja: '陣形 Phase 3-D 特殊行動順', en: 'Formation Phase 3-D special action order' },
    items: {
      zh: ['四方核心阵：中央核心角色固定排在我方其他队员之后行动；其他队员之间仍按速度排序', '一字长蛇阵：我方五名队员按照当前阵型从第 1 至第 5 个站位依次行动；敌方行动仍按速度排序并保留原有插入时机', '阵型顺序只重排我方行动槽位，不改变敌我单位的速度属性、队伍名单或阵型站位存档', '行动顺序在每回合开始时根据存活单位重新计算；死亡、复活与敌我行动交错仍遵循现有战斗流程', '补充行动顺序专项测试与三语言说明；保留 V20 本地存档结构'],
      ja: ['四方コア陣：中央の主力キャラは味方の他メンバー全員の後に行動し、その他の味方同士は速度順を維持', '長蛇陣：味方 5 人は現在の陣形配置 1 番から 5 番の順に行動。敵の行動は速度順を維持し、元の割り込み位置を保持', '陣形順は味方の行動枠のみを並べ替え、速度能力値・パーティ編成・陣形配置セーブを変更しない', '各ターン開始時に生存ユニットから行動順を再計算し、死亡・復活・敵味方の交互行動は既存の戦闘フローに従う', '行動順の重点テストと三言語説明を追加。V20 ローカルセーブ構造を維持'],
      en: ['Four-Corner Core: the center carry acts after every other ally; the remaining allies retain their speed order', 'Long Serpent: the five allies act in formation-slot order from position 1 through 5. Enemy turns retain speed order and their existing interleaving slots', 'Formation order only rearranges allied action slots; it does not change SPD stats, party membership, or saved formation assignments', 'The order is recalculated from living units at the start of each round; existing death, revival, and ally/enemy interleaving behavior is preserved', 'Adds focused action-order tests and localized notices while preserving the V20 local-save schema'],
    },
  },

  {
    version: 'v0.65', date: '2026-11-04',
    title: { zh: '阵型系统 Phase 3-C 伤害与技能机制', ja: '陣形 Phase 3-C ダメージ・スキル効果', en: 'Formation Phase 3-C damage and skill effects' },
    items: {
      zh: ['菱形守护阵：全队直接伤害减免 5% 正式参与承伤计算', '四方核心阵：中央核心角色的技能伤害提高 10%，不影响普通攻击', '十字协同阵：全队技能效果提高 5%，覆盖技能伤害、治疗、护盾与减伤效果；外围角色技能 MP 消耗降低 10%', '阵型效果与装备属性叠加，MP 消耗继续遵循现有统一上限；未安排到当前阵型站位的角色不获得阵型效果', '更新阵型页面说明与专项测试；保留 V20 本地存档结构，特殊行动顺序留待 Phase 3-D'],
      ja: ['菱形守護陣：味方全員の直接ダメージを 5% 軽減する効果を実戦に反映', '四方コア陣：中央の主力キャラのスキルダメージを 10% 強化。通常攻撃には適用しない', '十字協同陣：全員のスキル効果を 5% 強化し、スキルダメージ・回復・シールド・軽減効果に適用。外周キャラのスキル MP 消費を 10% 軽減', '陣形効果は装備能力と加算。MP 消費は既存の共通上限を維持し、現在の陣形に配置されていないキャラには適用しない', '陣形画面の説明と重点テストを更新。V20 ローカルセーブ構造を維持し、特殊行動順は Phase 3-D で対応'],
      en: ['Diamond Guard: the team-wide 5% direct-damage reduction now applies when allies take damage', 'Four-Corner Core: the center carry gains 10% skill damage; this does not affect basic attacks', 'Cross Support: team skill effects increase by 5%, applying to skill damage, healing, shields, and mitigation; outer-position allies spend 10% less MP on skills', 'Formation modifiers stack additively with equipment values; MP cost retains its existing shared cap, and unassigned characters receive no formation effect', 'Updates formation-screen notices and focused tests; preserves the V20 local-save schema. Special action order remains for Phase 3-D'],
    },
  },

  {
    version: 'v0.64', date: '2026-11-04',
    title: { zh: '阵型系统 Phase 3-B 概率与条件机制', ja: '陣形 Phase 3-B 確率・条件効果', en: 'Formation Phase 3-B probability and conditions' },
    items: {
      zh: ['修正绝境暴击与危机闪避概率上限，阵型加成不再被角色基础概率的 30% 上限截断；本阶段有效上限分别为 35% 和 45%', '错位游击阵按战斗最终速度计算己方平均值，只有速度严格高于平均值的角色额外获得 5 个百分点危机闪避', '一字长蛇阵在同一回合己方角色连续行动时，为后续行动角色增加 5 个百分点普通暴击率；敌方行动会中断连续条件', '角色详情同步显示实际战斗概率，并区分高速条件闪避与连续行动暴击，不把条件加成误显示为常驻加成', '保留角色独立概率、HP 低于 20% 绝境暴击、HP 低于 10% 危机闪避、多段技能整次一次绝境暴击判定及 V20 存档结构'],
      ja: ['窮地会心・危機回避の上限を修正し、陣形補正がキャラ基本確率の 30% 上限で切り捨てられないよう変更。本段階の上限はそれぞれ 35%・45%', '遊撃陣は戦闘時の最終 SPD から味方平均を計算し、平均を厳密に上回るキャラのみ危機回避率を 5 ポイント追加', '長蛇陣は同一ターン内で味方が連続行動した場合、後続メンバーの通常会心率を 5 ポイント追加。敵の行動で連続条件は中断', 'キャラクター詳細に実戦確率を反映し、高速条件回避と連続行動会心を常時効果と区別して表示', 'キャラ別固定確率、HP 20% 未満の窮地会心、10% 未満の危機回避、多段スキル全体で 1 回の窮地会心判定、V20 セーブ構造を維持'],
      en: ['Fixes desperate-critical and desperate-dodge caps so formation bonuses are not truncated by the 30% base-character cap; effective caps for this phase are 35% and 45%', 'Staggered Skirmish compares final battle SPD against the allied average and grants its extra 5 percentage points of desperate dodge only to allies strictly above that average', 'Long Serpent grants 5 percentage points of ordinary critical chance to a follow-up ally when allied actions are consecutive in the same round; an enemy action breaks the chain', 'Character details now use actual battle probabilities and distinguish conditional high-speed dodge and follow-up critical bonuses from always-on bonuses', 'Preserves stable character-specific rates, the below-20% desperate-critical and below-10% dodge thresholds, one desperate-critical roll per multi-hit skill, and the V20 save schema'],
    },
  },

  {
    version: 'v0.63', date: '2026-11-04',
    title: { zh: '阵型系统 Phase 3-A 属性计算接入', ja: '陣形 Phase 3-A 能力値計算', en: 'Formation Phase 3-A stat integration' },
    items: {
      zh: ['八种阵型的 HP、攻击、防御、速度、MP 加成与负面效果正式参与战斗角色属性计算', '根据当前启用阵型及独立站位应用团队与位置属性修正；未编入阵型位置的角色不获得阵型属性加成', '阵型属性在角色成长、突破、装备、主角等级团队加成及现有战斗增益之后计算', '新增八种阵型属性专项测试；HP/MP 最大值与战斗初始当前值同步生成，初始资源保持满值', '保留 V20 本地存档结构；伤害减免、技能强化、MP 消耗降低及特殊行动顺序留待后续阶段'],
      ja: ['8 種類の陣形による HP・攻撃・防御・速度・MP の強化と弱体化を実際の戦闘能力値へ反映', '有効な陣形と独立配置に基づいて全体・位置別補正を適用し、配置外のキャラクターには補正しない', 'キャラクター成長・突破・装備・プレイヤーレベル補正・既存戦闘バフの後に陣形補正を適用', '8 陣形の能力値テストを追加。戦闘開始時の現在 HP/MP は最大値と同期し満タンを維持', 'V20 ローカルセーブ構造を維持。ダメージ軽減、スキル強化、MP 消費軽減、特殊行動順は後続フェーズで対応'],
      en: ['Connects HP, ATK, DEF, SPD, and MP bonuses and penalties from all eight formations to actual battle-unit stats', 'Applies team and position modifiers from the active formation assignments; characters outside the five assigned slots receive no formation stat modifiers', 'Applies formation stats after character growth, breakthrough, equipment, main-player team bonus, and existing battle buffs', 'Adds focused stat tests for all eight formations; current and maximum HP/MP are generated together so battles start at full resources', 'Preserves the V20 local-save schema; damage reduction, skill enhancement, MP-cost reduction, and special action order remain for later phases'],
    },
  },
  {
    version: 'v0.62', date: '2026-11-04',
    title: { zh: '阵型系统 Phase 5 专项验收', ja: '陣形システム Phase 5 の重点検証', en: 'Formation system Phase 5 focused verification' },
    items: {
      zh: ['完成阵型配置、五人站位、概率加成与角色详情显示的专项验收；不执行完整回归测试', '部署工作流增加绝境战斗专项测试，覆盖角色固定概率、触发阈值、多段技能统一暴击判定及逐次闪避', '确认角色详情与战斗单位使用同一阵型概率加成计算，保留 V20 本地存档结构', '更新版本记录与 PWA 缓存版本；其他阵型属性、行动顺序及技能效果仍保持预览，不纳入本次完成范围'],
      ja: ['陣形設定、5 人配置、確率補正、キャラクター詳細表示を重点検証。完全な回帰テストは実施しない', 'デプロイワークフローに窮地戦闘の重点テストを追加。キャラクター固有確率、発動 HP 閾値、多段スキルの一括会心判定、攻撃ごとの回避判定を検証', 'キャラクター詳細と戦闘ユニットが同じ陣形確率補正計算を使用することを確認し、V20 ローカルセーブ構造を維持', 'バージョン履歴と PWA キャッシュを更新。その他の陣形能力値、行動順、スキル効果はプレビューのままとし、本リリースの完了範囲に含めない'],
      en: ['Completes focused acceptance of formation configuration, five-member assignments, chance bonuses, and character-detail values; no full regression suite is run', 'Adds targeted Desperate Combat tests to the deployment workflow, covering stable per-character rates, HP thresholds, one-roll multi-hit desperate criticals, and per-hit dodge checks', 'Confirms character details and battle units share the same formation chance-bonus calculation while preserving the V20 local-save structure', 'Updates release history and PWA cache version; other formation stats, action order, and skill effects remain previews and are outside this release scope'],
    },
  },
  {
    version: 'v0.61', date: '2026-11-04',
    title: { zh: '阵型战斗演示与角色概率详情', ja: '陣形バトルデモとキャラクター確率詳細', en: 'Formation combat demo and character chance details' },
    items: {
      zh: ['完成 Phase 3 简化演示：当前启用阵型中的暴击、绝境暴击和危机闪避概率加成正式参与战斗结算', '保留原有绝境暴击与危机闪避基础规则，不修改角色固定基础概率和 V20 存档结构', '多段攻击继续逐段计算伤害，并在战斗日志中显示当前段数与总段数；绝境暴击仍按一次技能统一判定', '完成 Phase 4：角色详情显示当前阵型带来的普通暴击、绝境暴击和危机闪避概率加成，数值与战斗单位计算保持一致', '阵型页面明确说明本版本仅接入概率类效果，其他属性、行动顺序和技能效果仍为预览，不视为完整阵型战斗系统', '角色详情与阵型说明支持中文、日文、英文；更新 PWA 缓存版本至 v43'],
      ja: ['Phase 3 の簡易デモを実装。有効な陣形の通常会心・窮地会心・危機回避の確率補正を実際の戦闘計算に反映', '既存の窮地会心・危機回避の基本ルールを維持し、キャラクター固有の基礎確率と V20 セーブ構造は変更しない', '多段攻撃は従来どおり各段でダメージを計算し、戦闘ログに現在の段数と総段数を表示。窮地会心はスキル全体で 1 回だけ判定', 'Phase 4 を実装。キャラクター詳細に現在の陣形による通常会心・窮地会心・危機回避の確率補正を表示し、戦闘ユニットの計算と一致', '本バージョンで戦闘に接続するのは確率系効果のみ。その他の能力値・行動順・スキル効果はプレビュー表示であり、陣形戦闘システム全体の完成ではないことを明記', 'キャラクター詳細と陣形説明は中国語・日本語・英語に対応。PWA キャッシュを v43 に更新'],
      en: ['Completes a simplified Phase 3 demo: critical, desperate critical, and desperate dodge chance bonuses from the active formation now affect actual battle calculations', 'Preserves existing Desperate Critical and Desperate Dodge base rules, fixed character base rates, and the V20 save structure', 'Multi-hit attacks continue to calculate damage per hit and now show hit index/total in the battle log; Desperate Critical remains a single roll for the whole skill', 'Completes Phase 4: character details show active-formation bonuses to standard Critical, Desperate Critical, and Desperate Dodge, matching battle-unit calculations', 'Clarifies that this release connects chance-based effects only; other stat, action-order, and skill effects remain previews and are not a complete formation combat implementation', 'Supports Chinese, Japanese, and English in character details and formation notices; updates the PWA cache to v43'],
    },
  },
  {
    version: 'v0.60', date: '2026-11-04',
    title: { zh: '阵型管理界面与手机端交互', ja: '陣形管理 UI とモバイル操作', en: 'Formation management UI and mobile interaction' },
    items: {
      zh: ['在阵容编排页面新增战术阵型管理区域，可查看并切换八种阵型：五芒星阵、四方核心阵、尖锋突击阵、菱形守护阵、一字长蛇阵、十字协同阵、错位游击阵和五环均衡阵', '新增五人阵型站位图，按阵型坐标显示角色位置与职责；点击任一位置即可选中并调整', '支持从当前五人队伍中选择角色安排到指定位置；若角色已在其他位置，会自动交换，不会重复安排同一角色', '每种阵型分别保存自己的五人站位；可先预览阵型和编辑位置，再点击启用，切换阵型不会覆盖其他阵型的配置', '新增阵型效果说明预览，展示属性、暴击、闪避、MP、技能效果和行动顺序等设计效果；本版本仅展示说明，实际战斗数值接入留待 Phase 3', '明确区分阵型站位与当前队伍名单：阵型换位不会改变现有队伍、自动最强编队或队伍预设；支持中文、日文、英文及手机端布局'],
      ja: ['編成画面に陣形管理エリアを追加。五芒星陣、四方コア陣、尖鋒突撃陣、菱形守護陣、一字長蛇陣、十字協同陣、錯位遊撃陣、五環均衡陣の 8 種類を確認・切替可能', '陣形座標に基づく 5 人の配置図を追加し、キャラクターの位置と役割を表示。任意の配置をタップして選択・変更可能', '現在の 5 人編成からキャラクターを選んで配置可能。すでに別の位置にいるキャラクターを選ぶと自動で入れ替え、重複配置を防止', '陣形ごとに 5 人の配置を個別保存。陣形と配置をプレビュー・編集してから適用でき、切替時に他の陣形設定を上書きしない', '能力値、クリティカル、回避、MP、スキル効果、行動順などの陣形効果プレビューを追加。本バージョンでは説明表示のみで、実際の戦闘数値への適用は Phase 3 で実装', '陣形配置と現在の編成メンバーを明確に分離。陣形の入れ替えは現在の編成、自動最強編成、プリセットを変更しない。中国語・日本語・英語とモバイル表示に対応'],
      en: ['Adds a tactical formation manager to the squad page, with access to all eight formations: Star, Four-Corner Core, Spearhead, Diamond Guard, Long Serpent, Cross Support, Staggered Skirmish, and Balanced Ring', 'Adds a five-position formation diagram using each formation’s coordinates and role labels; tap any position to select and edit it', 'Assigns characters from the current five-member party to selected positions; choosing a character already placed elsewhere swaps positions and prevents duplicates', 'Saves five assignments independently for every formation. Preview and edit a formation before activating it; switching formations does not overwrite other layouts', 'Adds a formation effect preview covering stats, Critical, Dodge, MP, skill effects, and action order. This release displays descriptions only; actual battle modifiers are reserved for Phase 3', 'Separates formation positioning from the current party roster: formation swaps do not change the party, auto-best lineup, or saved party presets. Supports Chinese, Japanese, English, and mobile layouts'],
    },
  },
  {
    version: 'v0.59', date: '2026-11-04',
    title: { zh: '阵型系统基础数据与配置', ja: '陣形システムの基礎データと設定', en: 'Formation system foundation and configuration' },
    items: {
      zh: ['新增八种战术阵型的统一基础定义：五芒星阵、四方核心阵、尖锋突击阵、菱形守护阵、一字长蛇阵、十字协同阵、错位游击阵和五环均衡阵', '建立每种阵型的五个独立位置、位置坐标、职责及结构化效果配置，为后续界面与战斗接入提供统一数据接口', '新增阵型配置本地保存：记录当前启用阵型及每种阵型各自的五名角色位置安排，支持自由换位', '旧 V20 存档自动初始化默认五环均衡阵；阵型数据缺失或无效时安全修复，不改动角色成长和原有队伍预设', '本阶段仅完成阵型数据、配置校验、存档兼容及 GameContext 操作接口；尚未接入战斗数值，也未改动现有编队页面'],
      ja: ['五芒星陣、四方コア陣、尖鋒突撃陣、菱形守護陣、一字長蛇陣、十字協同陣、錯位遊撃陣、五環均衡陣の 8 種類の基本定義を追加', '各陣形に 5 つの独立した位置、座標、役割、構造化された効果設定を定義し、後続 UI と戦闘連携の共通データ API を用意', '有効な陣形と各陣形ごとの 5 人の配置をローカル保存し、自由な入れ替えに対応', '既存 V20 セーブにはデフォルトの五環均衡陣を自動初期化。陣形データが欠落または不正な場合も安全に補正し、キャラクター育成と既存編成プリセットは変更しない', '本フェーズは基礎データ、設定検証、セーブ互換性、GameContext 操作 API のみ。戦闘数値への適用と既存編成画面の変更は未実施'],
      en: ['Adds unified definitions for eight tactical formations: Star, Four-Corner Core, Spearhead, Diamond Guard, Long Serpent, Cross Support, Staggered Skirmish, and Balanced Ring', 'Defines five unique positions, coordinates, roles, and structured effect metadata for each formation, establishing shared data APIs for later UI and battle integration', 'Persists the active formation and five independently arranged party positions for every formation, supporting free swaps', 'Initializes existing V20 saves with the default Balanced Ring formation; missing or invalid formation data is safely normalized without changing character progression or existing squad presets', 'This phase delivers foundation data, configuration validation, save compatibility, and GameContext actions only; battle modifiers and the existing formation page are not yet changed'],
    },
  },
  {
    version: 'v0.58', date: '2026-11-04',
    title: { zh: '绝境暴击与危机闪避系统', ja: '窮地クリティカル・危機回避システム', en: 'Desperate Critical and Dodge System' },
    items: {
      zh: ['新增绝境暴击：己方角色 HP 低于最大值 20% 时，普通攻击和主动攻击技能有概率造成最终伤害的 3 倍；多段技能整次只判定一次', '新增危机闪避：己方角色 HP 低于最大值 10% 时，受到敌方每次直接攻击均独立判定，成功则本次伤害为 0', '20 名基础角色按 HP、攻击、防御、速度、MP 相对全体初始平均值计算能力指数；能力越强，绝境暴击率和闪避率总体越低', '以 20% 为基准概率，分别加入按角色 ID 固定的 ±2 个百分点伪随机差异，最终概率限制在 10%～30%；刷新、升级、突破和装备变化均不会改变结果', '角色详情显示绝境暴击率与危机闪避率的具体数值；战斗日志分别标记绝境暴击 ×3 与危机闪避', '保留原有普通暴击、装备触发和 V20 存档；不修改 main 分支，新增概率根据角色 ID 稳定计算，无需改动现有存档结构'],
      ja: ['窮地クリティカルを追加。味方 HP が最大値の 20% 未満の場合、通常攻撃とアクティブ攻撃スキルが最終ダメージの 3 倍になる可能性があり、多段スキルはスキル全体で 1 回だけ判定', '危機回避を追加。味方 HP が最大値の 10% 未満の場合、敵の直接攻撃ごとに独立判定し、成功すると今回のダメージは 0', '20 人の基本キャラクターについて HP・攻撃・防御・速度・MP を全体の初期平均と比較して能力指数を算出。能力が高いほど両確率は全体的に低下', '基準確率 20%。キャラクター ID に基づく固定の ±2 ポイントの疑似ランダム差を個別に加え、最終確率を 10%～30% に制限。再読み込み、レベルアップ、突破、装備変更で変化しない', 'キャラクター詳細に窮地クリティカル率と危機回避率を数値表示。戦闘ログに窮地クリティカル ×3 と危機回避を表示', '既存の通常会心、装備効果、V20 セーブを維持。main ブランチは変更せず、キャラクター ID から安定計算するため既存セーブ構造を変更しない'],
      en: ['Adds Desperate Critical: below 20% HP, an ally may deal 3× final damage with a basic attack or active attack skill; multi-hit skills make one roll for the entire skill', 'Adds Desperate Dodge: below 10% HP, each incoming enemy direct hit is checked independently; a successful dodge reduces that hit to zero damage', 'Calculates an initial ability index for the 20 base characters by comparing HP, ATK, DEF, SPD, and MP with roster-wide initial averages; stronger characters generally receive lower rates', 'Uses a 20% baseline with independent, stable ±2 percentage-point pseudo-random adjustments derived from character ID; final rates are clamped to 10%–30% and remain unchanged across reloads, progression, and equipment changes', 'Displays exact Desperate Critical and Desperate Dodge rates in character details; battle logs identify DESPERATE CRITICAL ×3 and DESPERATE DODGE', 'Preserves existing standard critical hits, equipment triggers, and V20 saves; leaves main untouched and requires no save-schema change because rates are stable by character ID'],
    },
  },
  {
    version: 'v0.57', date: '2026-11-04',
    title: { zh: '主线关卡记忆与首页宝石余额', ja: 'メインステージ選択の記憶とホームのジェム残高', en: 'Main-stage selection memory and home gem balances' },
    items: {
      zh: ['主线任务分别记住普通、困难和特别难模式上次手动选择的关卡；离开页面、刷新或重新打开游戏后恢复', '重新进入时即使上次选择的关卡已经通关，也仍然回到该关；不自动跳转到下一关', '点击已通关或当前可挑战关卡先选中关卡，再通过挑战按钮进入战斗；各难度独立记忆', '若记忆关卡因进度或解锁状态变化而不可进入，则自动调整到该难度当前最近的有效关卡', '首页资源栏新增挂机宝石与清关宝石余额，实时跟随获得、消耗和兑换变化', '沿用独立本地页面设置与 V20 游戏存档，不修改通关进度、战斗规则或云存档；支持中文、日文、英文及手机端横向滚动显示'],
      ja: ['メインクエストではノーマル・ハード・ナイトメアごとに最後に手動選択したステージを記憶し、画面移動・再読み込み・再起動後に復元', '前回選択したステージをクリア済みでも次のステージへ自動移動せず、同じステージを再表示', 'クリア済みまたは現在挑戦可能なステージを選択してから挑戦ボタンでバトル開始。難易度ごとに個別保存', '進行状況や解放状態の変化で保存済みステージに入れない場合、その難易度で現在選択可能な最も近いステージへ調整', 'ホームのリソース欄に放置ジェムとクリアジェムの残高を追加し、獲得・消費・交換に応じて即時更新', '独立したローカル設定と既存 V20 セーブを維持。クリア進行・戦闘ルール・クラウドセーブは変更せず、中国語・日本語・英語およびモバイルの横スクロールに対応'],
      en: ['Remembers the last manually selected stage separately for Normal, Hard, and Nightmare, restoring it after navigation, refresh, or relaunch', 'Returns to the previously selected stage even if it has already been cleared; it does not automatically advance to the next stage', 'Select a cleared or currently challengeable stage first, then use the Challenge button to enter battle; each difficulty keeps its own selection', 'If a remembered stage becomes unavailable because progression or unlock state changes, it is adjusted to the nearest currently valid stage in that difficulty', 'Adds Idle Gem and Clear Gem balances to the Home resource bar, updating immediately after gains, spending, and exchanges', 'Uses a separate local page preference and the existing V20 game save; does not change clear progress, battle rules, or add cloud saves. Supports Chinese, Japanese, English, and horizontally scrollable mobile display'],
    },
  },

  {
    version: 'v0.56', date: '2026-11-04',
    title: { zh: '资源互换系统', ja: 'リソース交換システム', en: 'Resource Exchange System' },
    items: {
      zh: ['新增独立资源互换页面，支持金币、钻石、挂机宝石、清关宝石和召唤券五类资源双向兑换；不包含已获得的角色卡片', '所有资源统一采用 1:2 比例：消耗 1 单位资源，获得 2 单位目标资源；无手续费、次数、等级或解锁限制', '支持输入数量、1 / 10 / 100 / 最大快捷数量，自动显示余额与兑换预览；禁止负数、小数、零数量、余额不足及相同资源兑换', '兑换成功后先写入本地存档，再更新游戏状态；保留最近 30 条兑换记录，失败时不改变余额', '沿用 V20 本地存档，旧存档在首次兑换时自动补充兑换记录字段；支持中文、日文、英文及手机端布局', '该功能用于测试辅助；双向 1:2 可能在循环兑换时增加资源总量，属于已知且接受的测试行为'],
      ja: ['独立したリソース交換画面を追加。ゴールド、ダイヤ、放置ジェム、クリアジェム、召喚券の 5 種類を双方向交換可能。所持済みキャラクターカードは対象外', '全リソース共通で 1:2 のレートを適用。1 個消費して対象リソースを 2 個獲得。手数料、回数、レベル、解放条件なし', '数量入力、1 / 10 / 100 / 最大のクイック選択、残高と交換プレビューに対応。負数、小数、0、残高不足、同一リソース交換を拒否', '交換成功前にローカルセーブへ書き込み、成功後にゲーム状態を更新。直近 30 件を保存し、失敗時は残高を変更しない', 'V20 ローカルセーブを維持し、初回交換時に履歴項目を補完。中国語・日本語・英語とモバイル表示に対応', 'テスト補助機能。双方向 1:2 のため循環交換で総リソース量が増える場合があることを既知の仕様として許容'],
      en: ['Adds a dedicated Resource Exchange page for bidirectional exchange among five resources: gold, gems, Idle Gems, Clear Gems, and summon tickets. Owned character cards are excluded', 'Uses one fixed 1:2 rate for every resource pair: spend one unit and receive two units. No fees, usage limits, level requirements, or unlock conditions', 'Supports amount entry and 1 / 10 / 100 / Max shortcuts, with live balance and exchange previews; rejects negative, fractional, zero, insufficient, and same-resource exchanges', 'Writes the complete local save before updating in-memory state; keeps the latest 30 exchange records and leaves balances unchanged on failure', 'Preserves V20 local saves and initializes exchange history on first use; supports Chinese, Japanese, English, and mobile layouts', 'This is a testing utility. Because the 1:2 rate works in both directions, circular exchanges can increase total resources; this is an accepted testing behavior'],
    },
  },
  {
    version: 'v0.55', date: '2026-11-04',
    title: { zh: '清关宝石与挂机领取规则优化', ja: 'クリアジェムと放置報酬受取ルールの改善', en: 'Clear gems and idle claim improvements' },
    items: {
      zh: ['新增独立清关宝石：普通战斗胜利 30%、失败 15% 概率获得 1 颗，与挂机宝石分别统计和消耗', '主线任务新增快速清关入口，可选择当前难度下任意已通关关卡，支持 10 次 / 20 次批量结算；余额不足时按实际余额执行', '快速清关按所选关卡的常规战斗奖励结算金币、经验、钻石和敌方材料，不播放逐场战斗动画，也不推进主线进度', '结算界面显示清关次数、清关宝石消耗、金币、经验、钻石、材料和升级情况；支持中文、日文、英文', '挂机领取取消累计 5 分钟最低限制；累计时间大于 0 且持有挂机宝石即可领取，收益计算、宝石消耗、12 小时上限和批量规则保持不变', '沿用现有本地 V20 存档，旧存档自动补充清关宝石字段；不改动 main 分支'],
      ja: ['独立したクリアジェムを追加。通常戦闘の勝利時 30%、敗北時 15% の確率で 1 個獲得し、放置ジェムとは残高・統計・消費を分離', 'メインクエストにクイッククリアを追加。現在の難易度でクリア済みの任意ステージを選択でき、10 回 / 20 回の一括精算に対応。残高不足時は所持数分のみ実行', '選択ステージの通常戦闘報酬に基づき、ゴールド・経験値・ダイヤ・敵素材を付与。個別戦闘アニメーションは再生せず、メイン進行度も変更しない', '精算画面にクリア回数、消費ジェム、ゴールド、経験値、ダイヤ、素材、レベルアップを表示。中国語・日本語・英語に対応', '放置報酬の受取に必要だった最低 5 分制限を撤廃。蓄積時間が 0 より大きく、放置ジェムを所持していれば受取可能。報酬計算、消費、12 時間上限、一括精算ルールは維持', '既存のローカル V20 セーブを継続し、旧セーブにはクリアジェム項目を自動補完。main ブランチは変更しない'],
      en: ['Adds a separate Clear Gem currency: normal battle wins have a 30% drop chance and losses 15%, granting one gem; balances, statistics, and spending remain independent from Idle Gems', 'Adds Quick Clear to Main Quest. Select any stage already cleared in the current difficulty and settle 10 or 20 times; execution is capped by the owned balance', 'Grants the selected stage’s normal battle rewards: gold, EXP, diamonds, and enemy materials. No per-battle animations are played and main-stage progression is unchanged', 'Settlement details show clear count, Clear Gems spent, gold, EXP, diamonds, materials, and level gains; supports Chinese, Japanese, and English', 'Removes the five-minute minimum for idle claims. Any positive accrued time can be claimed when Idle Gems are available; reward formulas, gem costs, the 12-hour cap, and batch rules remain unchanged', 'Keeps the existing local V20 save and automatically supplies Clear Gem fields to legacy saves; the main branch is untouched'],
    },
  },
  {
    version: 'v0.54', date: '2026-11-04',
    title: { zh: '挂机宝石与批量收益结算', ja: '放置ジェムと一括報酬精算', en: 'Idle gems and batch reward settlement' },
    items: {
      zh: ['新增挂机宝石：新游戏及旧存档首次升级均获得 1000 颗；通关 30% 概率、战斗失败 15% 概率获得 1 颗', '挂机宝石可选择消耗 10 或 20 颗；持有不足时自动按现有余额结算，1 颗对应 1 次挂机收益结算', '挂机位置限制在当前最高已解锁检查点：首次 Boss 前最多普通关卡 4；Boss 必须击败后才开放对应五倍数关卡挂机', '挂机收益按已解锁关卡等级成长，保留 12 小时累计上限；挂机重复刷取固定关卡，不自动推进或跳过未击败 Boss', '挂机领取新增经验、金币、敌方碎片材料和宝石消耗明细结算界面，并记录挂机宝石获得与消耗统计', 'PWA Service Worker 缓存升级至 v36；保留 V20 本地存档结构并为旧存档补齐新资源字段'],
      ja: ['放置ジェムを追加。新規ゲームと旧セーブの初回更新に 1000 個を付与。勝利時 30%、敗北時 15% で 1 個獲得', '10 個または 20 個を選んで一括精算。所持数が不足する場合は残高分のみ消費し、1 個につき放置報酬を 1 回精算', '最高到達済みチェックポイントに放置先を制限。最初のボス前は最大通常ステージ 4、各 5 の倍数ボスは撃破後に放置解放', '解放済みステージに応じて報酬が成長し、12 時間上限を維持。放置は同じステージを周回し、未撃破ボスを自動突破しない', '経験値・ゴールド・敵の欠片素材・消費ジェム数を精算画面に表示し、ジェムの獲得/消費統計を記録', 'PWA Service Worker キャッシュを v36 に更新。V20 ローカルセーブを維持し、旧セーブに新資源フィールドを補完'],
      en: ['Adds Idle Gems: new games and legacy saves receive 1,000 on first upgrade; wins have a 30% drop chance and losses 15%, each granting one gem', 'Players choose batch settlement of 10 or 20; insufficient balances automatically use the available amount, with one gem representing one idle settlement', 'Idle location is limited to the highest unlocked checkpoint: up to ordinary stage 4 before the first boss, and each fifth-stage boss must be defeated before idling there', 'Idle rewards scale with the unlocked stage and retain the 12-hour accrual cap; idle farms the same stage without advancing past or bypassing undefeated bosses', 'Adds a detailed settlement showing EXP, gold, enemy-shard materials, and gems spent, plus gem income/spending statistics', 'Updates the PWA Service Worker cache to v36 while preserving V20 local saves and filling new resource fields for legacy saves'],
    },
  },

  {
    version: 'v0.53', date: '2026-11-04',
    title: { zh: '独立版本管理系统 V2.0', ja: '独立バージョン管理システム V2.0', en: 'Standalone Version Management System V2.0' },
    items: {
      zh: ['将版本管理拆分为独立模块：版本元数据、更新履历、历史审计、查询接口和校验逻辑分层维护', '保留 src/lib/version.js 兼容入口，现有游戏页面继续读取统一版本数据，无需修改既有调用方式', '新增版本管理构建校验：检查当前版本、package.json、发布日期、履历顺序、重复编号及中日英更新说明', '登记历史履历中尚待核实的编号缺口与重复记录，不虚构或擅自改写早期版本内容', '新增版本管理自动化测试、版本目录说明、发布索引和维护指南', '游戏版本更新为 V0.53，PWA Service Worker 缓存命名空间升级至 v35；不修改游戏玩法、存档结构或存档数据'],
      ja: ['バージョン管理を独立モジュール化し、メタデータ、更新履歴、履歴監査、参照 API、検証処理を分離', '互換用 src/lib/version.js を維持し、既存画面の呼び出し方法を変更せず統一データを参照', '現在バージョン、package.json、リリース日、履歴順序、重複番号、中国語・日本語・英語の更新内容をビルド前に検証', '未確認の過去バージョン欠番と重複を監査情報として記録し、初期履歴を推測で補完・改変しない', 'バージョン管理の自動テスト、ディレクトリ案内、リリース索引、保守ガイドを追加', 'ゲームバージョンを V0.53 に更新し、PWA Service Worker キャッシュを v35 に更新。ゲーム仕様・セーブ構造・保存データは変更しない'],
      en: ['Separates version metadata, release history, historical audit, lookup APIs, and validation into an independent module', 'Keeps src/lib/version.js as a compatibility entry so existing game screens continue using the same imports', 'Adds pre-build checks for the current version, package.json, release date, history order, duplicate labels, and Chinese/Japanese/English notes', 'Records unresolved historical gaps and duplicate labels without inventing or silently rewriting early release history', 'Adds automated version-management tests, a directory guide, release index, and maintenance documentation', 'Updates the game release to V0.53 and the PWA Service Worker cache namespace to v35; gameplay and save data/schema remain unchanged'],
    },
  },

  {
    version: 'v0.52', date: '2026-11-04',
    title: { zh: 'V7 综合回归与发布验收（Phase 6）', ja: 'V7 総合回帰テストとリリース受け入れ（Phase 6）', en: 'V7 comprehensive regression and release acceptance (Phase 6)' },
    items: {
      zh: ['完成 V7 角色成长、职业差异化属性、等级经验、突破奖励及主角等级全队加成的综合回归核查', '核查融合最强成长记录继承、已有结果卡保留及卡片数量与进度处理', '核查完整存档 JSON 导出、导入预览、二次确认、V20 旧档迁移和导入失败保护', '执行现有角色成长、战斗/装备/平衡、警告诊断、重置及存档自动化回归测试；GitHub Actions 测试与生产构建通过', '发布版本号更新为 V0.52，PWA Service Worker 缓存版本升级至 v34，保留完整历史更新履历', 'GitHub Pages 部署成功；真实设备安装、离线启动及触屏验收需在目标设备上继续确认'],
      ja: ['V7 のキャラクター育成、職業別能力成長、経験値、突破報酬、主人公レベルによる全体補正を総合回帰確認', '融合時の最強育成記録の継承、既存結果カードの保持、カード枚数と進行状況の処理を確認', '完全 JSON セーブのエクスポート、インポートプレビュー、二段階確認、V20 旧セーブ移行、失敗時保護を確認', '既存のキャラクター育成、戦闘/装備/バランス、警告診断、リセット、セーブ自動回帰テストを実行。GitHub Actions のテストと本番ビルドが成功', 'バージョンを V0.52 に更新し、PWA Service Worker キャッシュを v34 に更新。全履歴を保持', 'GitHub Pages へのデプロイ成功。実機でのインストール、オフライン起動、タッチ操作は対象端末での確認が必要'],
      en: ['Completes regression review of V7 character progression, career-specific stats, EXP, breakthrough rewards, and main-character-level team bonus', 'Reviews strongest progression inheritance in fusion, preservation of existing result copies, card counts, and progression state', 'Reviews full JSON save export, import preview, second confirmation, V20 legacy migration, and failure protection', 'Runs the existing character progression, battle/equipment/balance, warning diagnosis, reset, and save regression suites; GitHub Actions tests and production build pass', 'Updates the release to V0.52 and the PWA Service Worker cache to v34 while retaining the complete version history', 'GitHub Pages deployment succeeds; installation, offline launch, and touch interaction still require confirmation on a target device'],
    },
  },
  {
    version: 'v0.51', date: '2026-11-04',
    title: { zh: '完整存档导出与安全恢复（V7 Phase 5）', ja: 'セーブデータの完全エクスポートと安全な復元（V7 Phase 5）', en: 'Full save export and safe restore (V7 Phase 5)' },
    items: {
      zh: ['系统设置新增完整游戏存档 JSON 导出，包含角色、成长、装备、资源、阵容、关卡及其他游戏进度', '支持从 JSON 文件恢复存档；恢复前显示应用版本、存档结构版本、角色数量、副本数量、资源与关卡进度', '恢复操作提供二次确认；校验及旧档迁移全部完成后才写入当前存档', '无效 JSON、无效存档结构、不支持的版本或本地写入失败时，不覆盖当前存档', '兼容旧版原始存档 JSON，并执行现有装备与角色成长迁移；新增导入校验、失败保护和旧版兼容测试'],
      ja: ['設定画面からキャラクター・育成・装備・資源・編成・ステージなどを含む完全なゲームセーブ JSON をエクスポート', 'JSON ファイルから復元可能。復元前にアプリバージョン、セーブ形式、キャラクター数、コピー数、資源、ステージ進行を表示', '復元には二段階確認を追加。検証と旧セーブ移行が完了してから現在のセーブを書き換え', '不正な JSON、形式不正、未対応バージョン、ローカル保存失敗の場合は現在のセーブを上書きしない', '旧形式の生 JSON セーブに対応し、既存の装備・キャラクター育成移行を実行。検証・失敗保護・旧版互換テストを追加'],
      en: ['Adds full game-save JSON export in Settings, including characters, progression, equipment, resources, formations, stages, and other game progress', 'Restores from JSON files and previews app version, save schema, character/copy counts, resources, and stage progress before confirmation', 'Requires a second confirmation; validation and legacy migration finish before the current save is written', 'Invalid JSON, invalid save structures, unsupported versions, and local write failures never overwrite the current save', 'Supports legacy raw save JSON and applies existing equipment and character progression migrations; adds validation, failure-safety, and legacy compatibility tests'],
    },
  },

  {
    version: 'v0.50', date: '2026-11-04',
    title: { zh: '角色属性来源、突破与融合预览（V7 Phase 4）', ja: 'キャラクター能力値の内訳・突破・融合プレビュー（V7 Phase 4）', en: 'Character stat sources, breakthrough and fusion previews (V7 Phase 4)' },
    items: {
      zh: ['角色详情新增属性来源拆分：主角等级、全队等级加成、职业成长、累计突破奖励、装备加成分别显示', '阵容页面独立显示主角等级与全队战斗加成；全队加成仍按主角等级每级 3% 计算', '角色突破界面预览突破后的等级上限 +10、下一次固定属性奖励及累计突破奖励，并保留原有材料消耗和突破条件', '卡牌融合页面新增成长继承预览，准确展示本次消耗的 3 张卡与已有结果卡比较后的最强成长记录', '若已有结果卡成长记录最强，则保留该结果卡，新增融合卡从 Lv1 开始；若来源卡最强，则将其完整成长记录继承到新卡', '详情、突破和融合预览支持中文、日文、英文；不修改存档结构和既有成长、战斗、融合规则'],
      ja: ['キャラクター詳細に能力値の内訳を追加。主人公レベル、全体レベル補正、職業成長、累計突破報酬、装備補正を個別表示', '編成画面に主人公レベルと全体戦闘ボーナスを独立表示。全体補正は従来どおり主人公 1 レベルごとに 3%', '突破画面で上限 +10、次回の固定能力値報酬、累計突破報酬を事前表示。既存の素材消費と突破条件は維持', 'カード融合画面に成長引き継ぎプレビューを追加。消費する 3 枚と既存の結果カードを比較し、最も強い成長記録を表示', '既存の結果カードが最強の場合はそのカードを保持し、新しい融合カードは Lv1 から開始。素材カードが最強の場合は成長記録全体を新カードへ引き継ぐ', '詳細・突破・融合プレビューは中国語・日本語・英語に対応。セーブ構造と既存の成長・戦闘・融合ルールは変更しない'],
      en: ['Character details now separate stat sources: main character level, teamwide level bonus, career growth, cumulative breakthrough rewards, and equipment bonuses', 'Formation independently displays main character level and the teamwide battle bonus, still calculated at 3% per main-character level', 'Breakthrough UI previews the +10 level-cap increase, next fixed stat reward, and cumulative breakthrough rewards while preserving existing costs and requirements', 'Card fusion now previews progression inheritance by comparing the three consumed source copies with existing result copies', 'If an existing result copy has the strongest record, it remains intact and the newly fused copy starts at Lv 1; if a consumed source copy wins, its complete progression record transfers to the new card', 'Character details, breakthrough, and fusion previews support Chinese, Japanese, and English; save schema and existing progression, battle, and fusion rules remain unchanged'],
    },
  },

  {
    version: 'v0.49', date: '2026-11-04',
    title: { zh: '主角等级全队属性加成（V7 Phase 3）', ja: '主人公レベルによる全体ステータスボーナス（V7 Phase 3）', en: 'Main-character-level teamwide stat bonus (V7 Phase 3)' },
    items: {
      zh: ['全队战斗属性根据主角等级获得额外加成：主角每提升 1 级，全队 HP、ATK、DEF、MP 增加 3%', '以主角等级 1 级为基准线性计算：加成倍率 = 1 +（主角等级 - 1）× 3%', '所有上阵角色统一享受同一加成，只计算一次；不按各角色等级分别累计', '更换阵容时自动重新计算；角色自身职业成长、玩家等级原有倍率、突破奖励和装备加成保持独立', '速度、暴击、技能效果与 MP 消耗规则不变；全队 HP/MP 汇总同步反映战斗加成', '新增主角等级、全队统一加成、不同角色等级不影响基准及汇总数值的战斗回归测试'],
      ja: ['主人公レベルに応じて編成全体の戦闘能力に追加補正。1 レベル上昇ごとに全員の HP・ATK・DEF・MP が 3% 増加', '主人公レベル 1 を基準に線形計算：倍率 = 1 +（主人公レベル - 1）× 3%', '編成中の全キャラクターに同じ補正を 1 回だけ適用し、各キャラクターの個別レベルは加算しない', '編成変更時に自動再計算。職業成長、既存のプレイヤーレベル倍率、突破報酬、装備補正は独立して維持', '速度・会心・スキル効果・MP 消費ルールは変更せず、全体 HP/MP 集計には戦闘補正を反映', '主人公レベル、全員共通補正、個別レベル非依存、集計値を検証する戦闘回帰テストを追加'],
      en: ['Adds a teamwide battle-stat bonus based on the main character level: each level gained increases every deployed character’s HP, ATK, DEF, and MP by 3%', 'Uses a linear baseline at main-character level 1: multiplier = 1 + (main-character level - 1) × 3%', 'Applies the same bonus exactly once to every deployed character; individual party-member levels are not summed', 'Recalculates automatically when the party changes; career growth, existing player-level scaling, breakthrough rewards, and equipment bonuses remain separate', 'Leaves SPD, critical stats, skills, and MP costs unchanged; team HP/MP summaries include the battle bonus', 'Adds battle regression tests for main-character level, shared team scaling, independence from individual character levels, and team summaries'],
    },
  },

  {
    version: 'v0.48', date: '2026-11-04',
    title: { zh: '角色突破固定属性奖励（V7 Phase 2）', ja: 'キャラクター突破の固定ステータス報酬（V7 Phase 2）', en: 'Fixed character breakthrough stat rewards (V7 Phase 2)' },
    items: {
      zh: ['每次成功突破都会获得一次职业专属的固定 HP、ATK、DEF、MP 属性奖励', '攻击型偏向 ATK，防御型偏向 HP/DEF，辅助型偏向 MP；未识别职业采用均衡奖励', '奖励作为独立累计数据保存，不随玩家等级倍率、职业等级成长或装备百分比再次放大', '旧存档按已有突破次数补齐累计奖励，不重置等级、经验、资源或装备', '突破仍保持等级不变、等级上限 +10、无限次数、原材料与金币递增成本及储存经验结算', '合成沿用最强成长记录并完整继承突破奖励；增加重复突破、旧档补齐、战斗属性和融合继承测试'],
      ja: ['突破成功ごとに職業別の固定 HP・ATK・DEF・MP 報酬を 1 回付与', '攻撃型は ATK、防御型は HP/DEF、支援型は MP を重視。未知の職業は均衡報酬', '報酬は累積データとして個別保存し、プレイヤーレベル倍率・職業成長・装備割合で再増幅しない', '旧セーブは既存の突破回数から累積報酬を補完し、レベル・経験値・資源・装備をリセットしない', '突破時レベル維持、上限 +10、回数無制限、既存の素材・ゴールド増加コスト、保存経験値精算を維持', '融合時は最強育成記録と突破報酬を完全継承。重複付与防止、旧セーブ補完、戦闘能力、融合継承テストを追加'],
      en: ['Each successful breakthrough grants one fixed career-specific HP, ATK, DEF, and MP reward', 'Attack favors ATK, defense favors HP/DEF, and support favors MP; unknown classes receive balanced rewards', 'Rewards are stored cumulatively and are not multiplied again by player-level scaling, career growth, or equipment percentages', 'Legacy saves backfill cumulative rewards from existing breakthrough counts without resetting levels, EXP, resources, or equipment', 'Preserves level on breakthrough, +10 level cap, unlimited count, existing escalating shard/gold costs, and stored-EXP settlement', 'Fusion continues to inherit the strongest complete progression record including breakthrough rewards; adds duplicate-grant, migration, battle-stat, and fusion tests'],
    },
  },

  {
    version: 'v0.47', date: '2026-11-04',
    title: { zh: '职业差异化属性成长（V7 Phase 1）', ja: '職業別ステータス成長（V7 Phase 1）', en: 'Career-specific character stat growth (V7 Phase 1)' },
    items: {
      zh: ['首次将角色独立等级接入实际战斗属性：角色等级提升会成长 HP、ATK、DEF、MP', '按现有职业分为攻击、防御、辅助三类；未识别的新职业采用均衡成长', '成长按角色等级 1 级为基准线性累加，不改变角色基础数据；速度、暴击和技能规则保持不变', '角色成长、玩家等级倍率与装备加成分层计算；重复卡片沿用当前最强成长实例参与战斗', '新增职业系数、属性计算、重复卡选择和旧存档兼容回归测试；不修改突破奖励、全队加成或存档结构'],
      ja: ['キャラクター個別レベルを実際の戦闘能力へ初めて反映し、HP・ATK・DEF・MP が成長', '既存職業を攻撃・防御・支援の 3 系統に分類し、未知の新職業には均衡成長を適用', 'レベル 1 を基準に線形加算し、キャラクター基本データは変更しない。速度・会心・スキル仕様も維持', '職業成長、プレイヤーレベル倍率、装備補正を分離し、重複カードは最も育成されたインスタンスを戦闘に使用', '職業係数、能力計算、重複カード選択、旧セーブ互換の回帰テストを追加。突破報酬・全体ボーナス・セーブ構造は変更しない'],
      en: ['Connects individual character levels to actual battle stats for the first time: HP, ATK, DEF, and MP now grow with character level', 'Maps existing classes into attack, defense, and support archetypes; unknown future classes use balanced growth', 'Uses linear growth from level 1 without overwriting base character data; SPD, critical stats, and skill rules remain unchanged', 'Keeps career growth, player-level scaling, and equipment bonuses as separate calculation layers; duplicate cards use the strongest progression instance', 'Adds regression tests for career coefficients, stat calculation, duplicate selection, and legacy saves; no breakthrough rewards, team bonus, or save schema changes'],
    },
  },

  {
    version: 'v0.46', date: '2026-11-04',
    title: { zh: '角色成长 UI 与全面回归测试（Phase 6）', ja: 'キャラクター育成 UI と総合回帰テスト（Phase 6）', en: 'Character progression UI and comprehensive regression tests (Phase 6)' },
    items: {
      zh: ['角色详情显示正确的角色自身等级与等级上限，不再混用玩家等级', '新增经验进度条、当前经验、升级所需经验与剩余经验；满级储存经验状态清晰显示', '战斗胜利结算明确显示上阵角色各自获得的角色经验，与玩家经验奖励区分', '移动端角色详情继续采用安全区域适配的底部弹层；战斗结算调整为可滚动底部弹层，避免小屏遮挡按钮', '补充 V20 旧存档迁移、经验奖励分配、满级储存、突破与合成成长回归测试；不重置存档、不修改战斗数值'],
      ja: ['キャラクター詳細にキャラクター自身のレベルと上限を正しく表示し、プレイヤーレベルとの混同を解消', '経験値バー、現在経験値、次レベル必要経験値、残り経験値を表示。上限到達後の保存経験値も明確化', 'バトル勝利画面で編成キャラクターごとの獲得経験値をプレイヤー経験値と分けて表示', 'モバイルのキャラクター詳細はセーフエリア対応のボトムシートを維持し、バトル結果も小画面でスクロール可能なボトムシートに調整', 'V20旧セーブ移行、経験値配布、上限保存、突破・融合育成の回帰テストを追加。セーブ初期化や戦闘数値変更なし'],
      en: ['Character details now show the character’s own level and cap instead of accidentally displaying the player level', 'Adds an EXP progress bar, current EXP, EXP required for the next level, and remaining EXP; stored max-level EXP is clearly labeled', 'Battle victory results explicitly show character EXP awarded to each deployed character, separate from player EXP', 'Keeps the safe-area-aware mobile character detail sheet and changes battle results into a scrollable bottom sheet for small screens', 'Adds regression coverage for V20 legacy-save migration, EXP distribution, max-level storage, breakthrough, and fusion; no save reset or combat-stat changes'],
    },
  },

  {
    version: 'v0.45', date: '2026-11-04',
    title: { zh: '角色突破与合成成长继承整合（Phase 5）', ja: 'キャラクター突破・合成育成継承の統合（Phase 5）', en: 'Breakthrough and fusion growth inheritance integration (Phase 5)' },
    items: {
      zh: ['修正突破后满级储存经验的结算，突破提高上限后自动继续升级并保留剩余经验', '合成时比较三张被消耗材料卡与已有结果卡的成长记录，完整继承成长程度最高的一份记录', '继承内容包括等级、经验、突破次数和等级上限，并重新绑定到合成结果卡的独立实例 ID', '材料卡中优先消耗成长较低的三张；未被消耗的更强副本继续保留', '补充突破多级经验结算、材料成长继承、结果卡成长胜出及实例绑定回归测试；保留旧存档和现有合成规则'],
      ja: ['突破で上限を引き上げた後、保存済み経験値を継続計算し、残り経験値も保持するよう修正', '融合時に消費する素材 3 枚と既存の結果カードの育成記録を比較し、最も育成された 1 件を完全継承', 'レベル・経験値・突破回数・レベル上限を継承し、融合結果カードの新しい個別インスタンス ID に正しく再紐付け', '素材カードが 3 枚を超える場合は育成度の低い 3 枚を消費し、より強い残存コピーを維持', '複数レベル分の経験値精算、素材育成の継承、既存結果カード優先、インスタンス紐付けの回帰テストを追加。旧セーブと既存融合ルールを維持'],
      en: ['Corrects stored max-level EXP settlement so a breakthrough immediately processes available EXP after raising the cap and retains the remainder', 'Fusion compares the three consumed material copies with already-owned result copies and inherits the single strongest complete growth record', 'Transfers level, EXP, breakthrough count, and level cap, correctly rebinding the record to a new result-card instance ID', 'Consumes the three least-developed source copies first and preserves stronger unconsumed copies', 'Adds regression tests for multi-level EXP settlement, material inheritance, existing-result winners, and instance binding while preserving legacy saves and fusion rules'],
    },
  },

  {
    version: 'v0.44', date: '2026-11-04',
    title: { zh: '卡牌融合成长继承（Phase 4）', ja: 'カード融合時の育成データ処理（Phase 4）', en: 'Character growth handling during card fusion (Phase 4)' },
    items: {
      zh: ['同名卡融合时同步处理独立角色成长记录，避免旧卡成长数据残留或错绑', '融合消耗的三张材料卡，其成长记录随材料一并移除，不会转移给融合结果', '融合结果卡已有等级、经验、突破次数和等级上限全部保留；结果卡此前不存在时按初始成长创建', '持有超过三张材料卡时，优先消耗成长较低的三张，保留更强的剩余副本', '保持 3 张 A→S、3 张 S→SS 的既有融合规则，并新增融合成长回归测试'],
      ja: ['同名カード融合時に個別育成レコードも同期処理し、旧カードの育成データ残存や誤紐付けを防止', '素材として消費される 3 枚の育成記録は削除し、融合結果へ移転しない', '融合先カードが既に持つレベル・経験値・突破回数・上限はすべて保持。融合先が未所持なら初期育成状態で作成', '素材カードが 3 枚を超える場合、育成度の低い 3 枚を優先消費し、強い残存コピーを保持', '既存の A 3 枚→S、S 3 枚→SS の融合仕様を維持し、育成データの回帰テストを追加'],
      en: ['Synchronizes individual character progression records when fusing duplicate cards, preventing stale or misbound growth data', 'Progression records belonging to the three consumed material cards are removed and never transferred to the fusion result', 'Any existing result card keeps its level, EXP, breakthrough count, and level cap; a result not previously owned starts with initial growth', 'When more than three material copies exist, the three least-developed copies are consumed first, preserving stronger remaining copies', 'Preserves the existing 3 A → 1 S and 3 S → 1 SS fusion rules and adds fusion-growth regression tests'],
    },
  },

  {
    version: 'v0.43', date: '2026-11-04',
    title: { zh: '角色突破与等级上限提升（Phase 3）', ja: 'キャラクター突破とレベル上限解放（Phase 3）', en: 'Character breakthrough and level-cap increases (Phase 3)' },
    items: {
      zh: ['角色达到当前等级上限后可进行突破，突破后保留当前等级并将等级上限提高 10 级；突破次数不限', '突破消耗该角色专属碎片与金币：首次 3 个碎片 + 1,000 金币，之后每次碎片增加 2 个、金币增加 1,000', '材料不足或角色未达到等级上限时禁止操作；成功后自动扣除材料', '突破后继续结算此前储存在满级状态的经验，角色等级不会因突破而重置', '角色详情页新增成长、突破次数、经验储存、材料余额及突破操作；不改变玩家等级经验和战斗属性'],
      ja: ['現在のレベル上限に到達すると突破可能。現在レベルを維持したまま上限を 10 引き上げ、回数制限なし', '突破には対象キャラクター専用の欠片とゴールドを消費。初回は欠片 3 個 + 1,000 ゴールド、以降は毎回欠片 +2 個、ゴールド +1,000', '上限未到達または素材不足の場合は実行不可とし、成功時に素材を自動消費', '突破後、上限到達時に保存された経験値を引き続き反映し、キャラクターレベルはリセットしない', 'キャラクター詳細に個別育成、突破回数、保存経験値、素材残高、突破操作を追加。プレイヤー経験値と戦闘能力は変更しない'],
      en: ['Characters can break through at their current level cap; the current level is preserved and the cap increases by 10 with no breakthrough limit', 'Consumes character-specific shards and gold: first breakthrough costs 3 shards + 1,000 gold; each later breakthrough adds 2 shards and 1,000 gold', 'Blocked until the level cap is reached and when materials are insufficient; successful breakthroughs deduct materials automatically', 'Previously stored max-level EXP is processed after the cap rises; character level is never reset', 'Adds individual growth, breakthrough count, stored EXP, material balances, and breakthrough action to character details; player EXP and combat stats remain unchanged'],
    }
  },

  {
    version: 'v0.42', date: '2026-11-04',
    title: { zh: '角色独立经验与等级成长（Phase 2）', ja: 'キャラクター個別経験値・レベル育成（Phase 2）', en: 'Independent character EXP and leveling (Phase 2)' },
    items: {
      zh: ['战斗胜利、挂机领取及其他现有经验奖励会同时为当前上阵角色发放独立经验，玩家等级经验规则保持不变', '角色使用与玩家相同的经验成长曲线，独立提升等级，等级上限按每张卡片实例的 levelCap 计算', '达到当前等级上限后，新增经验继续储存在角色经验字段，不会被清零；后续突破提高上限后可继续消耗储存经验升级', '同一角色存在多张重复卡时，仅向该角色成长程度最高的卡片实例发放经验，避免重复卡因同一上阵角色获得多份经验；候补角色不获得经验', '新增角色经验、等级提升、满级经验储存及上阵经验分配回归测试；本阶段不改变战斗属性、突破材料或合成行为'],
      ja: ['バトル勝利、放置報酬の受取、その他既存の経験値報酬で、編成中キャラクターにも個別経験値を付与。プレイヤーレベルの仕様は変更しない', 'プレイヤーと同じ経験値カーブを使用し、カードインスタンスごとの levelCap まで個別にレベルアップ', '現在の上限到達後も追加経験値をキャラクターの経験値欄に保存し、後続フェーズで突破上限が上がった後にレベルアップへ使用可能', '同一キャラクターの重複カードがある場合、最も育成が進んだインスタンスだけに経験値を付与し、控えキャラクターには付与しない', '経験値付与、レベルアップ、上限後の経験値保存、編成キャラクターへの分配テストを追加。戦闘能力、突破素材、合成動作は変更しない'],
      en: ['Battle wins, idle claims, and other existing EXP rewards also grant independent EXP to deployed characters; player-level EXP behavior is unchanged', 'Characters use the existing player EXP curve and level independently up to each card instance levelCap', 'EXP earned at the current level cap is stored instead of discarded, ready to be consumed after a future breakthrough raises the cap', 'When duplicate copies exist, only the strongest progression instance for each deployed character receives EXP; reserve characters receive none', 'Adds regression tests for character EXP, leveling, cap storage, and party distribution; combat stats, breakthrough materials, and fusion behavior are unchanged'],
    }
  },
  {
    version: 'v0.41', date: RELEASE_DATE,
    title: { zh: '角色独立成长存档结构（Phase 1）', ja: 'キャラクター個別育成セーブ構造（Phase 1）', en: 'Independent character progression save schema (Phase 1)' },
    items: {
      zh: ['新增独立角色成长存档结构，每张卡片副本拥有唯一实例 ID、等级、经验、突破次数和等级上限字段', '旧存档自动迁移：按现有卡片持有数量初始化 Lv.1、0 EXP 的独立成长记录', '新获得角色及重复卡片在游戏状态提交时自动补建成长记录', '存档迁移保持幂等，保留已有成长数据、玩家等级经验、装备、资源和 V13 测试标记', '本阶段只建立数据结构，不改变战斗属性、经验发放、合成规则或角色界面；保留 V0.40 及以前完整版本履历'],
      ja: ['カード複製ごとに一意のインスタンス ID、レベル、経験値、突破回数、レベル上限を持つ個別育成セーブ構造を追加', '旧セーブは所持カード数に応じて Lv.1・0 EXP の個別育成レコードへ自動移行', '新規入手カードと重複カードの育成レコードをゲーム状態の確定時に自動作成', '移行は冪等で、既存育成データ、プレイヤーレベル、経験値、装備、資源、V13 テストマーカーを保持', '本フェーズではデータ構造のみを追加し、戦闘能力・経験値配布・合成ルール・キャラクター UI は変更しない。V0.40 以前の履歴を保持'],
      en: ['Adds an independent progression save record for every card copy, with a unique instance ID, level, EXP, breakthrough count, and level cap', 'Migrates legacy saves by creating level-1, zero-EXP records for each currently owned card copy', 'Automatically creates progression records for newly acquired cards and duplicate copies when game state is committed', 'Migration is idempotent and preserves existing progression data, player level/EXP, equipment, resources, and the V13 test-support marker', 'This phase adds data structure only; battle stats, EXP rewards, fusion rules, and character UI remain unchanged. Preserves the complete V0.40 and earlier changelog'],
    }
  },

  {
    version: 'v0.40', date: RELEASE_DATE,
    title: { zh: '重置时同时补满抽奖宝石与抽奖券', ja: 'リセット時に召喚ジェムと召喚券を補充', en: 'Reset summon gems and tickets together' },
    items: {
      zh: ['每次执行 Reset Game，抽奖宝石与抽奖券均固定重置为 9999', '两种资源均覆盖重置前余额；普通新游戏首次启动的初始资源不变', '修正重置保存失败时确认框仍关闭的问题，只有存档成功写入后才关闭', '保留 V13 一次性测试支持标记，不因重置重复领取一次性测试资源', '保留 V0.39 及以前完整版本履历；自动挂机功能不包含在本次改动中'],
      ja: ['Reset Game のたびに召喚ジェムと召喚券をそれぞれ 9999 に初期化', 'リセット前の残高を引き継がず、通常の新規ゲーム開始時の初期資源は変更しない', '保存失敗時に確認画面が閉じる問題を修正し、保存成功後のみ閉じる', 'V13 の一回限りのテスト支援マーカーを保持し、リセットによる重複付与を防止', 'V0.39 以前の履歴を保持。自動放置機能は今回の変更に含まない'],
      en: ['Every Reset Game action sets both summon gems and summon tickets to exactly 9999', 'Both balances replace their pre-reset values; ordinary new-game starting resources remain unchanged', 'Fixes the confirmation dialog closing after a failed save; it now closes only after persistence succeeds', 'Preserves the V13 one-time test-support marker to prevent duplicate one-time grants', 'Preserves the complete V0.39 and earlier changelog; the auto-idle feature is not part of this change'],
    }
  },

  {
    version: 'v0.39', date: RELEASE_DATE,
    title: { zh: '重置游戏时固定抽奖宝石数量', ja: 'ゲームリセット時の召喚ジェム初期化', en: 'Reset summon gems on game restart' },
    items: {
      zh: ['每次执行 Reset Game，抽奖宝石固定重置为 9999，方便重复测试抽卡', '重置时其他游戏数据仍按原有初始状态初始化；不保留重置前的宝石余额', '重置数据先写入本地存档，写入失败时保留原有数据并提示，不会出现界面已重置但存档未成功的假成功', '保留 V0.38 Warning Diagnosis、装备系统、测试支持有效期标记及完整历史版本履历'],
      ja: ['Reset Game のたびに召喚ジェムを 9999 に初期化し、召喚テストを繰り返し実行可能にする', 'その他のゲームデータは従来どおり初期状態に戻し、リセット前のジェム残高は引き継がない', 'リセットデータを先にローカル保存し、保存失敗時は既存データを維持して通知する。画面だけがリセットされる誤成功を防止', 'V0.38 Warning Diagnosis、装備システム、テストサポート有効期限マーカー、全履歴を保持'],
      en: ['Every Reset Game action initializes summon gems to exactly 9999 for repeatable gacha testing', 'All other game data follows the existing fresh-game defaults; the pre-reset gem balance is not carried over', 'Writes the reset state before updating the UI; on storage failure, existing data is preserved and the user is notified', 'Preserves V0.38 Warning Diagnosis, equipment systems, the test-support expiry marker, and the complete release history'],
    }
  },

  {
    version: 'v0.38', date: RELEASE_DATE,
    title: { zh: '自动 Warning 诊断与模拟测试', ja: 'Warning 自動診断とシミュレーションテスト', en: 'Automated warning diagnosis and simulation tests' },
    items: {
      zh: ['Debug Console 新增 Warning Diagnosis，支持隔离模拟、真实 Console Warning 捕获、分类统计和历史报告', '新增可重复的战斗场景模拟，装备触发判定使用固定随机序列，覆盖普通攻击、技能、概率失败、冷却与每回合上限', '修正装备触发中概率失败、冷却阻止、每回合上限和效果不适用被错误标记为 WARN 的问题；这些是正常判定结果，改记 INFO', '保留真正的性能慢调用和异常 Warning，并提供根因线索、发生位置、次数与修复建议', '诊断模拟使用独立日志捕获，不污染正式游戏日志、不修改正式存档或消耗游戏资源', '新增 Warning 分析与模拟回归测试；保留 V0.37 及以前完整更新履历'],
      ja: ['Debug Console に Warning Diagnosis を追加。隔離シミュレーション、実 Console Warning 捕捉、分類集計、履歴レポートに対応', '通常攻撃・スキル・装備発動・確率失敗・クールダウン・ターン上限を含む再実行可能な戦闘シナリオを追加', '確率失敗・クールダウン・ターン上限・効果対象外を WARN と誤分類する問題を修正。正常な判定結果として INFO に変更', '実際の低速処理と異常 Warning は保持し、原因候補・発生箇所・回数・修正案を表示', '診断シミュレーションは独立ログで実行し、通常ログ・セーブデータ・ゲーム資源に影響しない', 'Warning 分析とシミュレーション回帰テストを追加し、V0.37 以前の履歴を保持'],
      en: ['Adds Warning Diagnosis to Debug Console with isolated simulations, runtime Console Warning capture, grouped analysis, and report history', 'Adds repeatable battle scenarios with a fixed equipment-trigger random stream, covering basic attacks, skills, chance failures, cooldowns, and per-turn caps', 'Fixes expected equipment outcomes being mislabeled as WARN: chance failures, cooldown blocks, per-turn caps, and inapplicable effects are now INFO', 'Keeps genuine slow-operation and abnormal warnings visible with likely causes, source locations, counts, and repair guidance', 'Runs diagnostic simulations in an isolated log collector without polluting normal logs, modifying saves, or consuming game resources', 'Adds warning analysis and simulation regression tests while preserving the complete V0.37 and earlier changelog'],
    }
  },

  {
    version: 'v0.37', date: RELEASE_DATE,
    title: { zh: '装备系统验证、日志审计与数值平衡', ja: '装備システム検証・ログ監査・数値バランス調整', en: 'Equipment system verification, logger audit, and balance' },
    items: {
      zh: ['补齐装备特殊效果运行测试：追加伤害、反击、护盾、治疗、MP 恢复、概率、冷却、每回合上限、死亡保护和目标归属', '追加伤害与反击统一套用目标 DEF、伤害减免和装备伤害修正，避免绕过防御造成过高伤害', '修正 0 回合冷却语义：允许同回合再次尝试，由 maxPerTurn 独立限制触发次数；正数冷却仍按完整回合计算', '新增全装备目录配置校验与 54 种三槽组合属性上限测试，验证现有属性配置处于预期范围', '验证 Debug Logger 对成功触发、概率失败、冷却阻止、次数上限和效果不适用的记录', '保留装备目录原始概率与效果强度；通过统一伤害结算修正特殊伤害，不进行无依据的随机削弱', '修复 V0.33 履历引用当前版本常量导致的版本号错标，保留 V0.36 及以前完整履历', '不改变存档结构、角色养成、装备 Unique 规则、主动技能 MP 和每回合 MP 恢复'],
      ja: ['追加ダメージ・反撃・シールド・回復・MP 回復、確率、クールダウン、ターン上限、死亡保護、対象判定の実行テストを追加', '追加ダメージと反撃に対象 DEF・被ダメージ軽減・装備ダメージ補正を適用し、防御無視による過剰ダメージを防止', 'クールダウン 0 の意味を修正。同一ターン内の再判定を許可し、発動回数は maxPerTurn で制御。正数クールダウンは従来どおり完全なターン単位', '全装備カタログの設定検証と 54 通りの 3 スロット組み合わせ能力上限テストを追加', '発動成功・確率失敗・クールダウン・ターン上限・効果不適用の Debug Logger 記録を検証', '装備カタログの確率と効果値は維持し、統一ダメージ計算で特殊ダメージを調整', 'V0.33 の履歴が現在バージョン定数を参照して誤表示される問題を修正。V0.36 以前の履歴を保持', 'セーブ構造、育成、Unique ルール、アクティブスキル MP、毎ターン MP 回復は変更しない'],
      en: ['Adds runtime tests for bonus damage, counters, shields, healing, MP recovery, chance, cooldown, per-turn caps, death guards, and owner matching', 'Routes bonus damage and counters through target DEF, damage reduction, and equipment damage modifiers instead of bypassing defenses', 'Fixes zero-cooldown semantics: another same-turn attempt is allowed and maxPerTurn controls the cap; positive cooldowns still count complete locked rounds', 'Adds catalog configuration validation and stat-cap coverage for all 54 three-slot combinations', 'Verifies Debug Logger records for successful triggers, chance failures, cooldown blocks, per-turn caps, and inapplicable effects', 'Keeps catalog chance and effect values; balances special damage through consistent mitigation rather than arbitrary nerfs', 'Fixes the V0.33 changelog entry that incorrectly referenced the current version constant; preserves all earlier release history', 'Does not change save schema, progression, Unique ownership, active-skill MP, or per-turn MP regeneration'],
    }
  },

  {
    version: 'v0.36', date: RELEASE_DATE,
    title: { zh: 'Forge 三槽位装备管理界面', ja: 'Forge 3 スロット装備管理', en: 'Forge three-slot equipment management' },
    items: {
      zh: ['Forge 支持武器、防具、遗物三槽位和当前五人队伍角色选择', '新增装备目录、库存数量、名称搜索、已拥有/已穿戴筛选及当前穿戴者定位', '支持装备穿戴、卸下和更换，沿用 Unique 规则', '详情显示真实配置的基础属性、战斗加成、触发事件、效果、概率、冷却和每回合上限', '新增穿戴前后属性比较，装备选择、穿卸和比较写入 Debug Logger', '装备变更前同步确认本地保存成功；失败时不更新状态', '保留遗物铸造、熔炼炉、旧存档、角色养成、战斗触发和装备 AI；目录未定义品质字段，不虚构品质筛选', '保留 v0.35 及以前完整履历'],
      ja: ['武器・防具・遺物の 3 スロットと現在の 5 人パーティー選択に対応', '装備カタログ、所持数、名前検索、所持・装備中フィルター、装備者への移動を追加', '既存 Unique ルールを維持して装備・解除・交換に対応', '実データの能力値、戦闘補正、発動イベント、効果、確率、クールダウン、ターン上限を表示', '装備前後の能力比較と Debug Logger 記録を追加', '保存成功を同期確認してから状態を更新。失敗時は状態を変更しない', '遺物鋳造、熔錬炉、旧セーブ、育成、戦闘効果、装備 AI を維持。品質データがないため品質フィルターは追加しない', 'v0.35 以前の履歴を保持'],
      en: ['Adds weapon, armor, and relic slot management for the current five-member party', 'Adds catalog, owned counts, name search, owned/equipped filters, and wearer navigation', 'Supports equip, unequip, and replacement while preserving Unique ownership', 'Displays configured stats, combat bonuses, trigger events, effects, chance, cooldown, and per-turn limits', 'Adds before/after stat comparison and Debug Logger events', 'Verifies local save success before updating state; failed writes leave state unchanged', 'Preserves relic crafting, furnace, old saves, progression, battle triggers, and equipment AI; no fabricated rarity filter', 'Preserves the complete v0.35 and earlier changelog'],
    }
  },

  {
    version: 'v0.35', date: RELEASE_DATE,
    title: { zh: '装备与自动战斗 AI 联动', ja: '装備とオートバトル AI の連携', en: 'Equipment-aware auto-battle AI' },
    items: {
      zh: ['自动战斗 AI 根据已装备的实际触发效果调整攻击、群攻、治疗、防御与嘲讽技能评分', '追加伤害、暴击追击、反击、护盾、治疗和技能后 MP 恢复均参与战术评分，不针对具体装备 ID 写死规则', '保留原有技能基础评分、随机选择机制与 MP 可用性检查；没有相关装备效果时维持原有评分', '新增可独立测试的技能评分函数，并通过 Debug Logger 记录候选技能评分、装备加成和最终选择', '新增测试覆盖装备前后评分变化、治疗/防御/群攻/MP 联动和无装备兼容性', '不改变主动技能 MP 消耗、每回合 MP 恢复、装备触发规则、存档结构或 Forge 界面', '保留 v0.34 及以前的完整更新履历'],
      ja: ['装備中の実際の発動効果に応じて、攻撃・全体攻撃・回復・防御・挑発スキルの AI 評価を調整', '追加ダメージ・会心追撃・反撃・シールド・回復・スキル使用後の MP 回復を戦術評価に反映。特定装備 ID への固定依存なし', '従来の基礎評価・ランダム選択・MP 使用可能判定を維持し、関連装備効果がない場合は従来の評価を維持', '単体テスト可能なスキル評価関数を追加し、候補スキルの評価・装備ボーナス・最終選択を Debug Logger に記録', '装備前後の評価差、回復・防御・全体攻撃・MP 連携、装備なし時の互換性をテスト', 'アクティブスキルの MP 消費、毎ターンの MP 回復、装備発動ルール、セーブ構造、Forge 画面は変更しない', 'v0.34 以前の更新履歴を完全保持'],
      en: ['Adjusts attack, AoE, healing, defense, and taunt skill scores from the actual equipped trigger effects', 'Uses bonus damage, critical follow-ups, counters, shields, healing, and post-skill MP recovery as tactical signals without hardcoding equipment IDs', 'Preserves base scoring, randomized selection, and MP affordability checks; units without relevant equipment retain their original base scores', 'Exports a directly testable skill-scoring function and logs candidate scores, equipment bonuses, and final choices through Debug Logger', 'Adds tests for score changes with equipment, healing/defense/AoE/MP synergies, and compatibility without equipment', 'Does not change active-skill MP costs, per-round MP regeneration, equipment trigger rules, save data, or the Forge UI', 'Preserves the complete v0.34 and earlier release history'],
    }
  },

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
    version: 'v0.33',
    date: '2026-11-03',
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
