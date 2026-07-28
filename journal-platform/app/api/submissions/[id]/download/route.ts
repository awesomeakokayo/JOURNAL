import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getDownloadUrl } from "@vercel/blob";
import jwt from "jsonwebtoken";

async function getAdminFromRequest(req: NextRequest) {
  const token =
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    req.nextUrl.searchParams.get("token");
  if (!token) return null;
  try {
    const secret = process.env.ADMIN_JWT_SECRET || "fallback-secret";
    const payload = jwt.verify(token, secret) as { username: string };
    return payload.username === process.env.ADMIN_USERNAME ? payload : null;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const admin = await getAdminFromRequest(req);
    const session = await auth();
    const isOwner = session?.user?.id === submission.submittedById;

    if (!admin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = getDownloadUrl(submission.filePath);

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    const fileName = submission.originalFilename || "submission.pdf";

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
