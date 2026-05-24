import { chromium } from 'playwright';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_DIR = '/tmp/reddit-automation-chrome-profile';
const SUBREDDIT = process.argv[2] || 'webdev';
const LIMIT = parseInt(process.argv[3] || '5', 10);

const WARMUP_SUBREDDITS = [
  'webdev', 'programming', 'SideProject', 'devops', 'linux',
  'learnprogramming', 'selfhosted', 'docker', 'javascript',
  'reactjs', 'node', 'sveltejs', 'vuejs',
];

const COMMENT_TEMPLATES = {
  cron: [
    `Side note for anyone dealing with cron schedules: I found that writing out "every weekday at 9am" and converting it is way less error-prone than memorizing the field positions. There are decent free tools for this now.`,
    `I always double-check my cron expressions with a visual builder before putting them in production. Saved me from more than a few "ran at midnight instead of noon" incidents.`,
    `For anyone new to cron: the biggest gotcha is mixing up day-of-month and day-of-week when using both. Test your expressions before deploying!`,
    `Pro tip: if you're on AWS, EventBridge cron uses a slightly different syntax than standard Unix cron (6 fields, and you need ? instead of * in some positions). Caught me off guard the first time.`,
  ],
  docker: [
    `Docker Compose has been a game changer for my self-hosted setup. One \`docker compose up -d\` and everything just works. Highly recommend it over running individual containers.`,
    `If you're getting started with self-hosting, I'd suggest starting with something simple like a reverse proxy (Caddy or Nginx) + one app. Don't try to set up everything at once.`,
    `For anyone self-hosting, don't forget to set up proper volume mounts for persistent data. Losing your database because you recreated the container is not a fun experience.`,
  ],
  selfhosted: [
    `I've been gradually replacing SaaS tools with self-hosted alternatives. The key insight is that most open-source alternatives are good enough for personal/small team use, and you learn a ton about DevOps in the process.`,
    `One thing I wish I knew earlier: always check the RAM requirements before deploying. Some self-hosted apps need 2-4GB minimum and will struggle on a $5 VPS.`,
    `Vaultwarden is probably the easiest win for self-hosting. Drop-in Bitwarden replacement, runs on 256MB RAM, and you get full password manager functionality.`,
  ],
  webdev: [
    `This is solid advice. I'd add: always test your UI on mobile first. Desktop-only testing is the #1 source of "works on my machine" complaints from users.`,
    `One thing that helped me ship faster: building tools I actually need myself first, then releasing them. Dogfooding catches 90% of the UX problems before anyone else sees them.`,
    `For anyone building developer tools: make them work without login. The friction of creating an account kills conversion for free tools. I learned this the hard way.`,
  ],
  programming: [
    `The best code is the code you don't write. Before building something from scratch, check if there's a well-maintained library that does 80% of what you need.`,
    `I've found that the fastest way to learn a new framework is to build a small, complete project with it. Tutorials only get you so far - you need the "glue" experience.`,
    `Hot take: most "senior developer" advice boils down to "think before you type, test after you type, and document why you typed it."`,
  ],
  sideproject: [
    `Love seeing indie projects like this! The key to getting traction is solving a specific pain point really well, rather than building a Swiss Army knife.`,
    `For anyone starting a side project: ship early, ship ugly. Getting real users matters more than polish at the beginning.`,
    `Great project! One suggestion: add a "no login required" badge prominently. Developers love tools they can try instantly without creating yet another account.`,
  ],
};

const SUBREDDIT_TOPICS = {
  webdev: ['webdev', 'sideproject', 'programming'],
  programming: ['programming', 'webdev'],
  SideProject: ['sideproject', 'webdev'],
  devops: ['docker', 'cron', 'selfhosted'],
  linux: ['cron', 'docker', 'selfhosted'],
  learnprogramming: ['programming', 'webdev'],
  selfhosted: ['selfhosted', 'docker'],
  docker: ['docker', 'selfhosted'],
  javascript: ['webdev', 'programming'],
  reactjs: ['webdev', 'programming'],
  node: ['webdev', 'programming'],
  sveltejs: ['webdev', 'programming'],
  vuejs: ['webdev', 'programming'],
};

function getRandomComment(subreddit) {
  const topics = SUBREDDIT_TOPICS[subreddit] || ['webdev', 'programming'];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const comments = COMMENT_TEMPLATES[topic];
  return comments[Math.floor(Math.random() * comments.length)];
}

async function findAndClickCommentBox(page) {
  // Step 1: Click "Add a comment" or similar trigger to reveal the comment editor
  const triggerSelectors = [
    'button:has-text("Add a comment")',
    'a:has-text("Add a comment")',
    'div:has-text("Add a comment")',
    '[data-testid="comment-button"]',
    'button:has-text("Comment"):not([type="submit"])',
  ];
  for (const sel of triggerSelectors) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible({ timeout: 1000 }).catch(() => false)) {
      await loc.click();
      await page.waitForTimeout(1500);
      break;
    }
  }

  // Step 2: Look for the comment editor (may be hidden initially, try forcing visibility)
  const editorSelectors = [
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    'textarea[placeholder*="comment" i]',
    'textarea[placeholder*="What" i]',
    'textarea[name="text"]',
    'textarea',
  ];

  for (const sel of editorSelectors) {
    const loc = page.locator(sel).first();
    // Check if element exists in DOM (even if not visible)
    const count = await loc.count();
    if (count > 0) {
      // Force click to focus, even if not fully visible
      await loc.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(500);
      await loc.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
      return { selector: sel, locator: loc };
    }
  }
  return null;
}

