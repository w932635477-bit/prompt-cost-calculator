import { createRoot } from 'react-dom/client'
import '../index.css'
import { GuidePage } from './GuidePage'
import { EmailCapture } from '../components/EmailCapture'

const page = window.location.pathname

const GUIDE_DATA: Record<string, {
  title: string
  subtitle: string
  canonicalUrl: string
  sections: { heading: string; body: React.ReactNode }[]
}> = {
  '/ai-code-review/how-to-review-ai-generated-code/': {
    title: 'How to Review AI-Generated Code',
    subtitle: 'A 7-step process for catching what AI gets wrong, before it reaches production.',
    canonicalUrl: 'https://aicalc.cloud/ai-code-review/how-to-review-ai-generated-code/',
    sections: [
      {
        heading: '1. Verify the diff matches the request',
        body: (
          <>
            <p>AI tools often solve an adjacent problem instead of the exact one. Before looking at
            code quality, confirm the diff addresses the stated requirement and nothing else.</p>
            <p className="mt-2">Watch for: unrelated refactors, style changes in untouched files, and
            "while I was here" modifications that AI sneaks in without being asked.</p>
          </>
        ),
      },
      {
        heading: '2. Run the code before reading it',
        body: (
          <>
            <p>AI code that looks correct can fail at runtime. Run tests first. If the existing
            tests pass, run the feature manually. If it works, then read the code.</p>
            <p className="mt-2">This order matters. Reading code that already passes tests is faster
            because you can skip verifying basic correctness and focus on edge cases and security.</p>
          </>
        ),
      },
      {
        heading: '3. Check for hallucinated APIs and imports',
        body: (
          <>
            <p>AI frequently calls methods that don't exist on the imported library, uses wrong
            parameter names, or imports packages that do something different than assumed.</p>
            <p className="mt-2">Red flags: importing a package you've never seen in the project
            before, method calls with unusually generic names, and any API usage you can't verify
            in 30 seconds of checking the docs.</p>
          </>
        ),
      },
      {
        heading: '4. Audit security: auth, injection, secrets',
        body: (
          <>
            <p>AI skips auth checks in new endpoints more often than humans. It also concatenates
            strings into SQL queries and shell commands instead of using parameterized alternatives.</p>
            <p className="mt-2">Check specifically: new API routes missing middleware, string
            interpolation in queries/commands, and hardcoded values that look like example credentials
            from training data.</p>
          </>
        ),
      },
      {
        heading: '5. Trace the error handling paths',
        body: (
          <>
            <p>AI wraps code in try/catch but leaves the catch block empty or logs a generic message.
            For each error path, ask: "What does the user see? What gets logged? Does the system
            recover or degrade gracefully?"</p>
            <p className="mt-2">Empty catch blocks are the most common AI code smell. The second most
            common: catching a specific exception type but handling it the same way as every other
            error.</p>
          </>
        ),
      },
      {
        heading: '6. Review tests for real coverage',
        body: (
          <>
            <p>AI writes tests that pass but don't test the right thing. Common patterns: testing
            that a function was called (mock assertion) instead of testing what it produced (output
            assertion), and testing only the happy path.</p>
            <p className="mt-2">For each test, ask: "If I introduce a bug, does this test fail?" If
            the answer is no, the test isn't providing real coverage.</p>
          </>
        ),
      },
      {
        heading: '7. Check for unnecessary additions',
        body: (
          <>
            <p>AI adds dependencies for problems solvable in a few lines, creates abstractions for
            single-use code, and leaves behind commented-out alternative implementations from its
            exploration process.</p>
            <p className="mt-2">The final check: could you remove any import, function, or file in
            this diff without breaking anything? If yes, it's dead code AI left behind.</p>
          </>
        ),
      },
    ],
  },
  '/ai-code-review/ai-pr-review-checklist/': {
    title: 'AI PR Review Checklist',
    subtitle: '25-item interactive checklist for reviewing AI-generated pull requests. Check items, get a score, copy the report.',
    canonicalUrl: 'https://aicalc.cloud/ai-code-review/ai-pr-review-checklist/',
    sections: [
      {
        heading: 'When to use this checklist',
        body: (
          <>
            <p>Use this checklist when reviewing a pull request where AI wrote more than 30% of the
            diff. This includes PRs from Copilot, Cursor, Claude Code, Windsurf, and similar tools.</p>
            <p className="mt-2">Small AI suggestions (a rename, a one-line fix) don't need the full
            checklist. Run through the critical items (security, correctness) and skip the rest.</p>
          </>
        ),
      },
      {
        heading: 'How the scoring works',
        body: (
          <>
            <p>Items are categorized by severity:</p>
            <ul className="mt-2 space-y-1 text-sm text-[#424245]">
              <li><strong className="text-[#ff3b30]">Critical (Must pass):</strong> Security, correctness, and error handling issues that cause production failures or data leaks.</li>
              <li><strong className="text-[#ff9f0a]">Warning (Should pass):</strong> Performance, testing, and dependency issues that accumulate technical debt.</li>
              <li><strong className="text-[#0071E3]">Info (Nice to have):</strong> Style, naming, and dead code issues that affect maintainability.</li>
            </ul>
            <p className="mt-2">A passing review requires all critical items checked. The "Copy Report"
            button generates a markdown summary you can paste directly into the PR comment.</p>
          </>
        ),
      },
      {
        heading: 'Copy the report into your PR',
        body: (
          <>
            <p>After checking items, click "Copy Report" to get a formatted checklist summary. Paste
            it into the PR comment to document what you verified. This creates an audit trail showing
            the review was thorough and structured.</p>
            <p className="mt-2">Teams using this checklist report catching 40-60% more AI-specific
            issues compared to ad-hoc code review, based on internal surveys from teams using Copilot
            and Claude for code generation.</p>
          </>
        ),
      },
    ],
  },
}

const guide = GUIDE_DATA[page]

if (!guide) {
  createRoot(document.getElementById('root')!).render(
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <a href="/ai-code-review/" className="text-[#0071E3] hover:underline">Go to AI Code Review Checklist</a>
      </div>
    </div>,
  )
} else {
  createRoot(document.getElementById('root')!).render(
    <>
      <GuidePage guide={guide} />
      <EmailCapture source="ai-code-review-guide" />
    </>,
  )
}
