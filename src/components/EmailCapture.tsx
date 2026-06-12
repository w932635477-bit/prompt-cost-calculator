// EmailCapture disabled — Buttondown account rejected 2026-05-30.
// Re-enable when a new email provider is configured.
// See: api/subscribe.ts.disabled

interface Props {
  source: string
}

export function EmailCapture({ source }: Props) {
  void source
  return null
}
