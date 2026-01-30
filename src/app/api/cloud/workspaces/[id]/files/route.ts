import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, cloudWorkspaces, cloudWorkspaceMembers, cloudFiles, cloudFolders, cloudActivityLog } from '@/lib/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// GET /api/cloud/workspaces/[id]/files - Get workspace files
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
    const folderId = searchParams.get('folderId');
    const fileType = searchParams.get('type');

    // Verify workspace access
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check access
    const isOwner = workspace.ownerId === user.id;
    if (!isOwner && !workspace.isPublic) {
      const membership = await db.query.cloudWorkspaceMembers.findFirst({
        where: and(
          eq(cloudWorkspaceMembers.workspaceId, workspaceId),
          eq(cloudWorkspaceMembers.userId, user.id)
        ),
      });
      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get files
    let files;
    if (folderId === 'root' || folderId === null) {
      files = await db.query.cloudFiles.findMany({
        where: and(
          eq(cloudFiles.workspaceId, workspaceId),
          isNull(cloudFiles.folderId)
        ),
        orderBy: [desc(cloudFiles.updatedAt)],
        with: {
          uploader: true,
        },
      });
    } else if (folderId) {
      files = await db.query.cloudFiles.findMany({
        where: and(
          eq(cloudFiles.workspaceId, workspaceId),
          eq(cloudFiles.folderId, folderId)
        ),
        orderBy: [desc(cloudFiles.updatedAt)],
        with: {
          uploader: true,
        },
      });
    } else {
      files = await db.query.cloudFiles.findMany({
        where: eq(cloudFiles.workspaceId, workspaceId),
        orderBy: [desc(cloudFiles.updatedAt)],
        with: {
          uploader: true,
        },
      });
    }

    // Filter by type if specified
    if (fileType) {
      files = files.filter(f => f.fileType === fileType);
    }

    // Get folders in current location
    let folders;
    if (folderId === 'root' || folderId === null) {
      folders = await db.query.cloudFolders.findMany({
        where: and(
          eq(cloudFolders.workspaceId, workspaceId),
          isNull(cloudFolders.parentId)
        ),
        orderBy: [desc(cloudFolders.updatedAt)],
      });
    } else if (folderId) {
      folders = await db.query.cloudFolders.findMany({
        where: and(
          eq(cloudFolders.workspaceId, workspaceId),
          eq(cloudFolders.parentId, folderId)
        ),
        orderBy: [desc(cloudFolders.updatedAt)],
      });
    } else {
      folders = await db.query.cloudFolders.findMany({
        where: eq(cloudFolders.workspaceId, workspaceId),
        orderBy: [desc(cloudFolders.updatedAt)],
      });
    }

    return NextResponse.json({
      files: files.map(f => ({
        ...f,
        uploaderEmail: f.uploader?.email,
      })),
      folders,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cloud/workspaces/[id]/files?fileId=xxx - Delete file
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
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Get file
    const file = await db.query.cloudFiles.findFirst({
      where: and(
        eq(cloudFiles.id, fileId),
        eq(cloudFiles.workspaceId, workspaceId)
      ),
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permission (owner, admin, editor, or uploader)
    const workspace = await db.query.cloudWorkspaces.findFirst({
      where: eq(cloudWorkspaces.id, workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const isOwner = workspace.ownerId === user.id;
    const isUploader = file.uploadedBy === user.id;
    let canDelete = isOwner || isUploader;

    if (!canDelete) {
      const membership = await db.query.cloudWorkspaceMembers.findFirst({
        where: and(
          eq(cloudWorkspaceMembers.workspaceId, workspaceId),
          eq(cloudWorkspaceMembers.userId, user.id)
        ),
      });
      canDelete = membership?.role === 'admin' || membership?.role === 'editor';
    }

    if (!canDelete) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Delete from UploadThing
    try {
      await utapi.deleteFiles(file.uploadthingKey);
    } catch (e) {
      console.error('Failed to delete from UploadThing:', e);
    }

    // Delete from database
    await db.delete(cloudFiles).where(eq(cloudFiles.id, fileId));

    // Update workspace storage
    await db.execute(
      `UPDATE cloud_workspaces SET storage_used = storage_used - ${file.size} WHERE id = '${workspaceId}'`
    );

    // Log activity
    await db.insert(cloudActivityLog).values({
      workspaceId,
      userId: user.id,
      action: 'delete',
      targetType: 'file',
      targetId: fileId,
      targetName: file.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
