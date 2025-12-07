/**
 * Abtin Authentication Verification Endpoint
 * 
 * POST /api/abtin/auth
 * Simple endpoint to verify credentials without making AI calls
 */

import { NextRequest } from 'next/server'
import { parseBasicAuth, verifyAbtinCredentials, createAuthChallenge } from '@/lib/auth/abtin-auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const credentials = parseBasicAuth(authHeader)
    
    if (!credentials) {
      return createAuthChallenge()
    }
    
    const authResult = verifyAbtinCredentials(credentials.username, credentials.password)
    
    if (!authResult.authenticated) {
      return createAuthChallenge('Invalid credentials')
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Authentication successful' }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Abtin Auth API error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
