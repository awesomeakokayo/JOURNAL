"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Journal {
  id: string;
  title: string;
  authors: string;
  volume: string | null;
  abstract: string | null;
  filePath: string;
  uploadDate: string;
}

export default function AdminJournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);

  async function adminFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem("admin_token");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });
  }

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    async function fetchJournal() {
      try {
        const res = await fetch(`/api/journals/${params.id}`);
        if (res.ok) {
          setJournal(await res.json());
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchJournal();
  }, [params.id, router]);

  async function handleDelete() {
    if (!confirm("Delete this journal permanently?")) return;

    const res = await adminFetch(`/api/admin/journals/${params.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      alert(data.error || "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-text-muted text-center">Loading...</p>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-text-muted text-center">Journal not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
            href={`/api/journals/${journal.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-primary font-semibold px-5 py-2 rounded hover:bg-accent-light transition-colors"
          >
            View PDF
          </a>
          <button
            onClick={handleDelete}
            className="bg-danger text-white font-semibold px-5 py-2 rounded hover:opacity-90 transition-opacity cursor-pointer"
          >
            Delete
          </button>
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
