import type { Translations } from './types'

export const zh: Translations = {
  meta: {
    title: 'Cron 表达式生成器 & 解析器 | 免费在线工具',
    description: '免费 Cron 表达式生成器、解析器和转换工具。支持 Unix、Quartz 和 AWS EventBridge。自然语言输入、可视化构建器、下次执行时间。',
  },
  header: {
    title: 'Cron 表达式生成器',
    subtitle: '构建、解析和转换 Cron 表达式。支持 Unix、Quartz 和 AWS EventBridge。',
    homeLink: 'AI 成本计算器',
  },
  expression: {
    label: '表达式',
    invalid: '无效的 Cron 表达式',
  },
  tabs: {
    builder: '构建器',
    explainer: '解析器',
  },
  nl: {
    placeholder: '试试："每5分钟"、"工作日9点"、"每天"...',
    button: '生成',
    error: '未识别的模式。请尝试下方建议，或使用可视化构建器。',
  },
  builder: {
    fields: ['分钟', '小时', '日期', '月份', '星期'],
    presets: {
      minute: [
        { label: '每分钟', value: '*' },
        { label: '每5', value: '*/5' },
        { label: '每10', value: '*/10' },
        { label: '每15', value: '*/15' },
        { label: '每30', value: '*/30' },
        { label: '0 (整点)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: '每小时', value: '*' },
        { label: '每2', value: '*/2' },
        { label: '每3', value: '*/3' },
        { label: '每6', value: '*/6' },
        { label: '每12', value: '*/12' },
        { label: '0 (午夜)', value: '0' },
        { label: '早上6点', value: '6' },
        { label: '上午9点', value: '9' },
        { label: '中午12点', value: '12' },
        { label: '下午6点', value: '18' },
        { label: '晚上9点', value: '21' },
      ],
      dayOfMonth: [
        { label: '每天', value: '*' },
        { label: '1号', value: '1' },
        { label: '15号', value: '15' },
        { label: '28号', value: '28' },
      ],
      month: [
        { label: '每月', value: '*' },
        { label: '一月', value: '1' },
        { label: '七月', value: '7' },
      ],
      dayOfWeek: [
        { label: '每天', value: '*' },
        { label: '周一到周五', value: '1-5' },
        { label: '周六周日', value: '0,6' },
        { label: '周一', value: '1' },
        { label: '周二', value: '2' },
        { label: '周三', value: '3' },
        { label: '周四', value: '4' },
        { label: '周五', value: '5' },
        { label: '周六', value: '6' },
        { label: '周日', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: '粘贴 Cron 表达式（如：0 9 * * 1-5）',
    button: '解析',
    error: '无效的 Cron 表达式。请使用 5 个字段：分钟 小时 日期 月份 星期',
  },
  dialect: {
    unix: 'Unix',
    quartz: 'Quartz',
    aws: 'AWS',
    unixDesc: '5 字段 (crontab)',
    quartzDesc: '6-7 字段 (Java)',
    awsDesc: 'EventBridge',
  },
  copy: {
    label: '复制',
    copied: '已复制！',
  },
  nextRuns: {
    title: '接下来 10 次执行时间 (UTC)',
  },
  patterns: {
    title: '常用 Cron 模式',
    items: [
      { description: '每分钟', cron: '* * * * *' },
      { description: '每5分钟', cron: '*/5 * * * *' },
      { description: '每10分钟', cron: '*/10 * * * *' },
      { description: '每30分钟', cron: '*/30 * * * *' },
      { description: '每小时', cron: '0 * * * *' },
      { description: '每2小时', cron: '0 */2 * * *' },
      { description: '每6小时', cron: '0 */6 * * *' },
      { description: '每天午夜', cron: '0 0 * * *' },
      { description: '每天上午9点', cron: '0 9 * * *' },
      { description: '每天中午', cron: '0 12 * * *' },
      { description: '工作日上午9点', cron: '0 9 * * 1-5' },
      { description: '工作日下午5点', cron: '0 17 * * 1-5' },
      { description: '每周一上午9点', cron: '0 9 * * 1' },
      { description: '每周五下午5点', cron: '0 17 * * 5' },
      { description: '每月1号', cron: '0 0 1 * *' },
      { description: '每月15号', cron: '0 0 15 * *' },
      { description: '每周日中午', cron: '0 12 * * 0' },
      { description: '周末午夜', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: '常见问题',
    items: [
      {
        q: '什么是 Cron 表达式？',
        a: 'Cron 表达式是定义定时任务的 5 个字段字符串：分钟 (0-59)、小时 (0-23)、日期 (1-31)、月份 (1-12) 和星期 (0-6，0 为周日)。特殊字符：* (任意)、, (列表)、- (范围)、/ (步长)。',
      },
      {
        q: 'Unix、Quartz 和 AWS Cron 有什么区别？',
        a: 'Unix cron 有 5 个字段。Quartz（Java 使用）增加了秒字段和可选的年字段（共 6-7 个字段），并使用 ? 代替 * 表示日期字段。AWS EventBridge 使用 cron() 或 rate() 表达式，包含年字段。',
      },
      {
        q: '如何每 5 分钟运行一次 Cron 任务？',
        a: '使用 */5 * * * *（Unix）、0 */5 * ? * * *（Quartz）或 rate(5 minutes)（AWS）。*/5 表示分钟字段中"每隔 5 个值"。',
      },
      {
        q: '如何仅在工作日运行 Cron 任务？',
        a: '使用 0 9 * * 1-5 可在周一到周五上午 9:00 运行。星期字段中的 1-5 表示周一(1)到周五(5)。',
      },
      {
        q: '这个工具免费吗？',
        a: '是的，完全免费。无需登录。所有处理都在浏览器中完成，不会向任何服务器发送数据。',
      },
    ],
  },
  footer: {
    text: '免费 Cron 表达式生成器。无需登录，不收集数据。',
    link: 'AI 提示词成本计算器',
  },
  languageSwitcher: {
    label: '语言',
  },
}
