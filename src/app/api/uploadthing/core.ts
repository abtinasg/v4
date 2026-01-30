import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, cloudFiles, cloudWorkspaces, cloudWorkspaceMembers, cloudActivityLog } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";

const f = createUploadthing();

// Check if user has access to workspace
async function checkWorkspaceAccess(userId: string, workspaceId: string) {
  const workspace = await db.query.cloudWorkspaces.findFirst({
    where: eq(cloudWorkspaces.id, workspaceId),
  });
  
  if (!workspace) return null;
  
  // Check if owner
  if (workspace.ownerId === userId) return { workspace, role: 'owner' as const };
  
  // Check if member
  const member = await db.query.cloudWorkspaceMembers.findFirst({
    where: and(
      eq(cloudWorkspaceMembers.workspaceId, workspaceId),
      eq(cloudWorkspaceMembers.userId, userId)
    ),
  });
  
  if (member) return { workspace, role: member.role };
  
  return null;
}

// Determine file type from mime type
function getFileType(mimeType: string): 'paper' | 'dataset' | 'reference' | 'figure' | 'presentation' | 'code' | 'other' {
  if (mimeType.includes('pdf') || mimeType.includes('latex') || mimeType.includes('tex')) return 'paper';
  if (mimeType.includes('csv') || mimeType.includes('json') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'dataset';
  if (mimeType.includes('image')) return 'figure';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('javascript') || mimeType.includes('python') || mimeType.includes('text/x-')) return 'code';
  return 'other';
}

export const ourFileRouter = {
  // Research file uploader - supports various research file types
  researchFileUploader: f({
    pdf: { maxFileSize: "64MB", maxFileCount: 10 },
    image: { maxFileSize: "16MB", maxFileCount: 20 },
    text: { maxFileSize: "8MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "32MB", maxFileCount: 5 },
    "application/vnd.ms-excel": { maxFileSize: "32MB", maxFileCount: 5 },
    "text/csv": { maxFileSize: "32MB", maxFileCount: 10 },
    "application/json": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/zip": { maxFileSize: "128MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const { userId: clerkId } = await auth();
      if (!clerkId) throw new Error("Unauthorized");
      
      // Get workspace ID from headers
      const workspaceId = req.headers.get("x-workspace-id");
      const folderId = req.headers.get("x-folder-id");
      
      if (!workspaceId) throw new Error("Workspace ID required");
      
      // Get user from database
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });
      
      if (!user) throw new Error("User not found");
      
      // Check workspace access
      const access = await checkWorkspaceAccess(user.id, workspaceId);
      if (!access) throw new Error("No access to workspace");
      if (access.role === 'viewer') throw new Error("Viewers cannot upload files");
      
      return { userId: user.id, workspaceId, folderId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const extension = file.name.split('.').pop() || '';
      const fileType = getFileType(file.type);
      
      // Create file record in database
      const [newFile] = await db.insert(cloudFiles).values({
        workspaceId: metadata.workspaceId,
        folderId: metadata.folderId || null,
        name: file.name,
        fileType,
        mimeType: file.type,
        extension,
        size: file.size,
        uploadthingKey: file.key,
        uploadthingUrl: file.url,
        uploadedBy: metadata.userId,
      }).returning();
      
      // Update workspace storage
      await db.execute(
        `UPDATE cloud_workspaces SET storage_used = storage_used + ${file.size} WHERE id = '${metadata.workspaceId}'`
      );
      
      // Log activity
      await db.insert(cloudActivityLog).values({
        workspaceId: metadata.workspaceId,
        userId: metadata.userId,
        action: 'upload',
        targetType: 'file',
        targetId: newFile.id,
        targetName: file.name,
        metadata: { size: file.size, type: file.type },
      });
      
      return { fileId: newFile.id, url: file.url };
    }),
    
  // Dataset uploader - for large research datasets
  datasetUploader: f({
    "text/csv": { maxFileSize: "256MB", maxFileCount: 5 },
    "application/json": { maxFileSize: "128MB", maxFileCount: 5 },
    "application/zip": { maxFileSize: "512MB", maxFileCount: 2 },
    "application/x-hdf": { maxFileSize: "512MB", maxFileCount: 2 },
    "application/parquet": { maxFileSize: "256MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const { userId: clerkId } = await auth();
      if (!clerkId) throw new Error("Unauthorized");
      
      const workspaceId = req.headers.get("x-workspace-id");
      const folderId = req.headers.get("x-folder-id");
      
      if (!workspaceId) throw new Error("Workspace ID required");
      
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });
      
      if (!user) throw new Error("User not found");
      
      const access = await checkWorkspaceAccess(user.id, workspaceId);
      if (!access) throw new Error("No access to workspace");
      if (access.role === 'viewer') throw new Error("Viewers cannot upload files");
      
      return { userId: user.id, workspaceId, folderId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const extension = file.name.split('.').pop() || '';
      
      const [newFile] = await db.insert(cloudFiles).values({
        workspaceId: metadata.workspaceId,
        folderId: metadata.folderId || null,
        name: file.name,
        fileType: 'dataset',
        mimeType: file.type,
        extension,
        size: file.size,
        uploadthingKey: file.key,
        uploadthingUrl: file.url,
        uploadedBy: metadata.userId,
      }).returning();
      
      await db.execute(
        `UPDATE cloud_workspaces SET storage_used = storage_used + ${file.size} WHERE id = '${metadata.workspaceId}'`
      );
      
      await db.insert(cloudActivityLog).values({
        workspaceId: metadata.workspaceId,
        userId: metadata.userId,
        action: 'upload',
        targetType: 'file',
        targetId: newFile.id,
        targetName: file.name,
        metadata: { size: file.size, type: 'dataset' },
      });
      
      return { fileId: newFile.id, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
