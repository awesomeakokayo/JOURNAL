"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Submission {
  id: string;
  title: string;
  authors: string;
  volume: string | null;
  status: string;
  filePath: string;
  originalFilename: string | null;
  submittedBy: { fullName: string; email: string };
  submittedAt: string;
}

interface PublishedJournal {
  id: string;
  title: string;
  authors: string;
  volume: string | null;
  originalFilename: string | null;
  uploadDate: string;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("admin_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [journals, setJournals] = useState<PublishedJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const fetchSubmissions = useCallback(
    async (status = "pending") => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/journals?status=${status}`, {
          headers: authHeaders(),
        });
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch {
        setSubmissions([]);
      }
      setLoading(false);
    },
    [router]
  );

  const fetchJournals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/journals?status=published", {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setJournals(data.journals || []);
    } catch {
      setJournals([]);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    if (filter === "published") {
      fetchJournals();
    } else {
      fetchSubmissions(filter);
    }
  }, [filter, fetchSubmissions, fetchJournals, router]);

  async function handleApprove(id: string) {
    const res = await fetch(`/api/admin/journals/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ action: "approve-publish" }),
    });
    if (res.ok) {
      fetchSubmissions(filter);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to approve");
    }
  }

  async function handleReject(id: string) {
    const res = await fetch(`/api/admin/journals/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ action: "reject" }),
    });
    if (res.ok) {
      fetchSubmissions(filter);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this permanently?")) return;
    const res = await fetch(`/api/admin/journals/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      if (filter === "published") {
        fetchJournals();
      } else {
        fetchSubmissions(filter);
      }
    } else {
      const data = await res.json();
      alert(data.error || "Delete failed");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-8">
        {filter === "published" ? "Published Journals" : "Submission Queue"}
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {["pending", "approved", "rejected", "published"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
              filter === s
                ? "bg-primary text-white"
                : "bg-gray-200 text-text hover:bg-gray-300"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-muted text-center py-8">Loading...</p>
      ) : filter === "published" ? (
        journals.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded border border-gray-200">
            <p className="text-text-muted text-lg">No published journals found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {journals.map((j) => (
              <div
                key={j.id}
                className="bg-surface rounded-lg border border-gray-200 p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h2 className="font-serif text-lg font-semibold text-primary">
                      {j.title}
                    </h2>
                    <p className="text-text-muted text-sm">{j.authors}</p>
                    {j.volume && (
                      <span className="inline-block mt-2 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-medium">
                        {j.volume}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                    <button
                      onClick={() => {
                        const token = localStorage.getItem("admin_token");
                        window.open(
                          `/api/journals/${j.id}/download?token=${token}`,
                          "_blank"
                        );
                      }}
                      className="text-primary underline text-xs hover:text-primary-light cursor-pointer"
                    >
                      Download
                    </button>
                    <a
                      href={`/admin/journals/${j.id}/edit`}
                      className="text-accent underline text-xs hover:text-accent-light cursor-pointer inline-flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(j.id)}
                      className="text-danger underline text-xs hover:opacity-80 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-text-muted text-xs mt-3">
                  Published{" "}
                  {new Date(j.uploadDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded border border-gray-200">
          <p className="text-text-muted text-lg">
            No {filter} submissions found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="bg-surface rounded-lg border border-gray-200 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h2 className="font-serif text-lg font-semibold text-primary">
                    {s.title}
                  </h2>
                  <p className="text-text-muted text-sm">{s.authors}</p>
                  <p className="text-text-muted text-xs mt-1">
                    by {s.submittedBy.fullName} ({s.submittedBy.email})
                  </p>
                  {s.volume && (
                    <span className="inline-block mt-2 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-medium">
                      {s.volume}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                  {s.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="bg-success text-white text-xs font-medium px-4 py-1.5 rounded hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleReject(s.id)}
                        className="bg-danger text-white text-xs font-medium px-4 py-1.5 rounded hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      const token = localStorage.getItem("admin_token");
                      window.open(
                        `/api/submissions/${s.id}/download?token=${token}`,
                        "_blank"
                      );
                    }}
                    className="text-primary underline text-xs hover:text-primary-light cursor-pointer"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-danger underline text-xs hover:opacity-80 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-text-muted text-xs mt-3">
                Submitted{" "}
                {new Date(s.submittedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
