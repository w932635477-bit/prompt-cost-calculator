import type { Translations } from './types'

export const de: Translations = {
  meta: {
    title: 'Cron-Ausdruck-Generator | Kostenloses Online-Tool',
    description:
      'Kostenloser Generator, Erklärer und Konverter für Cron-Ausdrücke. Unterstützt Unix, Quartz und AWS EventBridge. Natürlichsprachliche Eingabe, visueller Builder, nächste Ausführungszeiten.',
  },
  header: {
    title: 'Cron-Ausdruck-Generator',
    subtitle:
      'Erstellen, erklären und konvertieren Sie Cron-Ausdrücke. Unterstützt Unix, Quartz und AWS EventBridge.',
    homeLink: 'KI-Kostenrechner',
  },
  expression: {
    label: 'Ausdruck',
    invalid: 'Ungültiger Cron-Ausdruck',
  },
  tabs: {
    builder: 'Builder',
    explainer: 'Erklärer',
  },
  nl: {
    placeholder:
      'Probieren Sie: "alle 5 Minuten", "werktags um 9 Uhr", "täglich"...',
    button: 'Generieren',
    error:
      'Muster nicht erkannt. Versuchen Sie einen der Vorschläge unten oder verwenden Sie den Builder.',
  },
  builder: {
    fields: ['Minute', 'Stunde', 'Tag des Monats', 'Monat', 'Wochentag'],
    presets: {
      minute: [
        { label: 'Jede Minute', value: '*' },
        { label: 'Alle 5', value: '*/5' },
        { label: 'Alle 10', value: '*/10' },
        { label: 'Alle 15', value: '*/15' },
        { label: 'Alle 30', value: '*/30' },
        { label: '0 (volle)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: 'Jede Stunde', value: '*' },
        { label: 'Alle 2', value: '*/2' },
        { label: 'Alle 3', value: '*/3' },
        { label: 'Alle 6', value: '*/6' },
        { label: 'Alle 12', value: '*/12' },
        { label: '0 (Mitternacht)', value: '0' },
        { label: '6 Uhr', value: '6' },
        { label: '9 Uhr', value: '9' },
        { label: '12 Uhr', value: '12' },
        { label: '18 Uhr', value: '18' },
        { label: '21 Uhr', value: '21' },
      ],
      dayOfMonth: [
        { label: 'Jeden Tag', value: '*' },
        { label: '1.', value: '1' },
        { label: '15.', value: '15' },
        { label: 'Letzter Tag (28)', value: '28' },
      ],
      month: [
        { label: 'Jeden Monat', value: '*' },
        { label: 'Jan', value: '1' },
        { label: 'Jul', value: '7' },
      ],
      dayOfWeek: [
        { label: 'Jeden Tag', value: '*' },
        { label: 'Mo-Fr', value: '1-5' },
        { label: 'Sa-So', value: '0,6' },
        { label: 'Mo', value: '1' },
        { label: 'Di', value: '2' },
        { label: 'Mi', value: '3' },
        { label: 'Do', value: '4' },
        { label: 'Fr', value: '5' },
        { label: 'Sa', value: '6' },
        { label: 'So', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: 'Fügen Sie einen Cron-Ausdruck ein (z.B. 0 9 * * 1-5)',
    button: 'Erklären',
    error:
      'Ungültiger Cron-Ausdruck. Verwenden Sie 5 Felder: Minute Stunde Tag Monat Wochentag',
  },
  dialect: {
    unix: 'Unix',
    quartz: 'Quartz',
    aws: 'AWS',
    unixDesc: '5 Felder (crontab)',
    quartzDesc: '6-7 Felder (Java)',
    awsDesc: 'EventBridge',
  },
  copy: {
    label: 'Kopieren',
    copied: 'Kopiert!',
  },
  nextRuns: {
    title: 'Die nächsten 10 Ausführungen (UTC)',
  },
  patterns: {
    title: 'Häufige Cron-Muster',
    items: [
      { description: 'Jede Minute', cron: '* * * * *' },
      { description: 'Alle 5 Minuten', cron: '*/5 * * * *' },
      { description: 'Alle 10 Minuten', cron: '*/10 * * * *' },
      { description: 'Alle 30 Minuten', cron: '*/30 * * * *' },
      { description: 'Jede Stunde', cron: '0 * * * *' },
      { description: 'Alle 2 Stunden', cron: '0 */2 * * *' },
      { description: 'Alle 6 Stunden', cron: '0 */6 * * *' },
      { description: 'Täglich um Mitternacht', cron: '0 0 * * *' },
      { description: 'Täglich um 9 Uhr', cron: '0 9 * * *' },
      { description: 'Täglich um 12 Uhr', cron: '0 12 * * *' },
      { description: 'Werktags um 9 Uhr', cron: '0 9 * * 1-5' },
      { description: 'Werktags um 17 Uhr', cron: '0 17 * * 1-5' },
      { description: 'Jeden Montag um 9 Uhr', cron: '0 9 * * 1' },
      { description: 'Jeden Freitag um 17 Uhr', cron: '0 17 * * 5' },
      { description: 'Erster Tag des Monats', cron: '0 0 1 * *' },
      { description: 'Am 15. jedes Monats', cron: '0 0 15 * *' },
      { description: 'Jeden Sonntag um 12 Uhr', cron: '0 12 * * 0' },
      { description: 'Wochenenden um Mitternacht', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: 'Häufig Gestellte Fragen',
    items: [
      {
        q: 'Was ist ein Cron-Ausdruck?',
        a: 'Ein Cron-Ausdruck ist eine Zeichenkette aus 5 Feldern, die einen Zeitplan definiert: Minute (0-59), Stunde (0-23), Tag des Monats (1-31), Monat (1-12) und Wochentag (0-6, wobei 0 Sonntag ist). Sonderzeichen: * (jeder), , (Liste), - (Bereich), / (Schritt).',
      },
      {
        q: 'Was ist der Unterschied zwischen Unix, Quartz und AWS cron?',
        a: 'Unix cron hat 5 Felder. Quartz (verwendet in Java) fügt ein Sekunden-Feld und ein optionales Jahres-Feld hinzu (insgesamt 6-7 Felder) und verwendet ? statt * für Tagesfelder. AWS EventBridge verwendet cron()- oder rate()-Ausdrücke mit einem Jahres-Feld.',
      },
      {
        q: 'Wie führe ich einen Cron-Job alle 5 Minuten aus?',
        a: 'Verwenden Sie */5 * * * * (Unix), 0 */5 * ? * * * (Quartz) oder rate(5 minutes) (AWS). Das */5 bedeutet "jeden 5. Wert" im Minuten-Feld.',
      },
      {
        q: 'Wie führe ich einen Cron-Job nur an Werktagen aus?',
        a: 'Verwenden Sie 0 9 * * 1-5, um um 9:00 Uhr von Montag bis Freitag auszuführen. Das 1-5 im Wochentag-Feld bedeutet Montag(1) bis Freitag(5).',
      },
      {
        q: 'Ist dieses Tool kostenlos?',
        a: 'Ja, völlig kostenlos. Keine Anmeldung erforderlich. Die gesamte Verarbeitung erfolgt in Ihrem Browser. Es werden keine Daten an einen Server gesendet.',
      },
    ],
  },
  footer: {
    text: 'Kostenloser Cron-Ausdruck-Generator. Keine Anmeldung, keine Datenerfassung.',
    link: 'KI-Prompt-Kostenrechner',
  },
  languageSwitcher: {
    label: 'Sprache',
  },
}