async function typeComment(page, locator, text) {
  // Focus the element first
  await locator.click();
  await page.waitForTimeout(500);

  // Select all existing text (in case placeholder text is selected)
  await page.keyboard.press('Meta+a');
  await page.waitForTimeout(200);

  // Type the comment character by character for natural feel
  await page.keyboard.type(text, { delay: 30 + Math.random() * 50 });
}

async function clickCommentButton(page) {
  // Wait a moment for the button to become enabled after typing
  await page.waitForTimeout(1000);

  const btnSelectors = [
    'button:has-text("Comment")',
    'button:has-text("comment")',
    '[data-testid="comment-submit"]',
    'button[type="submit"]',
  ];

  for (const sel of btnSelectors) {
    const loc = page.locator(sel).first();
    const count = await loc.count();
    if (count > 0) {
      // Scroll into view and click
      await loc.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(300);
      await loc.click({ force: true }).catch(() => {});
      return true;
    }
  }
  return false;
}

(async () => {
  if (!WARMUP_SUBREDDITS.includes(SUBREDDIT)) {
    console.error(`Unknown subreddit: ${SUBREDDIT}`);
    console.log(`Available: ${WARMUP_SUBREDDITS.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n=== Reddit Auto-Warming: r/${SUBREDDIT} ===`);
  console.log(`Target: ${LIMIT} comments. Fully automatic.\n`);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath: CHROME_PATH,
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = context.pages()[0] || await context.newPage();

  // Check login
  console.log('Checking Reddit login...');
  await page.goto('https://www.reddit.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const loginBtn = await page.locator('[href="/login/"], a:has-text("Log In")').count();
  if (loginBtn > 0) {
    console.log('\nNOT LOGGED IN. Opening login page...');
    console.log('Please log in manually in the Chrome window.');
    await page.goto('https://www.reddit.com/login/', { waitUntil: 'domcontentloaded' });

    // Poll for login completion
    for (let i = 0; i < 48; i++) { // 4 minutes
      await page.waitForTimeout(5000);
      const url = page.url();
      const stillLogin = await page.locator('input[name="username"]').count().catch(() => 0);
      if (!url.includes('login') && stillLogin === 0) {
        console.log('Logged in!');
        break;
      }
      if (i === 47) {
        console.log('Login timeout. Exiting.');
        await context.close();
        process.exit(1);
      }
    }
    await page.waitForTimeout(2000);
  } else {
    console.log('Already logged in.');
  }

  // Navigate to subreddit — new posts
  console.log(`\nBrowsing r/${SUBREDDIT} (new posts)...`);
  await page.goto(`https://www.reddit.com/r/${SUBREDDIT}/new/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Scroll to load content
  for (let s = 0; s < 3; s++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Collect post links
  const posts = await page.evaluate(() => {
    const links = [];
    const seen = new Set();
    const selectors = [
      'a[data-click-id="body"]',
      'a[href^="/r/"][slot="full-post-link"]',
      'article a[href^="/r/"]',
      'div[data-testid="post-container"] a[href^="/r/"]',
      'a[href*="/comments/"]',
      '[role="link"][href^="/r/"]',
    ];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(a => {
        const href = a.getAttribute('href');
        const title = a.textContent?.trim();
        if (href && title && href.includes('/comments/') && !seen.has(href)) {
          seen.add(href);
          links.push({ href: href.startsWith('http') ? href : 'https://www.reddit.com' + href, title: title.substring(0, 80) });
        }
      });
    }
    return links.slice(0, 10);
  });

  if (posts.length === 0) {
    console.log('No posts found. Exiting.');
    await context.close();
    process.exit(0);
  }

  console.log(`Found ${posts.length} posts. Starting auto-comment...\n`);

  let commented = 0;
  let skipped = 0;

  for (let i = 0; i < posts.length && commented < LIMIT; i++) {
    const post = posts[i];
    console.log(`--- Post ${i + 1}/${posts.length} ---`);
    console.log(`Title: ${post.title}`);

    await page.goto(post.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check if locked/archived within post content area only
    const isLocked = await page.evaluate(() => {
      const el = document.querySelector('[data-test-id="post-content"], [slot="post"], article');
      if (!el) return false;
      const t = el.textContent?.toLowerCase() || '';
      return t.includes('locked thread') || t.includes('archived post');
    });
    if (isLocked) {
      console.log('Locked/archived, skipping.');
      skipped++;
      continue;
    }

    // Scroll down to ensure comment section is loaded
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);

    // Find and activate the comment input area
    const commentBox = await findAndClickCommentBox(page);
    if (!commentBox) {
      console.log('No comment box found, skipping.');
      skipped++;
      continue;
    }

    console.log(`Comment box found: ${commentBox.selector}`);

    // Type the comment
    const comment = getRandomComment(SUBREDDIT);
    console.log(`Typing comment: "${comment.substring(0, 60)}..."`);

    await typeComment(page, commentBox.locator, comment);
    await page.waitForTimeout(1000);

    // Click Comment button
    const clicked = await clickCommentButton(page);
    if (clicked) {
      commented++;
      console.log(`POSTED! (${commented}/${LIMIT})`);
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `/tmp/reddit-comment-${SUBREDDIT}-${commented}.png` });
    } else {
      console.log('Could not find Comment button. Skipping.');
      skipped++;
      continue;
    }

    // Wait between comments to avoid rate limiting
    if (commented < LIMIT) {
      const waitTime = 30000 + Math.random() * 30000;
      console.log(`Waiting ${Math.round(waitTime / 1000)}s...\n`);
      await page.waitForTimeout(waitTime);
    }
  }

  console.log(`\n=== Session Complete ===`);
  console.log(`Comments posted: ${commented}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Target: r/${SUBREDDIT}`);

  await context.close();
})();
