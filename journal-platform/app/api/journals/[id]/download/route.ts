import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { get } from "@vercel/blob";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const journal = await prisma.journal.findUnique({ where: { id } });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    const result = await get(journal.filePath, { access: "private" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    const fileName = journal.originalFilename || "journal.pdf";

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/pdf",
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
