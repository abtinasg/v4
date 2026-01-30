import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, cloudWorkspaces, cloudWorkspaceMembers, cloudActivityLog } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/cloud/workspaces/[id]/members - Get workspace members
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const workspaceId = params.id;

    // Verify access
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get members
    const members = await db.query.cloudWorkspaceMembers.findMany({
      where: eq(cloudWorkspaceMembers.workspaceId, workspaceId),
      with: {
        user: true,
        inviter: true,
      },
    });

    // Get owner
    const owner = await db.query.users.findFirst({
      where: eq(users.id, workspace.ownerId),
    });

    const allMembers = [
      {
        id: 'owner',
        userId: workspace.ownerId,
        email: owner?.email,
        role: 'owner' as const,
        joinedAt: workspace.createdAt,
      },
      ...members.map(m => ({
        id: m.id,
        userId: m.userId,
        email: m.user.email,
        role: m.role,
        invitedBy: m.inviter?.email,
        invitedAt: m.invitedAt,
        joinedAt: m.joinedAt,
      })),
    ];

    return NextResponse.json({ members: allMembers });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cloud/workspaces/[id]/members - Invite member
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const workspaceId = params.id;
    const body = await request.json();
    const { email, role = 'viewer' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get workspace and check permission
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if user can invite (owner or admin)
    const isOwner = workspace.ownerId === currentUser.id;
    let canInvite = isOwner;

    if (!isOwner) {
      const membership = await db.query.cloudWorkspaceMembers.findFirst({
        where: and(
          eq(cloudWorkspaceMembers.workspaceId, workspaceId),
          eq(cloudWorkspaceMembers.userId, currentUser.id)
        ),
      });
      canInvite = membership?.role === 'admin';
    }

    if (!canInvite) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Find user by email
    const invitedUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!invitedUser) {
      return NextResponse.json({ error: 'User not found. They must sign up first.' }, { status: 404 });
    }

    // Check if already member
    const existingMember = await db.query.cloudWorkspaceMembers.findFirst({
      where: and(
        eq(cloudWorkspaceMembers.workspaceId, workspaceId),
        eq(cloudWorkspaceMembers.userId, invitedUser.id)
      ),
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    // Check if user is owner
    if (invitedUser.id === workspace.ownerId) {
      return NextResponse.json({ error: 'Cannot invite workspace owner' }, { status: 400 });
    }

    // Add member
    const [newMember] = await db.insert(cloudWorkspaceMembers).values({
      workspaceId,
      userId: invitedUser.id,
      role: role as 'admin' | 'editor' | 'viewer',
      invitedBy: currentUser.id,
      joinedAt: new Date(), // Auto-accept for now
    }).returning();

    // Log activity
    await db.insert(cloudActivityLog).values({
      workspaceId,
      userId: currentUser.id,
      action: 'invite',
      targetType: 'member',
      targetId: invitedUser.id,
      targetName: invitedUser.email,
      metadata: { role },
    });

    return NextResponse.json({
      member: {
        id: newMember.id,
        userId: invitedUser.id,
        email: invitedUser.email,
        role: newMember.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cloud/workspaces/[id]/members?userId=xxx - Remove member
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const workspaceId = params.id;
    const { searchParams } = new URL(request.url);
    const memberUserId = searchParams.get('userId');

    if (!memberUserId) {
      return NextResponse.json({ error: 'Member userId is required' }, { status: 400 });
    }

    // Get workspace
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check permission (owner, admin, or self-removal)
    const isOwner = workspace.ownerId === currentUser.id;
    const isSelfRemoval = memberUserId === currentUser.id;
    let canRemove = isOwner || isSelfRemoval;

    if (!isOwner && !isSelfRemoval) {
      const membership = await db.query.cloudWorkspaceMembers.findFirst({
        where: and(
          eq(cloudWorkspaceMembers.workspaceId, workspaceId),
          eq(cloudWorkspaceMembers.userId, currentUser.id)
        ),
      });
      canRemove = membership?.role === 'admin';
    }

    if (!canRemove) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Remove member
    await db.delete(cloudWorkspaceMembers).where(
      and(
        eq(cloudWorkspaceMembers.workspaceId, workspaceId),
        eq(cloudWorkspaceMembers.userId, memberUserId)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
