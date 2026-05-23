import { chromium } from 'playwright';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_DIR = '/tmp/reddit-automation-chrome-profile';

const SUBREDDIT = process.argv[2] || 'SideProject';

const POSTS = {
  SideProject: {
    title: 'I built a free Cron Expression Generator with 151 presets, 8 languages, and Quartz support',
    body: `I kept Googling "cron every 5 minutes" every time I needed a schedule expression, so I built a tool that makes it visual:

https://prompt-cost-calculator-ten.vercel.app/cron-generator/

What it does:
- Visual builder: click to generate any cron expression, no syntax memorization
- Natural language input: type "every weekday at 9am" and get \`0 9 * * 1-5\`
- Explainer: paste any cron expression, get plain English back
- 151 pre-built schedule presets (every 5 min, weekdays 9am, last day of month, etc.)
- Supports Unix cron + Quartz format + AWS EventBridge
- Shows next 5 run times
- 8 languages: English, 中文, 日本語, 한국어, Español, Português, Français, Deutsch
- 100% client-side, no login, no tracking

Built with React + Vite + cron-parser. Free forever. Feedback welcome!`,
  },
  linux: {
    title: 'Free cron expression generator — visual builder + 151 presets + natural language input',
    body: `Hey r/linux,

I got tired of looking up cron syntax every time, so I built a free generator:

https://prompt-cost-calculator-ten.vercel.app/cron-generator/

Features:
- Visual builder (no memorizing field positions)
- Natural language: "every 30 minutes during business hours" → correct expression
- Explainer mode: paste any cron, get plain English
- 151 pre-built schedules for common patterns
- Shows next 5 execution times
- Quartz and AWS EventBridge dialect support
- Copy button for quick paste into crontab

No signup, runs entirely in browser. Hope it saves you some man page reading!`,
  },
  devops: {
    title: 'Built a free cron schedule generator — supports Unix, Quartz, and AWS EventBridge',
    body: `For anyone managing scheduled jobs across platforms, I built a tool that handles all three cron dialects:

https://prompt-cost-calculator-ten.vercel.app/cron-generator/

- Unix crontab (5 field)
- Quartz scheduler (6-7 field, with ? and L/W modifiers)
- AWS EventBridge (with ? support)

Also includes: natural language input, 151 preset schedules, next-run preview, and plain English explanation of any expression.

Free, no login. Built with React + cron-parser. Would love feedback from fellow DevOps folks.`,
  },
  aws: {
    title: 'Free AWS EventBridge cron expression generator with schedule presets',
    body: `If you configure EventBridge scheduled rules, I built a free tool that generates the correct cron expressions:

https://prompt-cost-calculator-ten.vercel.app/cron-generator/

AWS EventBridge uses a modified cron syntax (6 fields with required ? in day-of-month or day-of-week). This tool handles it correctly and also supports standard Unix cron and Quartz.

Includes natural language input, 151 presets, and next-run preview. No login, runs in browser.`,
  },
  webdev: {
    title: 'I built a free Cron Expression Generator with 151 schedule presets, 8 languages, and Quartz support',
    body: `I kept Googling "cron every 5 minutes" every time, so I built a free tool:

https://prompt-cost-calculator-ten.vercel.app/cron-generator/

- Visual cron builder (no syntax memorization)
- Natural language input: "every weekday at 9am"
- Explainer: paste any cron, get plain English
- 151 pre-built schedules
- Unix + Quartz + AWS EventBridge support
- Next 5 run times preview
- 8 languages (EN, ZH, JA, KO, ES, PT, FR, DE)
- FAQ + HowTo structured data on all pages
- 100% client-side, no API, no login

Built with React + Vite + Tailwind + cron-parser. Deployed on Vercel. Feedback welcome!`,
  },
};

