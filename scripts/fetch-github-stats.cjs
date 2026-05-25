#!/usr/bin/env node
// Fetch GitHub stars + last activity for every alternative repo.
// Run: node scripts/fetch-github-stats.cjs
//
// Reads:  src/alternatives/seo/alternatives-data.ts (extracts github URLs)
// Writes: scripts/github-stats.json
//
// Auth:   reads GITHUB_TOKEN from process.env or .env.local (5000/hr).
//         No token = 60/hr anonymous (will likely rate-limit on >60 repos).
//
// Skipped silently when no token AND repo count > 50.
// Build pipeline calls this with `|| true` so failures don't block deploys.

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DATA_FILE = path.join(ROOT, 'src/alternatives/seo/alternatives-data.ts')
const OUT_FILE = path.join(ROOT, 'src/alternatives/seo/github-stats.json')
const ENV_FILE = path.join(ROOT, '.env.local')

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return
  const lines = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

function extractRepos(source) {
  const re = /github:\s*['"]https:\/\/github\.com\/([^/'"\s]+)\/([^/'"\s]+?)['"]/g
  const set = new Map()
  let m
  while ((m = re.exec(source)) !== null) {
    const owner = m[1]
    const repo = m[2].replace(/\.git$/, '')
    const key = `${owner}/${repo}`
    if (!set.has(key)) set.set(key, { owner, repo })
  }
  return [...set.values()]
}

function inferStatus(pushedAt) {
  if (!pushedAt) return 'declining'
  const days = (Date.now() - new Date(pushedAt).getTime()) / 86400000
  if (days < 90) return 'active'
  if (days < 365) return 'maintenance'
  if (days < 730) return 'declining'
  return 'archived'
}

async function fetchRepo(owner, repo, headers) {
  const url = `https://api.github.com/repos/${owner}/${repo}`
  const res = await fetch(url, { headers })
  if (res.status === 404) return { error: 'not_found' }
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining')
    if (remaining === '0') return { error: 'rate_limited' }
    return { error: 'forbidden' }
  }
  if (!res.ok) return { error: `http_${res.status}` }
  const data = await res.json()
  if (data.archived) {
    return {
      githubStars: data.stargazers_count ?? 0,
      lastCommitDate: data.pushed_at?.slice(0, 10) ?? null,
      maintenanceStatus: 'archived',
    }
  }
  return {
    githubStars: data.stargazers_count ?? 0,
    lastCommitDate: data.pushed_at?.slice(0, 10) ?? null,
    maintenanceStatus: inferStatus(data.pushed_at),
  }
}

async function main() {
  loadEnvFile()
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'prompt-cost-calculator-fetch',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const source = fs.readFileSync(DATA_FILE, 'utf8')
  const repos = extractRepos(source)
  console.log(`Found ${repos.length} unique GitHub repos`)

  if (!token && repos.length > 50) {
    console.warn('No GITHUB_TOKEN set and >50 repos. Anonymous limit is 60/hr.')
    console.warn('Set GITHUB_TOKEN in .env.local to fetch reliably. Skipping.')
    process.exit(0)
  }

  const stats = {}
  const errors = {}
  let completed = 0

  for (const { owner, repo } of repos) {
    const key = `https://github.com/${owner}/${repo}`
    try {
      const result = await fetchRepo(owner, repo, headers)
      if (result.error) {
        errors[key] = result.error
        if (result.error === 'rate_limited') {
          console.warn(`Rate limited at ${completed}/${repos.length}. Stopping.`)
          break
        }
      } else {
        stats[key] = result
      }
    } catch (e) {
      errors[key] = e.message
    }
    completed++
    if (completed % 10 === 0) console.log(`  ${completed}/${repos.length}`)
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    repoCount: repos.length,
    successCount: Object.keys(stats).length,
    errorCount: Object.keys(errors).length,
    stats,
    errors,
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2))
  console.log(`Wrote ${OUT_FILE}: ${output.successCount} ok, ${output.errorCount} errors`)
  if (output.successCount === 0 && output.errorCount > 0) process.exit(1)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
