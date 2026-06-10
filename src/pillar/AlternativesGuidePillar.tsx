// Pillar Page: Self-Hosted SaaS Alternatives Guide 2026
// Hub page linking to all 46 alternative pages, categorized.

import { ALTERNATIVE_PAGES } from '../alternatives/seo/alternatives-data'
import { GlobalNav } from '../components/GlobalNav'
import { RelatedTools } from '../components/RelatedTools'

interface CategoryGroup {
  title: string
  icon: string
  slugs: string[]
}

const CATEGORIES: CategoryGroup[] = [
  { title: 'Cloud Storage & Sync', icon: '📁', slugs: ['google-drive', 'dropbox', 'onedrive', 'syncthing'] },
  { title: 'Note-Taking & Knowledge', icon: '📝', slugs: ['notion', 'evernote', 'logseq', 'obsidian', 'confluence', 'docmost'] },
  { title: 'Communication & Chat', icon: '💬', slugs: ['slack', 'discord', 'zoom'] },
  { title: 'Password Management', icon: '🔑', slugs: ['lastpass', '1password', 'bitwarden-cloud', 'vaultwarden'] },
  { title: 'Project Management', icon: '📋', slugs: ['jira', 'trello', 'todoist'] },
  { title: 'Media & Streaming', icon: '🎵', slugs: ['spotify', 'netflix', 'navidrome'] },
  { title: 'Photo Management', icon: '📷', slugs: ['google-photos', 'immich'] },
  { title: 'Code & DevOps', icon: '🐙', slugs: ['github', 'circleci'] },
  { title: 'Email & Marketing', icon: '📧', slugs: ['gmail', 'mailchimp'] },
  { title: 'Database & Analytics', icon: '🗃️', slugs: ['airtable', 'google-analytics'] },
  { title: 'CRM & Support', icon: '💼', slugs: ['salesforce', 'zendesk'] },
  { title: 'Monitoring', icon: '📈', slugs: ['datadog', 'uptime-kuma'] },
  { title: 'CMS & Design', icon: '🌐', slugs: ['wordpress-com', 'figma', 'scribus'] },
  { title: 'Automation', icon: '⚡', slugs: ['zapier'] },
  { title: 'Identity & Access', icon: '🔐', slugs: ['auth0'] },
  { title: 'Search & SEO', icon: '🔍', slugs: ['algolia', 'semrush'] },
  { title: 'Forms & Surveys', icon: '📋', slugs: ['typeform'] },
  { title: 'Screen Recording', icon: '🎥', slugs: ['loom'] },
  { title: 'Code Sharing', icon: '📋', slugs: ['pastebin'] },
  { title: 'URL Shortener', icon: '🔗', slugs: ['bitly'] },
]

