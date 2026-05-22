import type { Translations } from './types'

export const es: Translations = {
  meta: {
    title: 'Generador de Expresiones Cron | Herramienta Gratuita Online',
    description:
      'Generador, explicador y convertidor gratuito de expresiones cron. Compatible con Unix, Quartz y AWS EventBridge. Entrada en lenguaje natural, constructor visual, próximos tiempos de ejecución.',
  },
  header: {
    title: 'Generador de Expresiones Cron',
    subtitle:
      'Construye, explica y convierte expresiones cron. Compatible con Unix, Quartz y AWS EventBridge.',
    homeLink: 'Calculadora de Costos IA',
  },
  expression: {
    label: 'Expresión',
    invalid: 'Expresión cron no válida',
  },
  tabs: {
    builder: 'Constructor',
    explainer: 'Explicador',
  },
  nl: {
    placeholder:
      'Prueba: "cada 5 minutos", "días laborables a las 9am", "diariamente"...',
    button: 'Generar',
    error:
      'Patrón no reconocido. Prueba una de las sugerencias de abajo o usa el constructor.',
  },
  builder: {
    fields: ['minuto', 'hora', 'día del mes', 'mes', 'día de la semana'],
    presets: {
      minute: [
        { label: 'Cada minuto', value: '*' },
        { label: 'Cada 5', value: '*/5' },
        { label: 'Cada 10', value: '*/10' },
        { label: 'Cada 15', value: '*/15' },
        { label: 'Cada 30', value: '*/30' },
        { label: '0 (en punto)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: 'Cada hora', value: '*' },
        { label: 'Cada 2', value: '*/2' },
        { label: 'Cada 3', value: '*/3' },
        { label: 'Cada 6', value: '*/6' },
        { label: 'Cada 12', value: '*/12' },
        { label: '0 (medianoche)', value: '0' },
        { label: '6 AM', value: '6' },
        { label: '9 AM', value: '9' },
        { label: '12 PM', value: '12' },
        { label: '6 PM', value: '18' },
        { label: '9 PM', value: '21' },
      ],
      dayOfMonth: [
        { label: 'Cada día', value: '*' },
        { label: 'Día 1', value: '1' },
        { label: 'Día 15', value: '15' },
        { label: 'Último día (28)', value: '28' },
      ],
      month: [
        { label: 'Cada mes', value: '*' },
        { label: 'Ene', value: '1' },
        { label: 'Jul', value: '7' },
      ],
      dayOfWeek: [
        { label: 'Cada día', value: '*' },
        { label: 'Lun-Vie', value: '1-5' },
        { label: 'Sáb-Dom', value: '0,6' },
        { label: 'Lun', value: '1' },
        { label: 'Mar', value: '2' },
        { label: 'Mié', value: '3' },
        { label: 'Jue', value: '4' },
        { label: 'Vie', value: '5' },
        { label: 'Sáb', value: '6' },
        { label: 'Dom', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: 'Pega cualquier expresión cron (ej. 0 9 * * 1-5)',
    button: 'Explicar',
    error:
      'Expresión cron no válida. Usa 5 campos: minuto hora día mes día-semana',
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
    copied: '¡Copiado!',
  },
  nextRuns: {
    title: 'Próximas 10 ejecuciones (UTC)',
  },
  patterns: {
    title: 'Patrones Cron Comunes',
    items: [
      { description: 'Cada minuto', cron: '* * * * *' },
      { description: 'Cada 5 minutos', cron: '*/5 * * * *' },
      { description: 'Cada 10 minutos', cron: '*/10 * * * *' },
      { description: 'Cada 30 minutos', cron: '*/30 * * * *' },
      { description: 'Cada hora', cron: '0 * * * *' },
      { description: 'Cada 2 horas', cron: '0 */2 * * *' },
      { description: 'Cada 6 horas', cron: '0 */6 * * *' },
      { description: 'Cada día a medianoche', cron: '0 0 * * *' },
      { description: 'Cada día a las 9 AM', cron: '0 9 * * *' },
      { description: 'Cada día al mediodía', cron: '0 12 * * *' },
      { description: 'Días laborables a las 9 AM', cron: '0 9 * * 1-5' },
      { description: 'Días laborables a las 5 PM', cron: '0 17 * * 1-5' },
      { description: 'Cada lunes a las 9 AM', cron: '0 9 * * 1' },
      { description: 'Cada viernes a las 5 PM', cron: '0 17 * * 5' },
      { description: 'Primer día del mes', cron: '0 0 1 * *' },
      { description: 'Día 15 de cada mes', cron: '0 0 15 * *' },
      { description: 'Cada domingo al mediodía', cron: '0 12 * * 0' },
      { description: 'Fines de semana a medianoche', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: 'Preguntas Frecuentes',
    items: [
      {
        q: '¿Qué es una expresión cron?',
        a: 'Una expresión cron es una cadena de 5 campos que define una programación: minuto (0-59), hora (0-23), día del mes (1-31), mes (1-12) y día de la semana (0-6, donde 0 es domingo). Caracteres especiales: * (cualquiera), , (lista), - (rango), / (intervalo).',
      },
      {
        q: '¿Cuál es la diferencia entre Unix, Quartz y AWS cron?',
        a: 'Unix cron tiene 5 campos. Quartz (usado en Java) añade un campo de segundos y un campo de año opcional (6-7 campos en total), y usa ? en lugar de * para los campos de día. AWS EventBridge usa expresiones cron() o rate() con un campo de año.',
      },
      {
        q: '¿Cómo ejecuto un cron job cada 5 minutos?',
        a: 'Usa */5 * * * * (Unix), 0 */5 * ? * * * (Quartz) o rate(5 minutes) (AWS). El */5 significa "cada 5 valores" en el campo de minutos.',
      },
      {
        q: '¿Cómo ejecuto un cron job solo en días laborables?',
        a: 'Usa 0 9 * * 1-5 para ejecutar a las 9:00 AM de lunes a viernes. El 1-5 en el campo día de la semana significa de lunes(1) a viernes(5).',
      },
      {
        q: '¿Esta herramienta es gratuita?',
        a: 'Sí, completamente gratuita. No requiere inicio de sesión. Todo el procesamiento ocurre en tu navegador. No se envían datos a ningún servidor.',
      },
    ],
  },
  footer: {
    text: 'Generador de expresiones cron gratuito. Sin registro, sin recopilación de datos.',
    link: 'Calculadora de Costos de Prompts IA',
  },
  languageSwitcher: {
    label: 'Idioma',
  },
}
