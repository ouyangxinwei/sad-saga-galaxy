// Single source of truth for in-app, package, and release-document version.
export const APP_VERSION = 'v0.28';
export const RELEASE_DATE = '2026-11-03';

export const CHANGELOG = [
  {
    version: APP_VERSION,
    date: RELEASE_DATE,
    title: { zh: '普通任务 BOSS 跳关', ja: 'ノーマルクエストの BOSS スキップ', en: 'Normal quest boss progression skip' },
    items: {
      zh: ['普通任务每 5 关仍以第 5、10、15……关作为章节 BOSS', '击败普通模式章节 BOSS 后，自动解锁并将下一关推进到下一个 BOSS（例如第 5 关胜利后直接挑战第 10 关）', 'BOSS 胜利结算后提供“挑战下一个 BOSS”按钮，不会自动开始下一场战斗', '跳过的 4 个小怪关不进行战斗、不消耗体力，也不发放小怪关奖励', '保留 BOSS 原有战斗、体力消耗、奖励和其他模式的逐关推进规则；不修改存档键与存档版本'],
      ja: ['ノーマルクエストは従来どおり 5・10・15 面目を章 BOSS とする', 'ノーマルで章 BOSS に勝利すると、次の BOSS まで進行を解放（例：第 5 面勝利後は第 10 面へ直接挑戦）', 'BOSS 勝利後に「次の BOSS に挑戦」ボタンを表示し、自動で次の戦闘は開始しない', 'スキップした雑魚 4 面は戦闘・スタミナ消費・報酬付与を行わない', 'BOSS の戦闘・スタミナ・報酬、および他モードの通常進行を維持。セーブキーとバージョンは変更しない'],
      en: ['Keeps chapter bosses at stages 5, 10, 15, and so on in Normal quests', 'Winning a Normal chapter boss unlocks progression directly to the next boss (for example, stage 5 leads to stage 10)', 'Shows a “Challenge next boss” button after victory; the next battle does not start automatically', 'The four skipped minion stages are not fought, do not consume stamina, and grant no minion rewards', 'Preserves boss combat, stamina cost, boss rewards, and sequential progression in other modes; save key/schema remain unchanged'],
    },
  },

