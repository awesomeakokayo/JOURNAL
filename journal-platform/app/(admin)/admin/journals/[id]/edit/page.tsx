"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Journal {
  id: string;
  title: string;
  authors: string;
  abstract: string | null;
  volume: string | null;
}

export default function EditJournalPage() {
  const params = useParams();
  const router = useRouter();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!journal) return;
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await adminFetch(`/api/admin/journals/${journal.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        action: "update",
        title: form.get("title"),
        authors: form.get("authors"),
        abstract: form.get("abstract"),
        volume: form.get("volume") || null,
      }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Update failed");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
        <p className="text-text-muted text-center">Loading...</p>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
        <p className="text-text-muted text-center">Journal not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
      <Link
        href="/admin"
        className="text-text-muted hover:text-primary text-sm mb-4 inline-block"
      >
        &larr; Back to Admin
      </Link>

      <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-8">
        Edit Journal
      </h1>

      <form
        onSubmit={handleSave}
        className="bg-surface rounded-lg border border-gray-200 p-4 md:p-6 space-y-5"
      >
        {error && (
          <div className="bg-danger/10 text-danger text-sm px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Paper Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={journal.title}
            disabled={saving}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="authors" className="block text-sm font-medium mb-1">
            Author Name(s)
          </label>
          <input
            id="authors"
            name="authors"
            type="text"
            required
            defaultValue={journal.authors}
            disabled={saving}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="abstract" className="block text-sm font-medium mb-1">
            Abstract
          </label>
          <textarea
            id="abstract"
            name="abstract"
            rows={6}
            defaultValue={journal.abstract || ""}
            disabled={saving}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent resize-y disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="volume" className="block text-sm font-medium mb-1">
            Volume <span className="text-text-muted">(optional)</span>
          </label>
          <input
            id="volume"
            name="volume"
            type="text"
            defaultValue={journal.volume || ""}
            disabled={saving}
            placeholder="e.g., Vol. 1, No. 1"
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent text-primary font-semibold py-3 rounded hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
