"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/journal-types";

export default function AdminUploadPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const token = localStorage.getItem("admin_token");

    const res = await fetch("/api/admin/journals", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Upload failed");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-primary text-center mb-8">
        Upload Published Journal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-gray-200 p-6 space-y-5"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="abstract" className="block text-sm font-medium mb-1">
            Abstract
          </label>
          <textarea
            id="abstract"
            name="abstract"
            required
            rows={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent resize-y"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-1">
            Upload PDF
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            accept=".pdf,application/pdf"
            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium file:cursor-pointer"
          />
          <p className="text-text-muted text-xs mt-1">
            Maximum file size: 15MB. PDF only.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-primary font-semibold py-3 rounded hover:bg-accent-light transition-colors disabled:opacity-50 cursor-pointer text-lg"
        >
          {loading ? "Uploading..." : "Publish Journal"}
        </button>
      </form>
    </div>
  );
}
