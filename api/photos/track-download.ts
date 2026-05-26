// api/photos/track-download.ts
// Unsplash compliance: trigger download endpoint when user clicks Download.
// This is REQUIRED by Unsplash API guidelines — production tier review will
// reject apps that skip this. The endpoint just records the "actual use" event;
// it does not return image data.
//
// Docs: https://unsplash.com/documentation#triggering-a-download

interface VercelRequest {
  query: { [k: string]: string | string[] | undefined }
  method?: string
}
interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: unknown) => void
  end: () => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const id = (req.query.id || '').toString().trim()
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid photo id' })
  }

  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) {
    // Silently no-op when not configured (don't block user download)
    return res.status(204).end()
  }

  try {
    const url = `https://api.unsplash.com/photos/${id}/download`
    const r = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } })
    if (!r.ok) {
      return res.status(204).end()  // tracking failure must not block user
    }
    return res.status(204).end()
  } catch {
    return res.status(204).end()
  }
}
