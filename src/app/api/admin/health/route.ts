import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { count } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime?: number
  message?: string
  lastChecked: string
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const checks: HealthCheck[] = []
    const startTime = Date.now()

    // Check Database
    const dbStart = Date.now()
    try {
      await db.select({ count: count() }).from(users)
      checks.push({
        name: 'Database (PostgreSQL)',
        status: 'healthy',
        responseTime: Date.now() - dbStart,
        message: 'Connected successfully',
        lastChecked: new Date().toISOString()
      })
    } catch (error) {
      checks.push({
        name: 'Database (PostgreSQL)',
        status: 'down',
        responseTime: Date.now() - dbStart,
        message: error instanceof Error ? error.message : 'Connection failed',
        lastChecked: new Date().toISOString()
      })
    }

    // Check Clerk Auth
    const clerkStart = Date.now()
    try {
      const clerkResponse = await fetch('https://api.clerk.com/v1/health', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      checks.push({
        name: 'Clerk Authentication',
        status: clerkResponse.ok ? 'healthy' : 'degraded',
        responseTime: Date.now() - clerkStart,
        message: clerkResponse.ok ? 'Service available' : 'Service issues detected',
        lastChecked: new Date().toISOString()
      })
    } catch (error) {
      checks.push({
        name: 'Clerk Authentication',
        status: 'degraded',
        responseTime: Date.now() - clerkStart,
        message: 'Could not verify status',
        lastChecked: new Date().toISOString()
      })
    }

    // Check External APIs (simulate)
    const apiEndpoints = [
      { name: 'Financial Data API', url: 'https://query1.finance.yahoo.com/v1/test' },
      { name: 'News API', url: 'https://newsapi.org/' },
    ]

    for (const endpoint of apiEndpoints) {
      const apiStart = Date.now()
      try {
        const response = await fetch(endpoint.url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        })
        checks.push({
          name: endpoint.name,
          status: response.ok || response.status === 404 || response.status === 401 ? 'healthy' : 'degraded',
          responseTime: Date.now() - apiStart,
          message: 'Endpoint reachable',
          lastChecked: new Date().toISOString()
        })
      } catch (error) {
        checks.push({
          name: endpoint.name,
          status: 'degraded',
          responseTime: Date.now() - apiStart,
          message: 'Could not reach endpoint',
          lastChecked: new Date().toISOString()
        })
      }
    }

    // System info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
    }

    // Environment variables check
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD',
      'ADMIN_JWT_SECRET',
    ]

    const envStatus = requiredEnvVars.map(envVar => ({
      name: envVar,
      configured: !!process.env[envVar],
    }))

    // Calculate overall status
    const healthyCount = checks.filter(c => c.status === 'healthy').length
    const degradedCount = checks.filter(c => c.status === 'degraded').length
    const downCount = checks.filter(c => c.status === 'down').length

    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (downCount > 0) overallStatus = 'down'
    else if (degradedCount > 0) overallStatus = 'degraded'

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      totalTime: Date.now() - startTime,
      checks,
      summary: {
        healthy: healthyCount,
        degraded: degradedCount,
        down: downCount,
        total: checks.length
      },
      system: systemInfo,
      environment: envStatus
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ 
      status: 'down',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
