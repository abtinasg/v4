import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, cloudWorkspaces, cloudWorkspaceMembers, cloudFolders, cloudFiles, cloudActivityLog } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

// GET /api/cloud/workspaces/[id]/folders - Get folders in workspace
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
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    // Verify access
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const isOwner = workspace.ownerId === user.id;
    const isMember = await db.query.cloudWorkspaceMembers.findFirst({
      where: and(
        eq(cloudWorkspaceMembers.workspaceId, workspaceId),
        eq(cloudWorkspaceMembers.userId, user.id)
      ),
    });

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get folders
    const folders = await db.query.cloudFolders.findMany({
      where: and(
        eq(cloudFolders.workspaceId, workspaceId),
        parentId ? eq(cloudFolders.parentId, parentId) : isNull(cloudFolders.parentId)
      ),
      orderBy: (folders, { desc }) => [desc(folders.updatedAt)],
    });

    // Get file counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await db
          .select()
          .from(cloudFiles)
          .where(eq(cloudFiles.folderId, folder.id));
        
        return {
          ...folder,
          fileCount: fileCount.length,
        };
      })
    );

    return NextResponse.json({ folders: foldersWithCounts });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cloud/workspaces/[id]/folders - Create folder
export async function POST(
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
    const body = await request.json();
    const { name, parentId, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Folder name required' }, { status: 400 });
    }

    // Verify access
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const isOwner = workspace.ownerId === user.id;
    const member = await db.query.cloudWorkspaceMembers.findFirst({
      where: and(
        eq(cloudWorkspaceMembers.workspaceId, workspaceId),
        eq(cloudWorkspaceMembers.userId, user.id)
      ),
    });

    if (!isOwner && !member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check permission (viewers can't create folders)
    if (member?.role === 'viewer') {
      return NextResponse.json({ error: 'Viewers cannot create folders' }, { status: 403 });
    }

    // Create folder
    const [newFolder] = await db.insert(cloudFolders).values({
      workspaceId,
      parentId: parentId || null,
      name,
      color: color || 'indigo',
      createdBy: user.id,
    }).returning();

    // Log activity
    await db.insert(cloudActivityLog).values({
      workspaceId,
      userId: user.id,
      action: 'create',
      targetType: 'folder',
      targetId: newFolder.id,
      targetName: name,
    });

    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
