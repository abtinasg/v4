/**
 * Abtin Authentication - Logout Endpoint
 * POST /api/abtin/auth/logout
 */

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the session cookie
  response.cookies.delete('abtin_session')
  
  return response
}
