import { COMPARE_PAGES } from './seo/compare-data'

export default function CompareHub() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Self-Hosted Tool Comparisons</h1>
          <p className="text-gray-600 mt-3 text-lg leading-relaxed">
            Side-by-side comparisons of popular SaaS tools vs self-hosted alternatives.
            Find the right tool with real feature data, pricing, and Docker deployment guides.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COMPARE_PAGES.map(page => (
            <a
              key={page.slug}
              href={`/compare/${page.slug}/`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-[border-color,box-shadow] group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{page.productA.logo}</span>
                <span className="text-gray-400 font-medium">vs</span>
                <span className="text-2xl">{page.productB.logo}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {page.productA.name} vs {page.productB.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{page.summary}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                {page.productA.selfHosted && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{page.productA.name} is self-hosted</span>}
                {page.productB.selfHosted && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{page.productB.name} is self-hosted</span>}
              </div>
            </a>
          ))}
        </div>

        <div className="text-center py-8">
          <a href="/alternatives/" className="text-blue-600 hover:underline">Browse all self-hosted alternatives &rarr;</a>
          <span className="mx-4 text-gray-300" aria-hidden="true">|</span>
          <a href="/" className="text-blue-600 hover:underline">AI Cost Calculator</a>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Side-by-side comparisons of self-hosted and SaaS tools.</p>
        </div>
      </footer>
    </div>
  )
}
