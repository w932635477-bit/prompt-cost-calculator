import type { Translations } from './types'

export const fr: Translations = {
  meta: {
    title: 'Générateur d\'Expressions Cron | Outil Gratuit en Ligne',
    description:
      'Générateur, explicateur et convertisseur gratuit d\'expressions cron. Compatible Unix, Quartz et AWS EventBridge. Saisie en langage naturel, constructeur visuel, prochaines exécutions.',
  },
  header: {
    title: 'Générateur d\'Expressions Cron',
    subtitle:
      'Créez, expliquez et convertissez des expressions cron. Compatible Unix, Quartz et AWS EventBridge.',
    homeLink: 'Calculateur de Coûts IA',
  },
  expression: {
    label: 'Expression',
    invalid: 'Expression cron invalide',
  },
  tabs: {
    builder: 'Constructeur',
    explainer: 'Explicateur',
  },
  nl: {
    placeholder:
      'Essayez : "toutes les 5 minutes", "jours ouvrés à 9h", "quotidien"...',
    button: 'Générer',
    error:
      'Modèle non reconnu. Essayez l\'une des suggestions ci-dessous ou utilisez le constructeur.',
  },
  builder: {
    fields: ['minute', 'heure', 'jour du mois', 'mois', 'jour de la semaine'],
    presets: {
      minute: [
        { label: 'Chaque minute', value: '*' },
        { label: 'Toutes les 5', value: '*/5' },
        { label: 'Toutes les 10', value: '*/10' },
        { label: 'Toutes les 15', value: '*/15' },
        { label: 'Toutes les 30', value: '*/30' },
        { label: '0 (pile)', value: '0' },
        { label: '30', value: '30' },
      ],
      hour: [
        { label: 'Chaque heure', value: '*' },
        { label: 'Toutes les 2', value: '*/2' },
        { label: 'Toutes les 3', value: '*/3' },
        { label: 'Toutes les 6', value: '*/6' },
        { label: 'Toutes les 12', value: '*/12' },
        { label: '0 (minuit)', value: '0' },
        { label: '6h', value: '6' },
        { label: '9h', value: '9' },
        { label: '12h', value: '12' },
        { label: '18h', value: '18' },
        { label: '21h', value: '21' },
      ],
      dayOfMonth: [
        { label: 'Chaque jour', value: '*' },
        { label: '1er', value: '1' },
        { label: '15', value: '15' },
        { label: 'Dernier jour (28)', value: '28' },
      ],
      month: [
        { label: 'Chaque mois', value: '*' },
        { label: 'Jan', value: '1' },
        { label: 'Juil', value: '7' },
      ],
      dayOfWeek: [
        { label: 'Chaque jour', value: '*' },
        { label: 'Lun-Ven', value: '1-5' },
        { label: 'Sam-Dim', value: '0,6' },
        { label: 'Lun', value: '1' },
        { label: 'Mar', value: '2' },
        { label: 'Mer', value: '3' },
        { label: 'Jeu', value: '4' },
        { label: 'Ven', value: '5' },
        { label: 'Sam', value: '6' },
        { label: 'Dim', value: '0' },
      ],
    },
  },
  explainer: {
    placeholder: 'Collez une expression cron (ex. 0 9 * * 1-5)',
    button: 'Expliquer',
    error:
      'Expression cron invalide. Utilisez 5 champs : minute heure jour mois jour-semaine',
  },
  dialect: {
    unix: 'Unix',
    quartz: 'Quartz',
    aws: 'AWS',
    unixDesc: '5 champs (crontab)',
    quartzDesc: '6-7 champs (Java)',
    awsDesc: 'EventBridge',
  },
  copy: {
    label: 'Copier',
    copied: 'Copié !',
  },
  nextRuns: {
    title: '10 prochaines exécutions (UTC)',
  },
  patterns: {
    title: 'Modèles Cron Courants',
    items: [
      { description: 'Chaque minute', cron: '* * * * *' },
      { description: 'Toutes les 5 minutes', cron: '*/5 * * * *' },
      { description: 'Toutes les 10 minutes', cron: '*/10 * * * *' },
      { description: 'Toutes les 30 minutes', cron: '*/30 * * * *' },
      { description: 'Chaque heure', cron: '0 * * * *' },
      { description: 'Toutes les 2 heures', cron: '0 */2 * * *' },
      { description: 'Toutes les 6 heures', cron: '0 */6 * * *' },
      { description: 'Chaque jour à minuit', cron: '0 0 * * *' },
      { description: 'Chaque jour à 9h', cron: '0 9 * * *' },
      { description: 'Chaque jour à midi', cron: '0 12 * * *' },
      { description: 'Jours ouvrés à 9h', cron: '0 9 * * 1-5' },
      { description: 'Jours ouvrés à 17h', cron: '0 17 * * 1-5' },
      { description: 'Chaque lundi à 9h', cron: '0 9 * * 1' },
      { description: 'Chaque vendredi à 17h', cron: '0 17 * * 5' },
      { description: 'Premier jour du mois', cron: '0 0 1 * *' },
      { description: 'Le 15 de chaque mois', cron: '0 0 15 * *' },
      { description: 'Chaque dimanche à midi', cron: '0 12 * * 0' },
      { description: 'Week-ends à minuit', cron: '0 0 * * 0,6' },
    ],
  },
  faq: {
    title: 'Questions Fréquemment Posées',
    items: [
      {
        q: 'Qu\'est-ce qu\'une expression cron ?',
        a: 'Une expression cron est une chaîne de 5 champs qui définit une planification : minute (0-59), heure (0-23), jour du mois (1-31), mois (1-12) et jour de la semaine (0-6, où 0 est dimanche). Caractères spéciaux : * (n\'importe), , (liste), - (plage), / (pas).',
      },
      {
        q: 'Quelle est la différence entre Unix, Quartz et AWS cron ?',
        a: 'Unix cron possède 5 champs. Quartz (utilisé en Java) ajoute un champ secondes et un champ année facultatif (6-7 champs au total), et utilise ? à la place de * pour les champs jour. AWS EventBridge utilise des expressions cron() ou rate() avec un champ année.',
      },
      {
        q: 'Comment exécuter un cron job toutes les 5 minutes ?',
        a: 'Utilisez */5 * * * * (Unix), 0 */5 * ? * * * (Quartz) ou rate(5 minutes) (AWS). Le */5 signifie "tous les 5 valeurs" dans le champ minute.',
      },
      {
        q: 'Comment exécuter un cron job uniquement les jours ouvrés ?',
        a: 'Utilisez 0 9 * * 1-5 pour exécuter à 9h00 du lundi au vendredi. Le 1-5 dans le champ jour de la semaine signifie de lundi(1) à vendredi(5).',
      },
      {
        q: 'Cet outil est-il gratuit ?',
        a: 'Oui, entièrement gratuit. Aucune connexion requise. Tout le traitement se fait dans votre navigateur. Aucune donnée n\'est envoyée à un serveur.',
      },
    ],
  },
  footer: {
    text: 'Générateur d\'expressions cron gratuit. Sans inscription, sans collecte de données.',
    link: 'Calculateur de Coûts de Prompts IA',
  },
  languageSwitcher: {
    label: 'Langue',
  },
}
