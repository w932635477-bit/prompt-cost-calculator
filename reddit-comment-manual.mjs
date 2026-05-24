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

(async () => {
  if (!WARMUP_SUBREDDITS.includes(SUBREDDIT)) {
    console.error(`Unknown subreddit: ${SUBREDDIT}`);
    console.log(`Available: ${WARMUP_SUBREDDITS.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n=== Reddit Manual Warm: r/${SUBREDDIT} ===`);
  console.log(`Script fills comment text, you click "Comment" button.\n`);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath: CHROME_PATH,
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = context.pages()[0] || await context.newPage();

  // Check login
  await page.goto('https://www.reddit.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const loginBtn = await page.locator('[href="/login/"], a:has-text("Log In")').count();
  if (loginBtn > 0) {
    console.log('NOT LOGGED IN. Log in manually, then restart this script.');
    await context.close();
    process.exit(1);
  }
  console.log('Logged in.');

  // Get posts
  console.log(`Loading r/${SUBREDDIT}/new/...`);
  await page.goto(`https://www.reddit.com/r/${SUBREDDIT}/new/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  for (let s = 0; s < 3; s++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  const posts = await page.evaluate(() => {
    const links = [];
    const seen = new Set();
    document.querySelectorAll('a[href*="/comments/"]').forEach(a => {
      const href = a.getAttribute('href');
      const title = a.textContent?.trim();
      if (href && title && href.includes('/comments/') && !seen.has(href)) {
        seen.add(href);
        links.push({ href: href.startsWith('http') ? href : 'https://www.reddit.com' + href, title: title.substring(0, 80) });
      }
    });
    return links.slice(0, 10);
  });

  if (posts.length === 0) {
    console.log('No posts found.');
    await context.close();
    process.exit(0);
  }

  console.log(`Found ${posts.length} posts.\n`);

  let commented = 0;

  for (let i = 0; i < posts.length && commented < LIMIT; i++) {
    const post = posts[i];
    console.log(`\n[${commented + 1}/${LIMIT}] ${post.title}`);
    console.log(`  ${post.href}`);

    // Open post in new tab so user can keep it open
    const newPage = await context.newPage();
    await newPage.goto(post.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await newPage.waitForTimeout(3000);

    // Scroll to comment area
    await newPage.evaluate(() => window.scrollBy(0, 400));
    await newPage.waitForTimeout(1500);

    // Click "Add a comment" trigger if present
    const triggers = ['button:has-text("Add a comment")', 'a:has-text("Add a comment")'];
    for (const sel of triggers) {
      const loc = newPage.locator(sel).first();
      if (await loc.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loc.click();
        await newPage.waitForTimeout(1500);
        break;
      }
    }

    // Find and fill comment box
    const comment = getRandomComment(SUBREDDIT);
    const editor = newPage.locator('div[contenteditable="true"][role="textbox"], div[contenteditable="true"], textarea').first();
    const editorExists = await editor.count();

    if (editorExists > 0) {
      await editor.scrollIntoViewIfNeeded().catch(() => {});
      await editor.click({ force: true });
      await newPage.waitForTimeout(300);
      await newPage.keyboard.press('Meta+a');
      await newPage.waitForTimeout(200);
      await newPage.keyboard.type(comment, { delay: 20 });
      console.log(`  Comment filled: "${comment.substring(0, 50)}..."`);
      console.log(`  >>> Click "Comment" button in Chrome <<<`);
    } else {
      console.log(`  Could not find comment box. Comment manually.`);
      console.log(`  Text: ${comment}`);
    }

    // Wait for user to click Comment button and be ready
    console.log(`  Press Enter here when done (or type "s" to skip)...`);
    const rl = await import('readline');
    const answer = await new Promise(resolve => {
      const r = rl.createInterface({ input: process.stdin, output: process.stdout });
      r.question('', ans => { r.close(); resolve(ans.trim()); });
    });

    if (answer === 's') {
      console.log('  Skipped.');
      await newPage.close();
      continue;
    }

    commented++;
    console.log(`  Done! (${commented}/${LIMIT})`);

    // Close the tab to keep things clean
    await newPage.waitForTimeout(2000);
    await newPage.close();
  }

  console.log(`\n=== Complete: ${commented} comments ===`);

  // Keep browser open so user can still use it
  console.log('Browser stays open. Close it manually when done.');
  await new Promise(() => {}); // hang forever, user closes browser
})();