export default function AlternativesGuidePillar() {
  const slugsWithPages = new Set(ALTERNATIVE_PAGES.map(p => p.slug))
  const categorized = CATEGORIES.map(cat => ({
    ...cat,
    pages: cat.slugs
      .filter(s => slugsWithPages.has(s))
      .map(s => ALTERNATIVE_PAGES.find(p => p.slug === s)!)
      .filter(Boolean),
  })).filter(c => c.pages.length > 0)

  const totalAlternatives = ALTERNATIVE_PAGES.reduce((sum, p) => sum + p.alternatives.length, 0)
  const dockerReady = ALTERNATIVE_PAGES.reduce(
    (sum, p) => sum + p.alternatives.filter(a => a.docker).length, 0
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <GlobalNav current="/alternatives/" />

      {/* Hero */}
      <section className="bg-white border-b border-[#e8e8ed]">
        <div className="px-6 lg:px-12 pt-14 pb-10">
          <nav className="text-sm text-[#86868b] mb-3">
            <a href="/" className="hover:text-[#0071e3]">Home</a>
            <span className="mx-2">/</span>
            <a href="/alternatives/" className="hover:text-[#0071e3]">Alternatives</a>
            <span className="mx-2">/</span>
            <span className="text-[#1d1d1f]">Complete Guide</span>
          </nav>
          <h1 className="text-3xl lg:text-5xl font-semibold tracking-tight">
            Self-Hosted SaaS Alternatives Guide 2026
          </h1>
          <p className="text-lg text-[#86868b] mt-3 max-w-3xl">
            {ALTERNATIVE_PAGES.length} SaaS tools with {totalAlternatives} open-source alternatives.
            Docker-ready, self-hosted, free forever.
          </p>
        </div>
      </section>

      <div className="px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto">

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
            <div className="text-sm text-[#86868b] mb-1">SaaS Tools Covered</div>
            <div className="text-3xl font-semibold">{ALTERNATIVE_PAGES.length}</div>
            <div className="text-[#86868b] text-sm mt-1">with open-source alternatives</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
            <div className="text-sm text-[#86868b] mb-1">Total Alternatives</div>
            <div className="text-3xl font-semibold">{totalAlternatives}</div>
            <div className="text-[#86868b] text-sm mt-1">self-hosted options listed</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
            <div className="text-sm text-[#86868b] mb-1">Docker-Ready</div>
            <div className="text-3xl font-semibold">{dockerReady}</div>
            <div className="text-[#10a37f] text-sm mt-1">one-command deploy</div>
          </div>
        </div>

        {/* Category sections */}
        {categorized.map(cat => (
          <section key={cat.title} className="bg-white rounded-2xl border border-[#e8e8ed] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8e8ed]">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                {cat.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {cat.pages.map(page => (
                <a
                  key={page.slug}
                  href={`/alternatives/${page.slug}/`}
                  className="flex items-center gap-3 p-5 border-b border-r border-[#e8e8ed] hover:bg-[#f5f5f7]/50 transition-colors group"
                >
                  <span className="text-2xl shrink-0">{page.icon}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors truncate">
                      {page.saasName}
                    </div>
                    <div className="text-xs text-[#86868b]">
                      {page.alternatives.length} alternative{page.alternatives.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className="ml-auto text-[#86868b] group-hover:text-[#0071e3] shrink-0">→</span>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Quick deploy */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Deploy with Docker</h2>
          <p className="text-[#86868b] mb-4">
            Every alternative page includes a Docker one-liner for instant deployment.
            Browse by category or use our deployment guide for full setup instructions.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/deploy/"
              className="px-4 py-2 bg-[#0071e3] text-white rounded-lg text-sm font-medium hover:bg-[#0077ED] transition-colors"
            >
              Docker Deploy Guide
            </a>
            <a
              href="/alternatives/"
              className="px-4 py-2 border border-[#e8e8ed] text-[#1d1d1f] rounded-lg text-sm font-medium hover:border-[#0071e3]/30 transition-colors"
            >
              Browse All Alternatives
            </a>
            <a
              href="/finder/productivity/"
              className="px-4 py-2 border border-[#e8e8ed] text-[#1d1d1f] rounded-lg text-sm font-medium hover:border-[#0071e3]/30 transition-colors"
            >
              Find Your Tool
            </a>
          </div>
        </section>

        {/* Why self-host */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Why Self-Host?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '💰', title: 'Zero recurring costs', desc: 'No monthly subscriptions. Run on your own hardware or a $5/month VPS.' },
              { icon: '🔒', title: 'Data privacy', desc: 'Your data stays on your servers. No third-party access, no data harvesting.' },
              { icon: '⚙️', title: 'Full control', desc: 'Customize, extend, and integrate however you want. Open source means no vendor lock-in.' },
              { icon: '♾️', title: 'No usage limits', desc: 'No API rate limits, no storage caps, no user seat restrictions. Scale freely.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-[#86868b]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: 'What does self-hosted mean?', a: 'Self-hosted means running software on your own server instead of using a cloud SaaS provider. You control the data, configuration, and updates. Most tools listed here can be deployed with a single Docker command.' },
              { q: 'Is self-hosting difficult?', a: 'With Docker, most tools deploy with a single command. Our deployment guides provide copy-paste Docker Compose configs. You need a basic VPS ($5/month from Hetzner or DigitalOcean) and about 10 minutes per tool.' },
              { q: 'Are these alternatives really free?', a: 'Yes. All alternatives listed are open-source with no licensing fees. You only pay for the server (typically $5-20/month for a VPS that can run multiple tools).' },
              { q: 'What about updates and security?', a: 'Most tools have active communities releasing regular updates. Docker makes updating easy (pull the latest image and restart). Our uptime monitoring guide helps you stay on top of service health.' },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-[#1d1d1f]">{faq.q}</h3>
                <p className="text-[#86868b] mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/alternatives/" />
      </div>
    </div>
  )
}
