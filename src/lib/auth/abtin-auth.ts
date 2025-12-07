/**
 * Basic Authentication for Abtin Psychologist AI Section
 * Uses environment variables for credentials
 */

export interface AbtinAuthResult {
  authenticated: boolean
  error?: string
}

/**
 * Verify Abtin section credentials
 */
export function verifyAbtinCredentials(username: string, password: string): AbtinAuthResult {
  const expectedUsername = process.env.ABTIN_USERNAME
  const expectedPassword = process.env.ABTIN_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    console.error('[Abtin Auth] ABTIN_USERNAME and ABTIN_PASSWORD must be set in environment variables')
    return { authenticated: false, error: 'Authentication not configured' }
  }

  if (username === expectedUsername && password === expectedPassword) {
    return { authenticated: true }
  }

  return { authenticated: false, error: 'Invalid credentials' }
}

/**
 * Parse Basic Auth header
 */
export function parseBasicAuth(authHeader: string | null): { username: string; password: string } | null {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null
  }

  try {
    const base64Credentials = authHeader.slice(6)
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')
    
    if (!username || !password) {
      return null
    }

    return { username, password }
  } catch {
    return null
  }
}

/**
 * Create Basic Auth challenge response
 */
export function createAuthChallenge(message = 'Authentication required') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Abtin Psychologist AI"',
      'Content-Type': 'application/json',
    },
  })
}
