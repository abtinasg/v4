import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { clerkClient } from '@clerk/nextjs/server';

// Use same secret as mobile-token endpoint
const MOBILE_SECRET = process.env.MOBILE_JWT_SECRET || 'deepin-mobile-jwt-secret-2024-secure-key';
const JWT_SECRET = new TextEncoder().encode(MOBILE_SECRET);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
