import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/journal-types";

async function getJournals(searchParams: {
  q?: string;
  category?: string;
  page?: string;
}) {
  try {
    const q = searchParams.q?.trim();
    const category = searchParams.category?.trim();
    const page = parseInt(searchParams.page || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { authors: { contains: q, mode: "insensitive" } },
        { abstract: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      where.category = category;
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

    return {
      journals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      q: q || "",
      selectedCategory: category || "",
    };
  } catch {
    return {
      journals: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      q: searchParams.q?.trim() || "",
      selectedCategory: searchParams.category?.trim() || "",
    };
  }
}

export default async function CurrentPage(props: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { journals, pagination, q, selectedCategory } =
    await getJournals(searchParams);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-primary mb-8">
        Current Issue
      </h1>

      {/* Search & Filter */}
      <form
        method="GET"
        action="/current"
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by title, author, or keyword..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          name="category"
          defaultValue={selectedCategory}
          className="px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary text-white font-semibold px-6 py-2.5 rounded hover:bg-primary-light transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {journals.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded border border-gray-200">
          <p className="text-text-muted text-lg">No journals found.</p>
          <p className="text-text-muted mt-1">Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {journals.map((j) => (
              <Link
                key={j.id}
                href={`/journals/${j.id}`}
                className="block bg-surface rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="font-serif text-xl font-semibold text-primary mb-2">
                  {j.title}
                </h2>
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (p) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (selectedCategory) params.set("category", selectedCategory);
                  params.set("page", String(p));
                  return (
                    <Link
                      key={p}
                      href={`/current?${params.toString()}`}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${
                        p === pagination.page
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-primary hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                }
              )}
            </div>
          )}

          <p className="text-center text-text-muted text-sm mt-4">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} journals
          </p>
        </>
      )}
    </div>
  );
}