(async () => {
  const post = POSTS[SUBREDDIT];
  if (!post) {
    console.error(`Unknown subreddit: ${SUBREDDIT}. Available: ${Object.keys(POSTS).join(', ')}`);
    process.exit(1);
  }

  console.log(`Launching Chrome for r/${SUBREDDIT}...`);
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath: CHROME_PATH,
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = context.pages()[0] || await context.newPage();

  // Navigate to Reddit first to check login
  console.log('Checking Reddit login status...');
  await page.goto('https://www.reddit.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const loginBtn = await page.locator('[href="/login/"], a:has-text("Log In")').count();
  if (loginBtn > 0) {
    console.log('\n=== LOGIN REQUIRED ===');
    console.log('Please log in to Reddit in the Chrome window that just opened.');
    console.log('Waiting for login (2 minute timeout)...\n');
    await page.goto('https://www.reddit.com/login/', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(url => !url.includes('login'), { timeout: 120000 });
    console.log('Logged in!');
    await page.waitForTimeout(3000);
  } else {
    console.log('Already logged in.');
  }

  // Navigate to submit page
  console.log(`\nNavigating to r/${SUBREDDIT} submit page...`);
  await page.goto(`https://www.reddit.com/r/${SUBREDDIT}/submit`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  // Screenshot the submit page for debugging
  await page.screenshot({ path: `/tmp/reddit-submit-${SUBREDDIT}.png` });
  console.log(`Submit page screenshot: /tmp/reddit-submit-${SUBREDDIT}.png`);

  // Fill title - try multiple selectors
  console.log('Filling title...');
  const titleSelectors = [
    'textarea[placeholder*="Title"]',
    '#post-title',
    'textarea[name="title"]',
    '[data-testid="post-title-textarea"]',
  ];
  let titleFilled = false;
  for (const sel of titleSelectors) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loc.fill(post.title);
      titleFilled = true;
      console.log(`Title filled via: ${sel}`);
      break;
    }
  }
  if (!titleFilled) {
    console.error('Could not find title input. Check screenshot.');
    await page.screenshot({ path: `/tmp/reddit-error-title-${SUBREDDIT}.png`, fullPage: true });
    await context.close();
    process.exit(1);
  }

  await page.waitForTimeout(500);

  // Try to switch to Markdown mode
  const mdToggle = page.locator('button:has-text("Markdown"), [data-testid="markdown-toggle"]').first();
  if (await mdToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await mdToggle.click();
    await page.waitForTimeout(500);
    console.log('Switched to Markdown mode.');
  }

  // Fill body
  console.log('Filling body...');
  const bodySelectors = [
    'textarea[placeholder*="Text"]',
    'textarea[placeholder*="text"]',
    '.md-editor textarea',
    '[name="text"]',
    '[data-testid="post-body-textarea"]',
    'div[contenteditable="true"]',
  ];
  let bodyFilled = false;
  for (const sel of bodySelectors) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loc.fill(post.body);
      bodyFilled = true;
      console.log(`Body filled via: ${sel}`);
      break;
    }
  }
  if (!bodyFilled) {
    console.error('Could not find body input. Check screenshot.');
    await page.screenshot({ path: `/tmp/reddit-error-body-${SUBREDDIT}.png`, fullPage: true });
    await context.close();
    process.exit(1);
  }

  await page.waitForTimeout(1000);

  // Click Post/Submit button
  console.log('Clicking Post...');
  const submitSelectors = [
    'button:has-text("Post")',
    'button[type="submit"]',
    '[data-testid="submit-post-button"]',
  ];
  let submitted = false;
  for (const sel of submitSelectors) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loc.click();
      submitted = true;
      console.log(`Clicked: ${sel}`);
      break;
    }
  }

  if (!submitted) {
    console.error('Could not find submit button. Check screenshot.');
    await page.screenshot({ path: `/tmp/reddit-error-submit-${SUBREDDIT}.png`, fullPage: true });
    await context.close();
    process.exit(1);
  }

  // Wait for navigation/confirmation
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `/tmp/reddit-result-${SUBREDDIT}.png`, fullPage: true });
  console.log(`\nResult screenshot: /tmp/reddit-result-${SUBREDDIT}.png`);
  console.log(`Post to r/${SUBREDDIT} completed!`);

  await context.close();
})();
