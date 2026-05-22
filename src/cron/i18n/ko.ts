import type { Translations } from './types'

export const ko: Translations = {
  meta: {
    title: 'Cron 표현식 생성기 | 무료 온라인 도구',
    description:
      '무료 Cron 표현식 생성, 설명 및 변환 도구. Unix, Quartz, AWS EventBridge 지원. 자연어 입력, 시각적 빌더, 다음 실행 시간 확인.',
  },
  header: {
    title: 'Cron 표현식 생성기',
    subtitle:
      'Cron 표현식을 생성, 설명 및 변환하세요. Unix, Quartz, AWS EventBridge를 지원합니다.',
    homeLink: 'AI 비용 계산기',
  },
  expression: {
    label: '표현식',
    invalid: '유효하지 않은 cron 표현식',
  },
  tabs: {
    builder: '빌더',
    explainer: '설명',
  },
  nl: {
    placeholder:
      '시도해 보세요: "5분마다", "평일 오전 9시", "매일"...',
    button: '생성',
    error:
      '패턴을 인식할 수 없습니다. 아래 제안 중 하나를 시도하거나 빌더를 사용하세요.',
  },
  builder: {
    fields: ['분', '시', '일', '월', '요일'],
    presets: {
      minute: [
        { label: '매분', value: '*' },
        { label: '5분마다', value: '*/5' },
        { label: '10분마다', value: '*/10' },
        { label: '15분마다', value: '*/15' },
        { label: '30분마다', value: '*/30' },
        { label: '0 (정각)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: '매시간', value: '*' },
        { label: '2시간마다', value: '*/2' },
        { label: '3시간마다', value: '*/3' },
        { label: '6시간마다', value: '*/6' },
        { label: '12시간마다', value: '*/12' },
        { label: '0 (자정)', value: '0' },
        { label: '오전 6시', value: '6' },
        { label: '오전 9시', value: '9' },
        { label: '오후 12시', value: '12' },
        { label: '오후 6시', value: '18' },
        { label: '오후 9시', value: '21' },
      ],
      dayOfMonth: [
        { label: '매일', value: '*' },
        { label: '1일', value: '1' },
        { label: '15일', value: '15' },
        { label: '마지막 날 (28일)', value: '28' },
      ],
      month: [
        { label: '매월', value: '*' },
        { label: '1월', value: '1' },
        { label: '7월', value: '7' },
      ],
      dayOfWeek: [
        { label: '매일', value: '*' },
        { label: '월-금', value: '1-5' },
        { label: '토-일', value: '0,6' },
        { label: '월', value: '1' },
        { label: '화', value: '2' },
        { label: '수', value: '3' },
        { label: '목', value: '4' },
        { label: '금', value: '5' },
        { label: '토', value: '6' },
        { label: '일', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: 'Cron 표현식을 붙여넣으세요 (예: 0 9 * * 1-5)',
    button: '설명',
    error: '유효하지 않은 cron 표현식. 5개 필드를 사용하세요: 분 시 일 월 요일',
  },
  dialect: {
    unix: 'Unix',
    quartz: 'Quartz',
    aws: 'AWS',
    unixDesc: '5개 필드 (crontab)',
    quartzDesc: '6-7개 필드 (Java)',
    awsDesc: 'EventBridge',
  },
  copy: {
    label: '복사',
    copied: '복사됨!',
  },
  nextRuns: {
    title: '다음 10회 실행 (UTC)',
  },
  patterns: {
    title: '자주 사용하는 Cron 패턴',
    items: [
      { description: '매분', cron: '* * * * *' },
      { description: '5분마다', cron: '*/5 * * * *' },
      { description: '10분마다', cron: '*/10 * * * *' },
      { description: '30분마다', cron: '*/30 * * * *' },
      { description: '매시간', cron: '0 * * * *' },
      { description: '2시간마다', cron: '0 */2 * * *' },
      { description: '6시간마다', cron: '0 */6 * * *' },
      { description: '매일 자정', cron: '0 0 * * *' },
      { description: '매일 오전 9시', cron: '0 9 * * *' },
      { description: '매일 정오', cron: '0 12 * * *' },
      { description: '평일 오전 9시', cron: '0 9 * * 1-5' },
      { description: '평일 오후 5시', cron: '0 17 * * 1-5' },
      { description: '매주 월요일 오전 9시', cron: '0 9 * * 1' },
      { description: '매주 금요일 오후 5시', cron: '0 17 * * 5' },
      { description: '매월 1일', cron: '0 0 1 * *' },
      { description: '매월 15일', cron: '0 0 15 * *' },
      { description: '매주 일요일 정오', cron: '0 12 * * 0' },
      { description: '주말 자정', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: '자주 묻는 질문',
    items: [
      {
        q: 'Cron 표현식이란 무엇인가요?',
        a: 'Cron 표현식은 일정을 정의하는 5개 필드로 구성된 문자열입니다: 분(0-59), 시(0-23), 일(1-31), 월(1-12), 요일(0-6, 여기서 0은 일요일). 특수 문자: *(모두), ,(목록), -(범위), /(간격).',
      },
      {
        q: 'Unix, Quartz, AWS cron의 차이점은 무엇인가요?',
        a: 'Unix cron은 5개 필드를 가집니다. Quartz(Java에서 사용)는 초 필드와 선택적 연도 필드를 추가하여 총 6-7개 필드를 가지며, 일 필드에 * 대신 ?를 사용합니다. AWS EventBridge는 연도 필드가 있는 cron() 또는 rate() 표현식을 사용합니다.',
      },
      {
        q: '5분마다 cron 작업을 실행하려면 어떻게 하나요?',
        a: '*/5 * * * * (Unix), 0 */5 * ? * * * (Quartz) 또는 rate(5 minutes) (AWS)를 사용하세요. */5는 분 필드에서 "5 간격마다"를 의미합니다.',
      },
      {
        q: '평일에만 cron 작업을 실행하려면 어떻게 하나요?',
        a: '0 9 * * 1-5를 사용하면 월요일부터 금요일까지 오전 9시에 실행됩니다. 요일 필드의 1-5는 월요일(1)부터 금요일(5)까지를 의미합니다.',
      },
      {
        q: '이 도구는 무료인가요?',
        a: '네, 완전히 무료입니다. 로그인이 필요 없습니다. 모든 처리는 브라우저에서 이루어집니다. 어떤 데이터도 서버로 전송되지 않습니다.',
      },
    ],
  },
  footer: {
    text: '무료 Cron 표현식 생성기. 로그인 없음, 데이터 수집 없음.',
    link: 'AI 프롬프트 비용 계산기',
  },
  languageSwitcher: {
    label: '언어',
  },
}
