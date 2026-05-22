import type { Translations } from './types'

export const pt: Translations = {
  meta: {
    title: 'Gerador de Expressões Cron | Ferramenta Gratuita Online',
    description:
      'Gerador, explicador e conversor gratuito de expressões cron. Compatível com Unix, Quartz e AWS EventBridge. Entrada em linguagem natural, construtor visual, próximos horários de execução.',
  },
  header: {
    title: 'Gerador de Expressões Cron',
    subtitle:
      'Construa, explique e converta expressões cron. Compatível com Unix, Quartz e AWS EventBridge.',
    homeLink: 'Calculadora de Custos IA',
  },
  expression: {
    label: 'Expressão',
    invalid: 'Expressão cron inválida',
  },
  tabs: {
    builder: 'Construtor',
    explainer: 'Explicador',
  },
  nl: {
    placeholder:
      'Experimente: "a cada 5 minutos", "dias úteis às 9h", "diariamente"...',
    button: 'Gerar',
    error:
      'Padrão não reconhecido. Tente uma das sugestões abaixo ou use o construtor.',
  },
  builder: {
    fields: ['minuto', 'hora', 'dia do mês', 'mês', 'dia da semana'],
    presets: {
      minute: [
        { label: 'Cada minuto', value: '*' },
        { label: 'A cada 5', value: '*/5' },
        { label: 'A cada 10', value: '*/10' },
        { label: 'A cada 15', value: '*/15' },
        { label: 'A cada 30', value: '*/30' },
        { label: '0 (em ponto)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: 'Cada hora', value: '*' },
        { label: 'A cada 2', value: '*/2' },
        { label: 'A cada 3', value: '*/3' },
        { label: 'A cada 6', value: '*/6' },
        { label: 'A cada 12', value: '*/12' },
        { label: '0 (meia-noite)', value: '0' },
        { label: '6h', value: '6' },
        { label: '9h', value: '9' },
        { label: '12h', value: '12' },
        { label: '18h', value: '18' },
        { label: '21h', value: '21' },
      ],
      dayOfMonth: [
        { label: 'Cada dia', value: '*' },
        { label: 'Dia 1', value: '1' },
        { label: 'Dia 15', value: '15' },
        { label: 'Último dia (28)', value: '28' },
      ],
      month: [
        { label: 'Cada mês', value: '*' },
        { label: 'Jan', value: '1' },
        { label: 'Jul', value: '7' },
      ],
      dayOfWeek: [
        { label: 'Cada dia', value: '*' },
        { label: 'Seg-Sex', value: '1-5' },
        { label: 'Sáb-Dom', value: '0,6' },
        { label: 'Seg', value: '1' },
        { label: 'Ter', value: '2' },
        { label: 'Qua', value: '3' },
        { label: 'Qui', value: '4' },
        { label: 'Sex', value: '5' },
        { label: 'Sáb', value: '6' },
        { label: 'Dom', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: 'Cole qualquer expressão cron (ex. 0 9 * * 1-5)',
    button: 'Explicar',
    error:
      'Expressão cron inválida. Use 5 campos: minuto hora dia mês dia-da-semana',
  },
  dialect: {
    unix: 'Unix',
    quartz: 'Quartz',
    aws: 'AWS',
    unixDesc: '5 campos (crontab)',
    quartzDesc: '6-7 campos (Java)',
    awsDesc: 'EventBridge',
  },
  copy: {
    label: 'Copiar',
    copied: 'Copiado!',
  },
  nextRuns: {
    title: 'Próximas 10 execuções (UTC)',
  },
  patterns: {
    title: 'Padrões Cron Comuns',
    items: [
      { description: 'Cada minuto', cron: '* * * * *' },
      { description: 'A cada 5 minutos', cron: '*/5 * * * *' },
      { description: 'A cada 10 minutos', cron: '*/10 * * * *' },
      { description: 'A cada 30 minutos', cron: '*/30 * * * *' },
      { description: 'Cada hora', cron: '0 * * * *' },
      { description: 'A cada 2 horas', cron: '0 */2 * * *' },
      { description: 'A cada 6 horas', cron: '0 */6 * * *' },
      { description: 'Diariamente à meia-noite', cron: '0 0 * * *' },
      { description: 'Diariamente às 9h', cron: '0 9 * * *' },
      { description: 'Diariamente ao meio-dia', cron: '0 12 * * *' },
      { description: 'Dias úteis às 9h', cron: '0 9 * * 1-5' },
      { description: 'Dias úteis às 17h', cron: '0 17 * * 1-5' },
      { description: 'Toda segunda às 9h', cron: '0 9 * * 1' },
      { description: 'Toda sexta às 17h', cron: '0 17 * * 5' },
      { description: 'Primeiro dia do mês', cron: '0 0 1 * *' },
      { description: 'Dia 15 de cada mês', cron: '0 0 15 * *' },
      { description: 'Todo domingo ao meio-dia', cron: '0 12 * * 0' },
      { description: 'Finais de semana à meia-noite', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: 'Perguntas Frequentes',
    items: [
      {
        q: 'O que é uma expressão cron?',
        a: 'Uma expressão cron é uma string de 5 campos que define um agendamento: minuto (0-59), hora (0-23), dia do mês (1-31), mês (1-12) e dia da semana (0-6, onde 0 é domingo). Caracteres especiais: * (qualquer), , (lista), - (intervalo), / (degrau).',
      },
      {
        q: 'Qual a diferença entre Unix, Quartz e AWS cron?',
        a: 'Unix cron tem 5 campos. Quartz (usado em Java) adiciona um campo de segundos e um campo de ano opcional (6-7 campos no total), e usa ? em vez de * para campos de dia. AWS EventBridge usa expressões cron() ou rate() com um campo de ano.',
      },
      {
        q: 'Como executar um cron job a cada 5 minutos?',
        a: 'Use */5 * * * * (Unix), 0 */5 * ? * * * (Quartz) ou rate(5 minutes) (AWS). O */5 significa "cada 5 valores" no campo de minutos.',
      },
      {
        q: 'Como executar um cron job apenas em dias úteis?',
        a: 'Use 0 9 * * 1-5 para executar às 9:00 de segunda a sexta. O 1-5 no campo dia da semana significa de segunda(1) a sexta(5).',
      },
      {
        q: 'Esta ferramenta é gratuita?',
        a: 'Sim, completamente gratuita. Não requer login. Todo o processamento acontece no seu navegador. Nenhum dado é enviado a qualquer servidor.',
      },
    ],
  },
  footer: {
    text: 'Gerador de expressões cron gratuito. Sem cadastro, sem coleta de dados.',
    link: 'Calculadora de Custos de Prompts IA',
  },
  languageSwitcher: {
    label: 'Idioma',
  },
}
