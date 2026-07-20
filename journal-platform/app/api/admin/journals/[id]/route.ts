import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { put, del } from "@vercel/blob";
import { approvePublishSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action === "approve-publish") {
      const parsed = approvePublishSchema.safeParse({ submissionId: id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const submission = await prisma.submission.findUnique({ where: { id } });
      if (!submission) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      if (submission.status !== "pending") {
        return NextResponse.json(
          { error: "Submission already processed" },
          { status: 400 }
        );
      }

      const fileName = submission.filePath.split("/").pop();
      const journalFilePath = `journals/${fileName}`;

      let blobUrl = submission.filePath;
      try {
        const response = await fetch(submission.filePath);
        if (response.ok) {
          const fileBuffer = await response.arrayBuffer();
          const blob = await put(journalFilePath, fileBuffer, {
            access: "public",
          });
          blobUrl = blob.url;
        }
      } catch {
        return NextResponse.json(
          { error: "Failed to copy submission file" },
          { status: 500 }
        );
      }

      await prisma.journal.create({
        data: {
          title: submission.title,
          authors: submission.authors,
          abstract: submission.abstract,
          filePath: blobUrl,
          originalFilename: submission.originalFilename,
          category: submission.category,
          submissionId: submission.id,
        },
      });

      await prisma.submission.update({
        where: { id },
        data: {
          status: "approved",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    if (body.action === "reject") {
      const submission = await prisma.submission.findUnique({ where: { id } });
      if (!submission) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      await prisma.submission.update({
        where: { id },
        data: {
          status: "rejected",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const journal = await prisma.journal.findUnique({ where: { id } });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    try {
      await del(journal.filePath);
    } catch {
      // blob delete failure is non-fatal
    }

    await prisma.journal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete journal" },
      { status: 500 }
    );
  }
}
