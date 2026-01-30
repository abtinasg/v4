import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, cloudWorkspaces, cloudWorkspaceMembers, cloudFiles, cloudFolders, cloudActivityLog } from '@/lib/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

// GET /api/cloud/workspaces/[id] - Get workspace details
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

    // Get workspace
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check access
    const isOwner = workspace.ownerId === user.id;
    let role: 'owner' | 'admin' | 'editor' | 'viewer' | null = isOwner ? 'owner' : null;

    if (!isOwner) {
      const membership = await db.query.cloudWorkspaceMembers.findFirst({
        where: and(
          eq(cloudWorkspaceMembers.workspaceId, workspaceId),
          eq(cloudWorkspaceMembers.userId, user.id)
        ),
      });
      
      if (!membership && !workspace.isPublic) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      role = membership?.role || (workspace.isPublic ? 'viewer' : null);
    }

    // Get members
    const members = await db.query.cloudWorkspaceMembers.findMany({
      where: eq(cloudWorkspaceMembers.workspaceId, workspaceId),
      with: {
        user: true,
      },
    });

    // Get owner info
    const owner = await db.query.users.findFirst({
      where: eq(users.id, workspace.ownerId),
    });

    // Get file count
    const files = await db.query.cloudFiles.findMany({
      where: eq(cloudFiles.workspaceId, workspaceId),
    });

    // Get folder count
    const folders = await db.query.cloudFolders.findMany({
      where: eq(cloudFolders.workspaceId, workspaceId),
    });

    // Get recent activity
    const recentActivity = await db.query.cloudActivityLog.findMany({
      where: eq(cloudActivityLog.workspaceId, workspaceId),
      orderBy: [desc(cloudActivityLog.createdAt)],
      limit: 10,
    });

    return NextResponse.json({
      workspace: {
        ...workspace,
        role,
        owner: owner ? { id: owner.id, email: owner.email } : null,
        members: members.map(m => ({
          id: m.id,
          userId: m.userId,
          email: m.user.email,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
        stats: {
          fileCount: files.length,
          folderCount: folders.length,
          totalSize: files.reduce((acc, f) => acc + f.size, 0),
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/cloud/workspaces/[id] - Update workspace
export async function PATCH(
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

    // Get workspace and check ownership
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const isOwner = workspace.ownerId === user.id;
    let canEdit = isOwner;

    if (!isOwner) {
      const membership = await db.query.cloudWorkspaceMembers.findFirst({
        where: and(
          eq(cloudWorkspaceMembers.workspaceId, workspaceId),
          eq(cloudWorkspaceMembers.userId, user.id)
        ),
      });
      canEdit = membership?.role === 'admin';
    }

    if (!canEdit) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, isPublic, tags, settings } = body;

    const [updatedWorkspace] = await db
      .update(cloudWorkspaces)
      .set({
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isPublic !== undefined && { isPublic }),
        ...(tags && { tags }),
        ...(settings && { settings }),
        updatedAt: new Date(),
      })
      .where(eq(cloudWorkspaces.id, workspaceId))
      .returning();

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cloud/workspaces/[id] - Delete workspace
export async function DELETE(
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

    // Get workspace and check ownership
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Only owner can delete
    if (workspace.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only workspace owner can delete' }, { status: 403 });
    }

    // Delete workspace (cascade will handle related records)
    await db.delete(cloudWorkspaces).where(eq(cloudWorkspaces.id, workspaceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
