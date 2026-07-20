import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getRecentJournals() {
  try {
    return await prisma.journal.findMany({
      orderBy: { uploadDate: "desc" },
      take: 5,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const journals = await getRecentJournals();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
          Coal City University Journal of Education
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto mb-8">
          A peer-reviewed academic journal dedicated to advancing knowledge in
          education, research, and scholarly discourse.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/current"
            className="bg-primary text-white font-semibold px-6 py-3 rounded hover:bg-primary-light transition-colors"
          >
            Browse Current Issue
          </Link>
          <Link
            href="/submit"
            className="bg-accent text-primary font-semibold px-6 py-3 rounded hover:bg-accent-light transition-colors"
          >
            Submit Your Work
          </Link>
        </div>
      </section>

      {/* Recent Journals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-primary">
            Recently Published
          </h2>
          <Link
            href="/current"
            className="text-primary underline underline-offset-2 hover:text-primary-light"
          >
            View all
          </Link>
        </div>
        {journals.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded border border-gray-200">
            <p className="text-text-muted text-lg">
              No journals published yet.
            </p>
            <p className="text-text-muted mt-1">
              Check back soon for new publications.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {journals.map((j) => (
              <Link
                key={j.id}
                href={`/journals/${j.id}`}
                className="block bg-surface rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-serif text-xl font-semibold text-primary mb-2">
                  {j.title}
                </h3>
                <p className="text-text-muted text-sm mb-2">{j.authors}</p>
                {j.abstract && (
                  <p className="text-text-muted line-clamp-3 mb-3">
                    {j.abstract}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  {j.category && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                      {j.category}
                    </span>
                  )}
                  <span className="text-text-muted">
                    {new Date(j.uploadDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
