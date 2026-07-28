import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { submitSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const volume = searchParams.get("volume");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { authors: { contains: q, mode: "insensitive" } },
        { abstract: { contains: q, mode: "insensitive" } },
      ];
    }

    if (volume) {
      where.volume = volume;
    }

    const [journals, total] = await Promise.all([
      prisma.journal.findMany({
        where,
        orderBy: { uploadDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.journal.count({ where }),
    ]);

    return NextResponse.json({
      journals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, and DOCX files are accepted" },
        { status: 400 }
      );
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File must be under 15MB" },
        { status: 400 }
      );
    }

    const parsed = submitSchema.safeParse({
      title: formData.get("title"),
      authors: formData.get("authors"),
      abstract: formData.get("abstract"),
      volume: formData.get("volume") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, authors, abstract, volume } = parsed.data;

    const ext = file.name.split(".").pop() || file.name.split(".").slice(-1)[0];
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const blob = await put(`submissions/${fileName}`, file, {
      access: "public",
    });

    const submission = await prisma.submission.create({
      data: {
        title,
        authors,
        abstract,
        filePath: blob.url,
        originalFilename: file.name,
        volume: volume || null,
        submittedById: session.user.id,
        status: "pending",
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Submission failed" },
      { status: 500 }
    );
  }
}
