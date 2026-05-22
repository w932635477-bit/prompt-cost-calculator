import type { Translations } from './types'

export const ja: Translations = {
  meta: {
    title: 'Cron式ジェネレーター & 解説 | 無料オンラインツール',
    description: '無料のCron式ジェネレーター、解説、変換ツール。Unix、Quartz、AWS EventBridge対応。自然言語入力、ビジュアルビルダー、次回実行時刻表示。',
  },
  header: {
    title: 'Cron式ジェネレーター',
    subtitle: 'Cron式の作成、解説、変換。Unix、Quartz、AWS EventBridgeに対応。',
    homeLink: 'AIコスト計算機',
  },
  expression: {
    label: '式',
    invalid: '無効なCron式です',
  },
  tabs: {
    builder: 'ビルダー',
    explainer: '解説',
  },
  nl: {
    placeholder: '試す：「5分ごと」「平日9時」「毎日」...',
    button: '生成',
    error: 'パターンを認識できませんでした。下の候補を試すか、ビルダーを使用してください。',
  },
  builder: {
    fields: ['分', '時', '日', '月', '曜日'],
    presets: {
      minute: [
        { label: '毎分', value: '*' },
        { label: '5分ごと', value: '*/5' },
        { label: '10分ごと', value: '*/10' },
        { label: '15分ごと', value: '*/15' },
        { label: '30分ごと', value: '*/30' },
        { label: '0 (先頭)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: '毎時', value: '*' },
        { label: '2時間ごと', value: '*/2' },
        { label: '3時間ごと', value: '*/3' },
        { label: '6時間ごと', value: '*/6' },
        { label: '12時間ごと', value: '*/12' },
        { label: '0 (深夜)', value: '0' },
        { label: '午前6時', value: '6' },
        { label: '午前9時', value: '9' },
        { label: '正午', value: '12' },
        { label: '午後6時', value: '18' },
        { label: '午後9時', value: '21' },
      ],
      dayOfMonth: [
        { label: '毎日', value: '*' },
        { label: '1日', value: '1' },
        { label: '15日', value: '15' },
        { label: '28日', value: '28' },
      ],
      month: [
        { label: '毎月', value: '*' },
        { label: '1月', value: '1' },
        { label: '7月', value: '7' },
      ],
      dayOfWeek: [
        { label: '毎日', value: '*' },
        { label: '月〜金', value: '1-5' },
        { label: '土・日', value: '0,6' },
        { label: '月', value: '1' },
        { label: '火', value: '2' },
        { label: '水', value: '3' },
        { label: '木', value: '4' },
        { label: '金', value: '5' },
        { label: '土', value: '6' },
        { label: '日', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: 'Cron式を貼り付け（例：0 9 * * 1-5）',
    button: '解説',
    error: '無効なCron式です。5つのフィールドを使用してください：分 時 日 月 曜日',
  },
  dialect: {
    unix: 'Unix',
    quartz: 'Quartz',
    aws: 'AWS',
    unixDesc: '5フィールド (crontab)',
    quartzDesc: '6-7フィールド (Java)',
    awsDesc: 'EventBridge',
  },
  copy: {
    label: 'コピー',
    copied: 'コピーしました！',
  },
  nextRuns: {
    title: '次の10回の実行時刻 (UTC)',
  },
  patterns: {
    title: 'よく使うCronパターン',
    items: [
      { description: '毎分', cron: '* * * * *' },
      { description: '5分ごと', cron: '*/5 * * * *' },
      { description: '10分ごと', cron: '*/10 * * * *' },
      { description: '30分ごと', cron: '*/30 * * * *' },
      { description: '毎時', cron: '0 * * * *' },
      { description: '2時間ごと', cron: '0 */2 * * *' },
      { description: '6時間ごと', cron: '0 */6 * * *' },
      { description: '毎日深夜', cron: '0 0 * * *' },
      { description: '毎日午前9時', cron: '0 9 * * *' },
      { description: '毎日正午', cron: '0 12 * * *' },
      { description: '平日午前9時', cron: '0 9 * * 1-5' },
      { description: '平日午後5時', cron: '0 17 * * 1-5' },
      { description: '毎週月曜午前9時', cron: '0 9 * * 1' },
      { description: '毎週金曜午後5時', cron: '0 17 * * 5' },
      { description: '毎月1日', cron: '0 0 1 * *' },
      { description: '毎月15日', cron: '0 0 15 * *' },
      { description: '毎週日曜正午', cron: '0 12 * * 0' },
      { description: '週末深夜', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: 'よくある質問',
    items: [
      {
        q: 'Cron式とは何ですか？',
        a: 'Cron式はスケジュールを定義する5つのフィールドからなる文字列です：分 (0-59)、時 (0-23)、日 (1-31)、月 (1-12)、曜日 (0-6、0は日曜日)。特殊文字：* (任意)、, (リスト)、- (範囲)、/ (間隔)。',
      },
      {
        q: 'Unix、Quartz、AWS Cronの違いは？',
        a: 'Unix cronは5フィールドです。Quartz（Java用）は秒フィールドとオプションの年フィールド（計6-7フィールド）を追加し、日フィールドに*の代わりに?を使用します。AWS EventBridgeは年フィールドを含むcron()またはrate()式を使用します。',
      },
      {
        q: '5分ごとにCronジョブを実行するには？',
        a: '*/5 * * * *（Unix）、0 */5 * ? * * *（Quartz）、またはrate(5 minutes)（AWS）を使用します。*/5は分フィールドで「5つおき」を意味します。',
      },
      {
        q: '平日のみCronジョブを実行するには？',
        a: '0 9 * * 1-5を使用すると、月曜から金曜の午前9:00に実行されます。曜日フィールドの1-5は月曜(1)から金曜(5)を意味します。',
      },
      {
        q: 'このツールは無料ですか？',
        a: 'はい、完全に無料です。ログイン不要。すべての処理はブラウザ内で行われ、データはサーバーに送信されません。',
      },
    ],
  },
  footer: {
    text: '無料Cron式ジェネレーター。ログイン不要、データ収集なし。',
    link: 'AIプロンプトコスト計算機',
  },
  languageSwitcher: {
    label: '言語',
  },
}
