import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.MOBILE_JWT_SECRET || process.env.CLERK_SECRET_KEY
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided', step: 1 });
    }

    // Try to verify
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return NextResponse.json({ 
        success: true, 
        payload,
        step: 2,
        message: 'Token is valid!'
      });
    } catch (verifyError: any) {
      return NextResponse.json({ 
        error: 'Token verification failed', 
        step: 3,
        details: verifyError.message 
      });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Request error', 
      step: 0,
      details: error.message 
    });
  }
}

// Also allow GET for simple health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    hasSecret: !!process.env.CLERK_SECRET_KEY,
    time: new Date().toISOString()
  });
}
