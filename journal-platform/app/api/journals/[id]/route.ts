import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueSignedToken, presignUrl } from "@vercel/blob";

function extractPathname(blobUrl: string): string {
  return new URL(blobUrl).pathname.slice(1);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const journal = await prisma.journal.findUnique({ where: { id } });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    const pathname = extractPathname(journal.filePath);
    const signedToken = await issueSignedToken({
      pathname,
      operations: ["get"],
    });
    const { presignedUrl } = await presignUrl(signedToken, {
      access: "private",
      operation: "get",
      pathname,
    });

    return NextResponse.json({ ...journal, filePath: presignedUrl });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch journal" },
      { status: 500 }
    );
  }
}
