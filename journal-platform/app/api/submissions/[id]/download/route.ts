import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import jwt from "jsonwebtoken";

function extractPathname(blobUrl: string): string {
  return new URL(blobUrl).pathname.slice(1);
}

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

    const pathname = extractPathname(submission.filePath);
    const signedToken = await issueSignedToken({
      pathname,
      operations: ["get"],
    });
    const { presignedUrl } = await presignUrl(signedToken, {
      access: "private",
      operation: "get",
      pathname,
    });
    return NextResponse.redirect(presignedUrl);
  } catch {
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
