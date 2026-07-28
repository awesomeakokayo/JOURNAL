import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { issueSignedToken, presignUrl } from "@vercel/blob";

function extractPathname(blobUrl: string): string {
  return new URL(blobUrl).pathname.slice(1);
}

async function getJournal(id: string) {
  try {
    const journal = await prisma.journal.findUnique({ where: { id } });
    if (!journal) notFound();

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

    return { ...journal, signedUrl: presignedUrl };
  } catch {
    notFound();
  }
}

export default async function JournalDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const journal = await getJournal(id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/current"
        className="text-text-muted hover:text-primary text-sm mb-4 inline-block"
      >
        &larr; Back to Journals
      </Link>

      <article className="bg-surface rounded-lg border border-gray-200 p-8">
        <h1 className="font-serif text-3xl font-bold text-primary mb-3">
          {journal.title}
        </h1>
        <p className="text-text-muted text-lg mb-4">{journal.authors}</p>

        {journal.volume && (
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            {journal.volume}
          </span>
        )}

        {journal.abstract && (
          <section className="mb-6">
            <h2 className="font-serif text-xl font-semibold text-primary mb-3">
              Abstract
            </h2>
            <p className="text-text leading-relaxed">{journal.abstract}</p>
          </section>
        )}

        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
          <a
            href={journal.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-6 py-2.5 rounded hover:bg-accent-light transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </a>
          <a
            href={journal.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary-light text-sm"
          >
            View Online
          </a>
        </div>

        <p className="text-text-muted text-xs mt-4">
          Published{" "}
          {new Date(journal.uploadDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </article>
    </div>
  );
}
