import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getSubmissions(userId: string) {
  try {
    return await prisma.submission.findMany({
      where: { submittedById: userId },
      orderBy: { submittedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-text-muted text-lg">
          Please{" "}
          <Link href="/login" className="text-primary underline">
            sign in
          </Link>{" "}
          to view your dashboard.
        </p>
      </div>
    );
  }

  const submissions = await getSubmissions(session.user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            My Submissions
          </h1>
          <p className="text-text-muted mt-1">
            Welcome, {session.user.fullName}
          </p>
        </div>
        <Link
          href="/submit"
          className="bg-accent text-primary font-semibold px-5 py-2 rounded hover:bg-accent-light transition-colors"
        >
          New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded border border-gray-200">
          <p className="text-text-muted text-lg">
            You haven&apos;t submitted any papers yet.
          </p>
          <Link
            href="/submit"
            className="inline-block mt-4 bg-primary text-white font-semibold px-6 py-2.5 rounded hover:bg-primary-light transition-colors"
          >
            Submit Your First Paper
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="bg-surface rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-serif text-lg font-semibold text-primary">
                    {s.title}
                  </h2>
                  <p className="text-text-muted text-sm">{s.authors}</p>
                  {s.volume && (
                    <span className="inline-block mt-2 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-medium">
                      {s.volume}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${
                    s.status === "approved"
                      ? "bg-success/10 text-success"
                      : s.status === "rejected"
                      ? "bg-danger/10 text-danger"
                      : "bg-pending/10 text-pending"
                  }`}
                >
                  {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </span>
              </div>
              <p className="text-text-muted text-xs mt-3">
                Submitted{" "}
                {new Date(s.submittedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
