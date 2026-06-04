import { useState, useCallback } from 'react'
import type { DeployPage as DeployPageData } from './seo/deploy-data'
import { GlobalNav } from '../components/GlobalNav'

function getSeoData(): DeployPageData | null {
  const el = document.getElementById('seo-data')
  if (!el) return null
  try { return JSON.parse(el.textContent || '{}') } catch { return null }
}

function CopyBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [content])

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-900 rounded-t-lg px-4 py-2 border-b border-gray-700">
        <span className="text-sm text-gray-400 font-mono">{label}</span>
        <button
          onClick={copy}
          className="text-xs text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:text-white"
          aria-label={copied ? 'Copied' : 'Copy'}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bg-gray-900 rounded-b-lg p-4 overflow-x-auto text-sm text-gray-100 font-mono leading-relaxed">
        <code>{content}</code>
      </pre>
    </div>
  )
}

export default function DeployPage() {
  const data = getSeoData()
  if (!data) return <div className="p-8 text-center text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNav current="/deploy/" />
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <nav className="text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
            <a href="/" className="hover:text-blue-600">Home</a>
            <span className="mx-2" aria-hidden="true">/</span>
            <a href="/alternatives/" className="hover:text-blue-600">Alternatives</a>
            <span className="mx-2" aria-hidden="true">/</span>
            <a href={`/alternatives/${data.slug}/`} className="hover:text-blue-600">{data.saasName}</a>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-gray-700">Deploy</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">{data.h1}</h1>
          <p className="mt-2 text-lg text-gray-600">{data.description}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="mb-10">
          <p className="text-gray-600 mb-6">
            Production-ready Docker Compose configs for self-hosted {data.saasName} alternatives.
            Copy, customize environment variables, and deploy with one command.
          </p>
        </section>

        {data.deploys.map((deploy) => (
          <section key={deploy.name} className="mb-12 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{deploy.name}</h2>
                <div className="flex items-center gap-3 text-sm text-blue-100">
                  <span>Port {deploy.port.split(':')[0]}</span>
                  <span className="text-blue-300">|</span>
                  <span>Min {deploy.minRam} RAM</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <CopyBlock label="docker-compose.yml" content={deploy.dockerCompose} />

              {deploy.envFile && (
                <CopyBlock label=".env" content={deploy.envFile} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Deploy</div>
                  <code className="text-sm text-gray-800 font-mono">{deploy.deployCommand}</code>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Access</div>
                  <code className="text-sm text-gray-800 font-mono">{deploy.accessUrl}</code>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Image</div>
                  <code className="text-sm text-gray-800 font-mono break-all">{deploy.image}</code>
                </div>
              </div>

              {deploy.volumes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Volume Mounts</h3>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    {deploy.volumes.map((v, j) => (
                      <div key={j} className="flex items-center text-sm font-mono text-gray-600">
                        <span className="text-gray-900">{v.host}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-600">{v.container}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Tool</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Port</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Min RAM</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Docker Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.deploys.map((d) => (
                  <tr key={d.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{d.port}</td>
                    <td className="px-4 py-3 text-gray-600">{d.minRam}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.image}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {data.faq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900">
                  <h3>{item.q}</h3>
                </summary>
                <div className="px-6 pb-4 text-gray-600">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-gray-700 mb-3">
            Compare all self-hosted {data.saasName} alternatives with features, difficulty ratings, and more.
          </p>
          <a
            href={`/alternatives/${data.slug}/`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse {data.saasName} Alternatives
          </a>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        <a href="/" className="hover:text-blue-600">Home</a>
        <span className="mx-2">·</span>
        <a href="/alternatives/" className="hover:text-blue-600">Alternatives</a>
        <span className="mx-2">·</span>
        <a href="/cron-generator/" className="hover:text-blue-600">Cron Generator</a>
      </footer>
    </div>
  )
}
