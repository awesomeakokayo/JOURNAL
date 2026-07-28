import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getRecentJournals() {
  try {
    return await prisma.journal.findMany({
      orderBy: { uploadDate: "desc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const journals = await getRecentJournals();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
      {/* Search Bar */}
      <form method="GET" action="/current" className="mb-12">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            name="q"
            placeholder="Search by title or author..."
            className="w-full pl-12 pr-4 py-3 md:py-4 border border-gray-300 rounded-lg text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </form>

      {/* Current Issue */}
      <section>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
          Current Issue
        </h1>
        <p className="text-text-muted mb-8">
          Recently published journals from CCU researchers.
        </p>

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
          <div className="grid gap-5">
            {journals.map((j) => (
              <Link
                key={j.id}
                href={`/journals/${j.id}`}
                className="block bg-surface rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="font-serif text-xl font-semibold text-primary mb-2 uppercase">
                  {j.title}
                </h2>
                <p className="text-text-muted text-sm mb-1">{j.authors}</p>
                {j.abstract && (
                  <p className="text-text-muted text-sm line-clamp-2 mt-2">
                    {j.abstract}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm mt-3">
                  {j.volume && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                      {j.volume}
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
