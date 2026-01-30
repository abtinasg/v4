import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, ilike, and, ne } from 'drizzle-orm';

// GET /api/cloud/users/search?q=email - Search users by email
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by email (excluding current user)
    const foundUsers = await db.query.users.findMany({
      where: and(
        ilike(users.email, `%${query}%`),
        ne(users.id, currentUser.id)
      ),
      columns: {
        id: true,
        email: true,
      },
      limit: 10,
    });

    return NextResponse.json({ users: foundUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
