import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, cloudWorkspaces, cloudWorkspaceMembers, cloudActivityLog } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

// GET /api/cloud/workspaces - Get user's workspaces
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get workspaces where user is owner
    const ownedWorkspaces = await db.query.cloudWorkspaces.findMany({
      where: eq(cloudWorkspaces.ownerId, user.id),
      orderBy: [desc(cloudWorkspaces.updatedAt)],
    });

    // Get workspaces where user is member
    const memberships = await db.query.cloudWorkspaceMembers.findMany({
      where: eq(cloudWorkspaceMembers.userId, user.id),
      with: {
        workspace: true,
      },
    });

    const memberWorkspaces = memberships.map(m => ({
      ...m.workspace,
      role: m.role,
    }));

    // Combine and deduplicate
    const allWorkspaces = [
      ...ownedWorkspaces.map(w => ({ ...w, role: 'owner' as const })),
      ...memberWorkspaces.filter(mw => !ownedWorkspaces.some(ow => ow.id === mw.id)),
    ];

    // Get member counts for each workspace
    const workspacesWithCounts = await Promise.all(
      allWorkspaces.map(async (workspace) => {
        const members = await db.query.cloudWorkspaceMembers.findMany({
          where: eq(cloudWorkspaceMembers.workspaceId, workspace.id),
        });
        return {
          ...workspace,
          memberCount: members.length + 1, // +1 for owner
        };
      })
    );

    return NextResponse.json({ workspaces: workspacesWithCounts });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cloud/workspaces - Create new workspace
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, isPublic = false, tags = [] } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const [newWorkspace] = await db.insert(cloudWorkspaces).values({
      name: name.trim(),
      description: description?.trim() || null,
      ownerId: user.id,
      isPublic,
      tags,
    }).returning();

    // Log activity
    await db.insert(cloudActivityLog).values({
      workspaceId: newWorkspace.id,
      userId: user.id,
      action: 'create',
      targetType: 'workspace',
      targetId: newWorkspace.id,
      targetName: newWorkspace.name,
    });

    return NextResponse.json({ workspace: newWorkspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
