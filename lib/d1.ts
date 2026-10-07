/**
 * Helper to fetch store data from Cloudflare D1
 * Supports both Cloudflare Workers binding (UPTIMEFLARE_D1) and local dev via Cloudflare REST API
 */
export async function fetchStoreState(): Promise<string | null> {
  const env = process.env as Record<string, any>

  // 1. Cloudflare Workers / Pages runtime binding
  if (env.UPTIMEFLARE_D1) {
    const { getFromStore } = await import('@/worker/src/store')
    return await getFromStore(env as any, 'state')
  }

  // 2. Local development fallback via Cloudflare D1 REST API
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const databaseId = env.CLOUDFLARE_D1_DATABASE_ID
  const apiToken = env.CLOUDFLARE_API_TOKEN

  if (accountId && databaseId && apiToken) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: 'SELECT value FROM uptimeflare WHERE key = ?',
            params: ['state'],
          }),
        }
      )

      const json = (await res.json()) as any
      if (json.success && json.result?.[0]?.results?.[0]?.value) {
        return json.result[0].results[0].value as string
      }
    } catch (err) {
      console.error('[D1 Client] Failed to query Cloudflare D1 via API:', err)
    }
  }

  return null
}
