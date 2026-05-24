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

if (!WARMUP_SUBREDDITS.includes(SUBREDDIT)) {
  console.error(`Unknown subreddit: ${SUBREDDIT}`);
  console.log(`Available: ${WARMUP_SUBREDDITS.join(', ')}`);
  process.exit(1);
}

const url = `https://www.reddit.com/r/${SUBREDDIT}/new/.json?limit=${LIMIT * 2}`;

const PROXY = process.env.https_proxy || process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  dispatcher: await import('undici').then(u => new u.ProxyAgent(PROXY)),
});

if (!res.ok) {
  console.error(`Failed to fetch: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const data = await res.json();
const posts = data.data.children
  .map(c => c.data)
  .filter(p => !p.locked && !p.archived && !p.stickied && p.num_comments < 50)
  .slice(0, LIMIT);

if (posts.length === 0) {
  console.log('No suitable posts found.');
  process.exit(0);
}

console.log(`\n=== r/${SUBREDDIT} — ${posts.length} posts to comment ===`);
console.log(`Copy comment text → open URL → paste → click Comment\n`);

posts.forEach((post, i) => {
  const comment = getRandomComment(SUBREDDIT);
  const postUrl = `https://www.reddit.com/r/${SUBREDDIT}/comments/${post.id}/`;

  console.log(`${'═'.repeat(60)}`);
  console.log(`[${i + 1}/${posts.length}] ${post.title}`);
  console.log(`Score: ${post.score} | Comments: ${post.num_comments}`);
  console.log(`URL: ${postUrl}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(comment);
  console.log(`${'─'.repeat(60)}`);
  console.log('');
});

console.log('Tip: Wait 5+ minutes between comments for new accounts.');
