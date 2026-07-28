import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getJournalsByVolume() {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { uploadDate: "desc" },
      take: 500,
    });

    const grouped: Record<string, typeof journals> = {};
    for (const j of journals) {
      const vol = j.volume || "Uncategorized";
      if (!grouped[vol]) grouped[vol] = [];
      grouped[vol].push(j);
    }

    return grouped;
  } catch {
    return {};
  }
}

export default async function ArchivesPage() {
  const grouped = await getJournalsByVolume();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-primary mb-8">
        Archives
      </h1>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-surface rounded border border-gray-200">
          <p className="text-text-muted text-lg">No journals published yet.</p>
        </div>
      ) : (
        <div className="grid gap-10">
          {Object.entries(grouped).map(([vol, journals]) => (
            <section key={vol}>
              <h2 className="font-serif text-2xl font-semibold text-primary mb-4 border-b border-gray-200 pb-2">
                {vol}
                <span className="text-text-muted text-base font-normal ml-2">
                  ({journals.length} journal{journals.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <div className="grid gap-4">
                {journals.map((j) => (
                  <Link
                    key={j.id}
                    href={`/journals/${j.id}`}
                    className="block bg-surface rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-serif text-lg font-semibold text-primary mb-1">
                      {j.title}
                    </h3>
                    <p className="text-text-muted text-sm mb-2">{j.authors}</p>
                    {j.abstract && (
                      <p className="text-text-muted text-sm line-clamp-2">
                        {j.abstract}
                      </p>
                    )}
                    <p className="text-text-muted text-xs mt-2">
                      {new Date(j.uploadDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
