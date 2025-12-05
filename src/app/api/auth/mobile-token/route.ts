import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignJWT } from 'jose';

// Use a dedicated secret for mobile JWT tokens
const MOBILE_SECRET = process.env.MOBILE_JWT_SECRET || 'deepin-mobile-jwt-secret-2024-secure-key';
const JWT_SECRET = new TextEncoder().encode(MOBILE_SECRET);

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Create JWT token for mobile
    const token = await new SignJWT({
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Mobile token error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
